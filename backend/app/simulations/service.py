from multiprocessing import Process
import os
import shutil
from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool
from app.simulations.repository import SimulationRepository
from app.sources.repository import SourceRepository
from app.shared.message import MessageResponse
from app.simulations.schema import SimulationBase, SimulationCreate, SimulationRead, SimulationUpdate
from app.shared.utils import get_gate_sim
import opengate as gate

import numpy as np
from scipy.spatial.transform import Rotation as R
from app.shared.primitives import UNIT_TO_GATE, Unit
from app.simulations.model import Simulation
from app.volumes.repository import VolumeRepository
from app.volumes.schema import VolumeRead
import SimpleITK as sitk
from leapctype import tomographicModels


class SimulationService:
    def __init__(self, simulation_repository: SimulationRepository):
        self.sim_repo = simulation_repository

    async def get_gate_sim_without_sources(self, sim_id: int) -> gate.Simulation:
        sim = await self.read_simulation(sim_id)
        gate_sim = gate.Simulation()
        gate_sim.from_json_file(f"{sim.output_dir}/{sim.json_archive_filename}")
        return gate_sim

    async def create_simulation(self, sim_create: SimulationCreate) -> MessageResponse:
        sim: SimulationRead = await self.sim_repo.create(sim_create)
        run_intervals = self._compute_run_timing_intervals(sim.num_runs, sim.run_len)
        gate_sim = gate.Simulation(
            name=sim.name,
            output_dir=sim.output_dir,
            json_archive_filename=sim.json_archive_filename,
            run_timing_intervals=run_intervals,
        )
        try:
            gate_sim.to_json_file()
        except OSError as e:
            raise HTTPException(500, detail=f"Failed to write simulation archive: {e}")
        return {"message": f"Simulation '{sim.name}' created successfully"}

    async def read_simulations(self) -> list[SimulationRead]:
        return await self.sim_repo.read_all()

    async def read_simulation(self, id: int) -> SimulationRead:
        sim: Simulation | None = await self.sim_repo.read(id)
        if not sim:
            raise HTTPException(
                status_code=404, detail=f"Simulation with id {id} not found"
            )
        return SimulationRead.model_validate(sim)

    async def update_simulation(
        self, id: int, sim_update: SimulationUpdate
    ) -> MessageResponse:
        existing_sim: SimulationRead = await self.read_simulation(id)
        self._handle_directory_rename(existing_sim, sim_update.name)
        updated_sim = await self.sim_repo.update(id, sim_update)
        run_intervals = self._compute_run_timing_intervals(updated_sim.num_runs, updated_sim.run_len)
        gate_sim = gate.Simulation(
            name=updated_sim.name,
            output_dir=updated_sim.output_dir,
            json_archive_filename=updated_sim.json_archive_filename,
            run_timing_intervals=run_intervals,
        )
        try:
            gate_sim.to_json_file()
        except OSError as e:
            raise HTTPException(500, detail=f"Failed to write simulation archive: {e}")
        return {"message": f"Simulation '{existing_sim.name}' updated successfully"}

    async def delete_simulation(self, id: int) -> MessageResponse:
        sim: SimulationRead | None = await self.sim_repo.delete(id)
        if not sim:
            raise HTTPException(
                status_code=404, detail=f"Simulation with id {id} not found"
            )
        if os.path.exists(sim.output_dir):
            shutil.rmtree(sim.output_dir)
        return {"message": f"Simulation '{sim.name}' deleted successfully"}

    async def import_simulation(self, id: int) -> MessageResponse:
        sim = await self.read_simulation(id)
        try:
            # TODO: GET .JSON FILE & CREATE A NEW SIMULATION
            gate_sim = gate.Simulation()
            gate_sim.from_json_file(f"{sim.output_dir}/{sim.json_archive_filename}")
        except KeyError as e:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Simulation JSON is invalid or out-of-sync: "
                    f"missing volume '{e.args[0]}' in archive."
                )
            )
        return {"message": "Simulation {sim.name} imported successfully!"}

    async def export_simulation(self, id: int) -> MessageResponse:
        sim = await self.read_simulation(id)
        output_dir = os.path.abspath(sim.output_dir)
        zip_path = f"{output_dir}.zip"

        if os.path.exists(zip_path):
            os.remove(zip_path)

        try:
            shutil.make_archive(base_name=output_dir, format="zip", root_dir=output_dir)
        except OSError as e:
            raise HTTPException(500, detail=f"Failed to compress outputs: {e}")

        return zip_path

    async def view_simulation(
        self, id: int,
        src_repo: SourceRepository,
        vol_repo: VolumeRepository
    ) -> MessageResponse:
        gate_sim: gate.Simulation = await get_gate_sim(id, self.sim_repo, src_repo, vol_repo)
        gate_sim.visu = True
        gate_sim.progress_bar = False
        gate_sim.run(start_new_process=True)
        return {"message": "Simulation visualization ended"}

    async def run_simulation(
        self, id: int, 
        src_repo: SourceRepository,
        vol_repo: VolumeRepository
    ) -> MessageResponse:
        gate_sim: gate.Simulation = await get_gate_sim(id, self.sim_repo, src_repo, vol_repo)
        gate_sim.visu = False
        gate_sim.progress_bar = True

        sim_read: SimulationRead = await self.read_simulation(id)

        for name in gate_sim.volume_manager.volume_names:
            vol = await vol_repo.read(id, name)
            data: VolumeRead = VolumeRead.model_validate(vol)
            vol = gate_sim.volume_manager.get_volume(data.name)
            if data.dynamic_params.enabled:
                sim_read = await self.read_simulation(id)
                num_runs = sim_read.num_runs

                angle_start = data.rotation.angle
                angle_end = data.dynamic_params.angle_end or angle_start
                angles = np.linspace(angle_start, angle_end, num_runs, endpoint=False)
                rotations = [
                    R.from_euler(data.rotation.axis.value, a, degrees=True).as_matrix()
                    for a in angles
                ]
                vol.add_dynamic_parametrisation(rotation=rotations)

        actor = sim_read.actor or {}

        attached_to = actor.attached_to
        spacing = [s * UNIT_TO_GATE[Unit.MM] for s in actor.spacing]
        size = actor.size
        origin = actor.origin_as_image_center

        if "Hits" not in gate_sim.actor_manager.actors.keys():
            hits_actor = gate_sim.add_actor("DigitizerHitsCollectionActor", "Hits")
            hits_actor.attached_to = attached_to
            hits_actor.attributes = ['TotalEnergyDeposit', 'PostPosition', 'GlobalTime']
            hits_actor.output_filename = 'output/hits.root'

        if "Projection" not in gate_sim.actor_manager.actors.keys():
            proj_actor = gate_sim.add_actor("DigitizerProjectionActor", "Projection")
            proj_actor.attached_to = attached_to
            proj_actor.input_digi_collections = ["Hits"]
            proj_actor.spacing = spacing
            proj_actor.size = size
            proj_actor.origin_as_image_center = origin
            proj_actor.output_filename = 'output/projection.mhd'

        gate_sim.run(start_new_process=True)
        return {"message": "Simulation finished running"}

    async def reconstruct_simulation(self, id: int, sod: float, sdd: float) -> str:
        sim = await self.read_simulation(id)
        proj_path = os.path.join(sim.output_dir, "output", "projection.mhd")
        if not os.path.exists(proj_path):
            raise HTTPException(404, detail=f"projection.mhd not found at {proj_path}")

        return await run_in_threadpool(
            self._do_recon,
            proj_path,
            sim.output_dir,
            sod,
            sdd
        )

    def _do_recon(
            self,
            proj_path: str,
            out_dir: str,
            sod: float,
            sdd: float
        ) -> str:
        proj_itk = sitk.ReadImage(proj_path)
        proj = sitk.GetArrayFromImage(proj_itk).astype(np.float32)

        NUM_ANGLES, NUM_ROWS, NUM_COLS = proj.shape
        PIX_W, PIX_H, _ = proj_itk.GetSpacing()
        SOD, SDD = sod, sdd

        ct = tomographicModels()
        phis = ct.setAngleArray(NUM_ANGLES, 360.0)

        ct.set_conebeam(
            numAngles=NUM_ANGLES,
            numRows=NUM_ROWS,
            numCols=NUM_COLS,
            pixelWidth=PIX_W,
            pixelHeight=PIX_H,
            centerRow=0.5*(NUM_ROWS-1),
            centerCol=0.5*(NUM_COLS-1),
            phis=phis,
            sod=SOD,
            sdd=SDD
        )

        ct.set_default_volume()

        g = proj.astype(np.float32)
        f = ct.allocate_volume()

        ct.FBP(g, f)

        recon_itk = sitk.GetImageFromArray(f)
        out_path = os.path.join(out_dir, "output", "reconstruction.mhd")
        sitk.WriteImage(recon_itk, out_path)

        return out_path

    @staticmethod
    def _handle_directory_rename(current, new_name: str) -> None:
        old_dir, new_dir = current.output_dir, f"./outputs/{new_name}"
        if old_dir != new_dir and os.path.exists(old_dir):
            os.rename(old_dir, new_dir)
            old_json = os.path.join(new_dir, current.json_archive_filename)
            if os.path.exists(old_json):
                os.remove(old_json)

    @staticmethod
    def _compute_run_timing_intervals(num_runs: int, run_len: float) -> list[list[float]]:
        return [
            [
                i * run_len * UNIT_TO_GATE[Unit.SEC],
                (i + 1) * run_len * UNIT_TO_GATE[Unit.SEC],
            ]
            for i in range(num_runs)
        ]
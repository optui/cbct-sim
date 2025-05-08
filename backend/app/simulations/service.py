import os
import shutil
from fastapi import HTTPException
from app.simulations.repository import SimulationRepository
from app.sources.repository import SourceRepository
from app.shared.message import MessageResponse
from app.simulations.schema import SimulationBase, SimulationCreate, SimulationRead, SimulationUpdate
from app.shared.utils import get_gate_sim
import opengate as gate

from app.shared.primitives import UNIT_TO_GATE, Unit


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
        await self.export_simulation(sim)
        return {"message": f"Simulation '{sim.name}' created successfully"}

    async def read_simulations(self) -> list[SimulationRead]:
        return await self.sim_repo.read_all()

    async def read_simulation(self, id: int) -> SimulationRead:
        sim: SimulationRead | None = await self.sim_repo.read(id)
        if not sim:
            raise HTTPException(
                status_code=404, detail=f"Simulation with id {id} not found"
            )
        return sim

    async def update_simulation(
        self, id: int, sim_update: SimulationUpdate
    ) -> MessageResponse:
        existing_sim: SimulationRead = await self.read_simulation(id)
        self._handle_directory_rename(existing_sim, sim_update.name)
        updated_sim = await self.sim_repo.update(id, sim_update)
        await self.export_simulation(updated_sim)
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

    async def export_simulation(self, sim: SimulationBase) -> MessageResponse:
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
        return {"message": "Simulation {sim.name} exported successfully!"}

    async def view_simulation(
        self, id: int, source_repository: SourceRepository
    ) -> MessageResponse:
        gate_sim = await get_gate_sim(id, self.sim_repo, source_repository)
        gate_sim.visu = True
        gate_sim.run(start_new_process=True)
        return {"message": "Simulation visualization ended"}

    async def run_simulation(
        self, id: int, source_repository: SourceRepository
    ) -> MessageResponse:
        gate_sim = await get_gate_sim(id, self.sim_repo, source_repository)
        gate_sim.visu = False
        gate_sim.progress_bar = True
        gate_sim.run(start_new_process=True)
        return {"message": "Simulation finished running"}

    @staticmethod
    def _handle_directory_rename(current, new_name: str) -> None:
        old_dir, new_dir = current.output_dir, f"./output/{new_name}"
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
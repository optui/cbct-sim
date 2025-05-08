# app/volumes/service.py

from fastapi import HTTPException
import numpy as np
from scipy.spatial.transform import Rotation as R

from app.simulations.service import SimulationService
from app.volumes.schema import (
    VolumeCreate,
    VolumeRead,
    VolumeShape,
    VolumeType,
    VolumeUpdate,
    BoxShape,
    SphereShape,
    DynamicParams
)
from app.volumes.repository import VolumeRepository
from app.shared.primitives import Unit, Rotation, Axis, UNIT_TO_GATE
from app.shared.message import MessageResponse
import opengate as gate
from opengate.geometry.volumes import VolumeBase


class VolumeService:
    def __init__(
        self,
        simulation_service: SimulationService,
        volume_repository: VolumeRepository,
    ):
        self.sim_service = simulation_service
        self.vol_repo    = volume_repository

    async def create_volume(self, sim_id: int, vol_create: VolumeCreate) -> MessageResponse:
        gate_sim: gate.Simulation = await self.sim_service.get_gate_sim_without_sources(sim_id)

        if vol_create.name in gate_sim.volume_manager.volume_names:
            raise HTTPException(
                status_code=409, detail=f"Volume '{vol_create.name}' already exists"
            )
        
        gate_vol: VolumeBase = gate_sim.add_volume(
            vol_create.shape.type.value,
            vol_create.name
        )

        # process the new volume into the Gate simulation
        await self._process_vol(sim_id, gate_vol, vol_create)

        # write out the updated Gate JSON
        gate_sim.to_json_file()

        # then persist to the database
        await self.vol_repo.create(sim_id, vol_create)

        return {"message": f"Volume '{vol_create.name}' created successfully"}

    async def _process_vol(self, sim_id: int, gate_vol: VolumeBase, vol: VolumeCreate | VolumeUpdate):
        # common logic for both create and update, using the Pydantic model `vol`
        gate_vol.mother = vol.mother
        gate_vol.material = vol.material

        translation_unit = UNIT_TO_GATE[vol.translation_unit]
        gate_vol.translation = [t * translation_unit for t in vol.translation]

        gate_vol.rotation = R.from_euler(
            vol.rotation.axis.value,
            vol.rotation.angle,
            degrees=True
        ).as_matrix()

        shape_unit = UNIT_TO_GATE[vol.shape.unit]
        match vol.shape:
            case BoxShape():
                gate_vol.size = [t * shape_unit for t in vol.shape.size]
            case SphereShape():
                gate_vol.rmin = vol.shape.rmin * shape_unit
                gate_vol.rmax = vol.shape.rmax * shape_unit

        if vol.dynamic_params.enabled:
            sim_read = await self.sim_service.read_simulation(sim_id)
            num_runs = sim_read.num_runs

            angle_start = vol.rotation.angle
            angle_end = vol.dynamic_params.angle_end or angle_start
            angles = np.linspace(angle_start, angle_end, num_runs)
            rotations = [
                R.from_euler(vol.rotation.axis.value, a, degrees=True).as_matrix()
                for a in angles
            ]

            if vol.dynamic_params.translation_end is not None:
                translation_start = np.array(vol.translation, dtype=float) * translation_unit
                translation_end   = np.array(vol.dynamic_params.translation_end, dtype=float) * translation_unit
                translations = np.linspace(translation_start, translation_end, num_runs).tolist()
                gate_vol.add_dynamic_parametrisation(rotation=rotations, translation=translations)
            else:
                gate_vol.add_dynamic_parametrisation(rotation=rotations)

    async def read_volumes(self, sim_id: int) -> list[str]:
        vols = await self.vol_repo.read_all(sim_id)
        return [v.name for v in vols]

    async def read_volume(self, sim_id: int, name: str) -> VolumeRead:
        db = await self.vol_repo.read(sim_id, name)
        if not db:
            raise HTTPException(404, "Volume not found")
        return db

    async def update_volume(
        self, sim_id: int, name: str, vol_update: VolumeUpdate
    ) -> MessageResponse:
        # 1) ensure it exists (throws 404 if not)
        await self.read_volume(sim_id, name)

        # 2) load the Gate simulation and volume handle
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        if name not in gate_sim.volume_manager.volume_names:
            raise HTTPException(404, f"Gate volume '{name}' not found")
        gate_vol = gate_sim.volume_manager.get_volume(name)

        # 3) re-process the volume into Gate using the Pydantic update model
        await self._process_vol(sim_id, gate_vol, vol_update)

        # 4) write out the updated Gate JSON
        gate_sim.to_json_file()

        # 5) persist the same update to the database
        await self.vol_repo.update(sim_id, name, vol_update)

        return {"message": f"Volume '{name}' updated successfully"}

    async def delete_volume(self, sim_id: int, name: str) -> MessageResponse:
        db = await self.vol_repo.delete(sim_id, name)
        if not db:
            raise HTTPException(404, "Volume not found")
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        gate_sim.volume_manager.remove_volume(name)
        gate_sim.to_json_file()
        return {"message": f"Volume '{name}' deleted successfully"}

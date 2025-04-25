import re
from fastapi import HTTPException
from scipy.spatial.transform import Rotation as R
from app.schemas.volume import (
    VolumeCreate,
    VolumeRead,
    VolumeType,
    BoxShape,
    SphereShape,
    Rotation,
    VolumeUpdate,
)
from app.services.simulation_service import SimulationService
from app.utils.utils import (
    UNIT_MAP,
    assign_volume_shape,
    extract_rotation,
    extract_volume_shape,
)
from opengate.geometry.volumes import VolumeBase


ANSI_ESCAPE_RE = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")


class VolumeService:
    def __init__(self, simulation_service: SimulationService):
        self.sim_service = simulation_service

    def _apply_rotation(self, rotation: Rotation, new_volume):
        if rotation:
            mat = R.from_euler(rotation.axis, rotation.angle, degrees=True).as_matrix()
            new_volume.rotation = mat

    async def create_volume(self, sim_id: int, vol_create: VolumeCreate) -> VolumeRead:
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)

        if vol_create.name in gate_sim.volume_manager.volume_names:
            raise HTTPException(
                status_code=409, detail="Volume with {name} already exists"
            )

        vol: VolumeBase | None = gate_sim.add_volume(
            vol_create.shape.type.value, vol_create.name
        )

        vol.mother = vol_create.mother
        vol.material = vol_create.material
        vol.translation = vol_create.translation
        self._apply_rotation(vol_create.rotation, vol)

        assign_volume_shape(vol, vol_create.shape)

        gate_sim.to_json_file()

        return await self.read_volume(sim_id, vol_create.name)

    async def read_volumes(self, sim_id: int) -> list[str]:
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        return gate_sim.volume_manager.volume_names

    async def read_volume(self, sim_id: int, volume_name: str) -> VolumeRead:
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        gate_volume = gate_sim.volume_manager.volumes.get(volume_name)

        if not gate_volume:
            raise HTTPException(status_code=404, detail="Volume not found")

        return VolumeRead(
            name=volume_name,
            mother=gate_volume.mother or "world",
            material=gate_volume.material,
            translation=gate_volume.translation,
            rotation=extract_rotation(gate_volume),
            color=[0.25, 0.25, 0.25, 1.0],  # Add DB integration if needed
            shape=extract_volume_shape(gate_volume),
        )

    async def update_volume(
        self, sim_id: int, volume_name: str, volume: VolumeUpdate
    ) -> VolumeRead:
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)

        if volume_name not in gate_sim.volume_manager.volumes:
            raise HTTPException(
                status_code=404, detail=f"Volume '{volume_name}' not found"
            )

        existing = gate_sim.volume_manager.volumes[volume_name]

        if volume.mother is not None:
            existing.mother = volume.mother
        if volume.material is not None:
            existing.material = volume.material
        if volume.translation is not None:
            existing.translation = volume.translation
        if volume.rotation is not None:
            self._apply_rotation(volume.rotation, existing)

        if volume.shape is not None:
            if isinstance(volume.shape, BoxShape):
                factor = UNIT_MAP[volume.shape.unit]
                existing.size = [s * factor for s in volume.shape.size]
                existing.rmin = None
                existing.rmax = None
            elif isinstance(volume.shape, SphereShape):
                factor = UNIT_MAP[volume.shape.unit]
                existing.rmin = volume.shape.rmin * factor
                existing.rmax = volume.shape.rmax * factor
                existing.size = None
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported volume shape type: {getattr(volume.shape, 'type', 'unknown')}",
                )

        gate_sim.to_json_file()

        if volume.name is not None and volume.name != volume_name:
            if volume.name in gate_sim.volume_manager.volumes:
                raise HTTPException(
                    status_code=400, detail=f"Volume '{volume.name}' already exists."
                )
            existing.name = volume.name
            gate_sim.volume_manager.volumes[volume.name] = (
                gate_sim.volume_manager.volumes.pop(volume_name)
            )
            volume_name = volume.name  # Update reference for read_volume

            gate_sim.to_json_file()

        return await self.read_volume(sim_id, volume_name)

    async def delete_volume(self, sim_id: int, volume_name: str) -> dict:
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        if volume_name not in gate_sim.volume_manager.volumes:
            raise HTTPException(status_code=404, detail="Volume not found")

        gate_sim.volume_manager.remove_volume(volume_name)
        gate_sim.to_json_file()

        return {"message": f"Volume '{volume_name}' deleted successfully"}

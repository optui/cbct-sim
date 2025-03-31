import re
from fastapi import HTTPException
from scipy.spatial.transform import Rotation as R

from backend.schemas.volume import (
    VolumeCreate,
    VolumeRead,
    VolumeType,
    BoxShape,
    SphereShape,
    Rotation,
    VolumeUpdate,
)
from backend.services.simulation_service import SimulationService
from backend.utils.utils import UNIT_MAP, get_gate_simulation_without_sources


ANSI_ESCAPE_RE = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')

class VolumeService:
    def __init__(self, simulation_service: SimulationService):
        self.simulation_service = simulation_service

    def _apply_rotation(self, rotation: Rotation, new_volume):
        if rotation:
            mat = R.from_euler(rotation.axis, rotation.angle, degrees=True).as_matrix()
            new_volume.rotation = mat

    async def read_volumes(self, simulation_id: int) -> list[str]:
        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )
        return gate_sim.volume_manager.volume_names

    async def create_volume(self, simulation_id: int, volume: VolumeCreate) -> VolumeRead:
        """
        Create a new volume, then return a VolumeRead object
        representing the newly-created volume.
        """
        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )

        # Attempt to add the volume in Gate
        try:
            new_volume = gate_sim.volume_manager.add_volume(
                volume.shape.type.value, volume.name
            )
        except Exception as e:
            cleaned = ANSI_ESCAPE_RE.sub('', str(e))
            raise HTTPException(status_code=400, detail=cleaned)

        # Basic properties
        new_volume.mother = volume.mother
        new_volume.material = volume.material
        new_volume.translation = volume.translation
        self._apply_rotation(volume.rotation, new_volume)

        # Shape handling
        if isinstance(volume.shape, BoxShape):
            factor = UNIT_MAP[volume.shape.unit]
            new_volume.size = [s * factor for s in volume.shape.size]

        elif isinstance(volume.shape, SphereShape):
            factor = UNIT_MAP[volume.shape.unit]
            new_volume.rmin = volume.shape.rmin * factor
            new_volume.rmax = volume.shape.rmax * factor

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported volume type: {volume.shape.type}"
            )

        # Save the updated Gate simulation
        gate_sim.to_json_file()

        # Reuse the read logic to get a consistent VolumeRead object,
        # or manually build and return VolumeRead below:
        return await self.read_volume(simulation_id, volume.name)

    async def read_volume(self, simulation_id: int, volume_name: str) -> VolumeRead:
        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )
        gate_volume = gate_sim.volume_manager.volumes.get(volume_name)

        if not gate_volume:
            raise HTTPException(status_code=404, detail="Volume not found")

        gate_class = gate_volume.__class__.__name__

        # We store everything internally in cm,
        # so we'll convert back to user-friendly units in the schema
        if "Box" in gate_class:
            factor = UNIT_MAP["cm"]
            shape = BoxShape(
                type=VolumeType.BOX,
                size=[
                    s / factor
                    for s in getattr(gate_volume, "size", [0.0, 0.0, 0.0])
                ],
                unit="cm",
            )
        elif "Sphere" in gate_class:
            factor = UNIT_MAP["cm"]
            shape = SphereShape(
                type=VolumeType.SPHERE,
                rmin=getattr(gate_volume, "rmin", 0.0) / factor,
                rmax=getattr(gate_volume, "rmax", 0.0) / factor,
                unit="cm",
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Unknown volume type: {gate_class}"
            )

        # Here we simply return default color & rotation,
        # or you could store and retrieve them from the DB if needed.
        return VolumeRead(
            name=volume_name,
            mother=gate_volume.mother,
            material=gate_volume.material,
            translation=gate_volume.translation,
            rotation=Rotation(axis="x", angle=0.0),  # or reconstruct from gate_volume
            color=[0.25, 0.25, 0.25, 1.0],           # or retrieve from DB
            shape=shape,
        )

    async def update_volume(
        self,
        simulation_id: int,
        volume_name: str,
        volume: VolumeUpdate
    ) -> VolumeRead:
        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )

        if volume_name not in gate_sim.volume_manager.volumes:
            raise HTTPException(
                status_code=404,
                detail=f"Volume '{volume_name}' not found"
            )

        existing = gate_sim.volume_manager.volumes[volume_name]

        # Update basic props
        existing.mother = volume.mother
        existing.material = volume.material
        existing.translation = volume.translation
        self._apply_rotation(volume.rotation, existing)

        # Update shape
        if isinstance(volume.shape, BoxShape):
            factor = UNIT_MAP[volume.shape.unit]
            existing.size = [s * factor for s in volume.shape.size]

        elif isinstance(volume.shape, SphereShape):
            factor = UNIT_MAP[volume.shape.unit]
            existing.rmin = volume.shape.rmin * factor
            existing.rmax = volume.shape.rmax * factor

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported volume type: {volume.shape.type}"
            )

        gate_sim.to_json_file()
        # Return the updated volume representation
        return await self.read_volume(simulation_id, volume_name)

    async def delete_volume(
        self,
        simulation_id: int,
        volume_name: str
    ) -> dict:
        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )
        if volume_name not in gate_sim.volume_manager.volumes:
            raise HTTPException(status_code=404, detail="Volume not found")

        gate_sim.volume_manager.remove_volume(volume_name)
        gate_sim.to_json_file()

        return {"message": f"Volume '{volume_name}' deleted successfully"}

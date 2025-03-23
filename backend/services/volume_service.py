import re
import opengate as gate
from fastapi import HTTPException
from scipy.spatial.transform import Rotation as R

from backend.schemas.volume import (
    Box,
    Rotation,
    Sphere,
    VolumeCreate,
    VolumeUpdate,
    VolumeRead,
    VolumeType,
)
from backend.services.simulation_service import SimulationService
from backend.utils import UNIT_MAP

ANSI_ESCAPE_RE = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')

class VolumeService:
    def __init__(self, simulation_service: SimulationService):
        self.simulation_service = simulation_service

    async def _get_gate_simulation(self, id: int) -> gate.Simulation:
        return await self.simulation_service._get_gate_simulation(id)

    def _apply_rotation(self, volume: VolumeCreate, new_volume):
        if volume.rotation:
            mat = R.from_euler(
                volume.rotation.axis, volume.rotation.angle, degrees=True
            ).as_matrix()
            new_volume.rotation = mat

    async def read_volumes(self, id: int) -> list[str]:
        gate_sim = await self._get_gate_simulation(id)
        return gate_sim.volume_manager.volume_names

    async def create_volume(self, id: int, volume: VolumeCreate) -> dict:
        gate_sim = await self._get_gate_simulation(id)

        try:
            new_volume = gate_sim.volume_manager.add_volume(volume.type.value, volume.name)
        except Exception as e:
            cleaned_message = ANSI_ESCAPE_RE.sub('', str(e))
            raise HTTPException(status_code=400, detail=f"{cleaned_message}")

        new_volume.mother = volume.mother
        new_volume.material = volume.material
        new_volume.translation = volume.translation
        self._apply_rotation(volume, new_volume)

        factor = UNIT_MAP["cm"]
        if volume.type == VolumeType.BOX and volume.box:
            new_volume.size = [s * factor for s in volume.box.size]
        elif volume.type == VolumeType.SPHERE and volume.sphere:
            new_volume.rmin = volume.sphere.rmin * factor
            new_volume.rmax = volume.sphere.rmax * factor

        gate_sim.to_json_file()
        return {"name": volume.name}

    async def read_volume(self, id: int, volume_name: str) -> VolumeRead:
        gate_sim = await self._get_gate_simulation(id)
        gate_volume = gate_sim.volume_manager.volumes.get(volume_name)
        if not gate_volume:
            raise HTTPException(status_code=404, detail="Volume not found")

        gate_class = gate_volume.__class__.__name__
        if "Box" in gate_class:
            volume_type = VolumeType.BOX

            raw_size = getattr(gate_volume, "size", [0.0, 0.0, 0.0])

            user_size = raw_size
            box = Box(size=user_size)
            sphere = None
        elif "Sphere" in gate_class:
            volume_type = VolumeType.SPHERE
            rmin_val = getattr(gate_volume, "rmin", 0.0)
            rmax_val = getattr(gate_volume, "rmax", 0.0)

            box = None
            sphere = Sphere(rmin=rmin_val, rmax=rmax_val)
        else:

            raise HTTPException(status_code=500, detail="Unknown volume type from Gate")

        rotation_matrix = getattr(gate_volume, "rotation", None)

        rotation = Rotation(axis="x", angle=0.0)

        mother_val = getattr(gate_volume, "mother", "world")

        color_val = [0.25, 0.25, 0.25, 1.0]

        volume_read = VolumeRead(
            name=volume_name,
            mother=mother_val,
            material=gate_volume.material,
            translation=gate_volume.translation,
            rotation=rotation,
            color=color_val,
            type=volume_type,
            box=box,
            sphere=sphere,
        )
        return volume_read

    async def update_volume(
        self, id: int, volume_name: str, update_data: VolumeUpdate
    ) -> dict:
        """
        Updates an existing volume's fields (material, translation, rotation, box/sphere sizes, etc.).
        """
        gate_sim = await self._get_gate_simulation(id)
        
        existing_volume = gate_sim.volume_manager.volumes.get(volume_name)
        
        if not existing_volume:
            raise HTTPException(status_code=404, detail="Volume not found")

        if update_data.material is not None:
            existing_volume.material = update_data.material
        if update_data.translation is not None:
            existing_volume.translation = update_data.translation
        if update_data.rotation:
            mat = R.from_euler(
                update_data.rotation.axis, update_data.rotation.angle, degrees=True
            ).as_matrix()
            existing_volume.rotation = mat

        factor = UNIT_MAP["cm"]

        if update_data.box and hasattr(existing_volume, "size"):
            existing_volume.size = [s * factor for s in update_data.box.size]

        if update_data.sphere and hasattr(existing_volume, "rmin"):
            existing_volume.rmin = update_data.sphere.rmin * factor
            existing_volume.rmax = update_data.sphere.rmax * factor

        gate_sim.to_json_file()
        return {"message": f"Volume '{volume_name}' updated successfully"}

    async def delete_volume(self, id: int, volume_name: str) -> dict:
        """
        Removes the volume from the simulation if it exists.
        """
        gate_sim = await self._get_gate_simulation(id)
        
        if volume_name not in gate_sim.volume_manager.volumes:
            raise HTTPException(status_code=404, detail="Volume not found")

        gate_sim.volume_manager.remove_volume(volume_name)
        gate_sim.to_json_file()
        return {"message": f"Volume '{volume_name}' deleted successfully"}
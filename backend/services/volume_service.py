from fastapi import HTTPException
import opengate as gate
from scipy.spatial.transform import Rotation

from backend.schemas.volume import VolumeCreate, VolumeUpdate, VolumeRead
from backend.utils.utils import UNIT_MAP


def process_volume(volume: VolumeCreate) -> dict:
    volume_data = {}
    if volume.type == "Box" and volume.box:
        factor = UNIT_MAP[volume.box.size_unit]
        volume_data["size"] = [s * factor for s in volume.box.size]
    elif volume.type == "Sphere" and volume.sphere:
        factor = UNIT_MAP[volume.sphere.radius_unit]
        volume_data["rmin"] = volume.sphere.rmin * factor
        volume_data["rmax"] = volume.sphere.rmax * factor
    elif volume.type == "Image" and volume.image:
        volume_data["image"] = volume.image.image_path
    return volume_data


def process_common_updates(volume: VolumeCreate, volume_instance) -> None:
    if volume.material:
        volume_instance.material = volume.material
    if volume.translation:
        volume_instance.translation = volume.translation
    if volume.rotation:
        mat = Rotation.from_euler(volume.rotation.axis, volume.rotation.angle, degrees=True).as_matrix()
        volume_instance.rotation = mat


class VolumeService:
    def __init__(self, simulation_service):
        self.simulation_service = simulation_service
        
    async def read_volumes(self, simulation_id: int) -> list[str]:
        gate_sim = await self._get_gate_simulation(simulation_id)
        return gate_sim.volume_manager.volume_names

    async def create_volume(self, simulation_id: int, volume: VolumeCreate) -> dict:
        gate_sim = await self._get_gate_simulation(simulation_id)
        if volume.name in gate_sim.volume_manager.volumes:
            raise HTTPException(status_code=400, detail=f"Volume '{volume.name}' already exists.")
        
        new_volume = gate_sim.volume_manager.add_volume(volume.type, volume.name)
        volume_data = volume.get_volume_props()  # Get volume-specific properties
        for key, value in volume_data.items():
            setattr(new_volume, key, value)

        self._process_common_updates(volume, new_volume)
        gate_sim.to_json_file()

        return {"name": volume.name}
    
    async def read_volume(self, simulation_id: int, volume_name: str) -> VolumeRead:
        gate_sim = await self._get_gate_simulation(simulation_id)
        volume = gate_sim.volume_manager.volumes.get(volume_name)
        if not volume:
            return None
        return VolumeRead(
            name=volume_name,
            type=volume.__class__.__name__,
            material=volume.material,
            translation=volume.translation,
            rotation_matrix=volume.rotation,
            size=volume.size if hasattr(volume, 'size') else None,
            rmin=volume.rmin if hasattr(volume, 'rmin') else None,
            rmax=volume.rmax if hasattr(volume, 'rmax') else None,
            image_path=volume.image if hasattr(volume, 'image') else None,
        )

    async def update_volume(self, simulation_id: int, volume_name: str, update_data: VolumeUpdate) -> dict:
        gate_sim = await self._get_gate_simulation(simulation_id)
        existing_volume = gate_sim.volume_manager.volumes.get(volume_name)
        if not existing_volume:
            raise HTTPException(status_code=404, detail="Volume not found")

        volume_data = update_data.get_volume_props()
        for key, value in volume_data.items():
            setattr(existing_volume, key, value)

        self._process_common_updates(update_data, existing_volume)
        gate_sim.to_json_file()

        return {"message": f"Volume '{volume_name}' updated successfully"}

    async def delete_volume(self, simulation_id: int, volume_name: str) -> dict:
        gate_sim = await self._get_gate_simulation(simulation_id)
        if volume_name not in gate_sim.volume_manager.volumes:
            raise HTTPException(status_code=404, detail="Volume not found")
        
        gate_sim.volume_manager.remove_volume(volume_name)
        gate_sim.to_json_file()
        return {"message": f"Volume '{volume_name}' deleted successfully"}

    async def _get_gate_simulation(self, simulation_id: int) -> gate.Simulation:
        return await self.simulation_service._get_gate_simulation(simulation_id)

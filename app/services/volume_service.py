import re
from fastapi import HTTPException
from scipy.spatial.transform import Rotation as R

from app.schemas.volume import (
    VolumeCreate,
    VolumeRead,
    VolumeType,
    VolumeShape,
    Rotation,
)
from app.services.simulation_service import SimulationService
from app.utils import UNIT_MAP, get_gate_simulation

ANSI_ESCAPE_RE = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")

SHAPE_HANDLERS = {
    VolumeType.BOX: lambda vol, new_vol, factor: setattr(
        new_vol, "size", [s * factor for s in vol.shape.parameters["size"]]
    ),
    VolumeType.SPHERE: lambda vol, new_vol, factor: [
        setattr(new_vol, "rmin", vol.shape.parameters["rmin"] * factor),
        setattr(new_vol, "rmax", vol.shape.parameters["rmax"] * factor),
    ],
}


class VolumeService:
    def __init__(self, simulation_service: SimulationService):
        self.simulation_service = simulation_service

    def _apply_rotation(self, rotation: Rotation, new_volume):
        if rotation:
            mat = R.from_euler(rotation.axis, rotation.angle, degrees=True).as_matrix()
            new_volume.rotation = mat

    async def read_volumes(self, id: int) -> list[str]:
        gate_sim = await get_gate_simulation(id, self.simulation_service.repository)
        return gate_sim.volume_manager.volume_names

    async def create_volume(self, id: int, volume: VolumeCreate) -> dict:
        gate_sim = await get_gate_simulation(id, self.simulation_service.repository)
        try:
            new_volume = gate_sim.volume_manager.add_volume(
                volume.shape.type.value, volume.name
            )
        except Exception as e:
            cleaned = ANSI_ESCAPE_RE.sub("", str(e))
            raise HTTPException(400, f"{cleaned}")

        new_volume.mother = volume.mother
        new_volume.material = volume.material
        new_volume.translation = volume.translation
        self._apply_rotation(volume.rotation, new_volume)

        handler = SHAPE_HANDLERS.get(volume.shape.type)
        if handler:
            handler(volume, new_volume, UNIT_MAP["cm"])
        else:
            raise HTTPException(400, f"Unsupported volume type: {volume.shape.type}")

        gate_sim.to_json_file()
        return {"name": volume.name}

    async def read_volume(self, id: int, volume_name: str) -> VolumeRead:
        gate_sim = await get_gate_simulation(id, self.simulation_service.repository)
        gate_volume = gate_sim.volume_manager.volumes.get(volume_name)

        if not gate_volume:
            raise HTTPException(404, "Volume not found")

        gate_class = gate_volume.__class__.__name__
        parameters = {}

        if "Box" in gate_class:
            volume_type = VolumeType.BOX
            parameters = {"size": getattr(gate_volume, "size", [0.0, 0.0, 0.0])}
        elif "Sphere" in gate_class:
            volume_type = VolumeType.SPHERE
            parameters = {
                "rmin": getattr(gate_volume, "rmin", 0.0),
                "rmax": getattr(gate_volume, "rmax", 0.0),
            }
        else:
            raise HTTPException(500, "Unknown volume type")

        shape = VolumeShape(type=volume_type, parameters=parameters)

        return VolumeRead(
            name=volume_name,
            mother=gate_volume.mother,
            material=gate_volume.material,
            translation=gate_volume.translation,
            rotation=Rotation(axis="x", angle=0.0),
            color=[0.25, 0.25, 0.25, 1.0],
            shape=shape,
        )

    async def delete_volume(self, id: int, volume_name: str) -> dict:
        gate_sim = await get_gate_simulation(id, self.simulation_service.repository)
        if volume_name not in gate_sim.volume_manager.volumes:
            raise HTTPException(404, "Volume not found")
        gate_sim.volume_manager.remove_volume(volume_name)
        gate_sim.to_json_file()
        return {"message": f"Volume '{volume_name}' deleted successfully"}

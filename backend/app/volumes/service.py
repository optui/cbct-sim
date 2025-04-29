from fastapi import HTTPException
import numpy as np

from app.simulations.service import SimulationService
from app.volumes.schema import (
    VolumeCreate,
    VolumeRead,
    VolumeUpdate,
    BoxShape,
    SphereShape,
    VolumeShape,
    VolumeType,
)
from app.shared.primitives import UNIT_TO_GATE, Unit, Rotation
from scipy.spatial.transform import Rotation as R


class VolumeService:
    def __init__(self, simulation_service: SimulationService):
        self.sim_service = simulation_service

    @staticmethod
    def apply_rotation(rot: Rotation, gate_volume) -> Rotation:
        gate_volume.rotation = R.from_euler(
            rot.axis.value, rot.angle, degrees=True
        ).as_matrix()

    @staticmethod
    def extract_rotation(gate_volume) -> Rotation:
        mat = getattr(gate_volume, "rotation", None)
        if mat is None:
            return Rotation()

        rv = R.from_matrix(mat).as_rotvec()
        angle = np.linalg.norm(rv) * 180.0 / np.pi

        if angle == 0:
            return Rotation(axis=gate_volume.user_info.get("axis", "x"), angle=0)

        unit = rv / np.linalg.norm(rv)
        axis = ["x", "y", "z"][np.argmax(np.abs(unit))]
        return Rotation(axis=axis, angle=angle)

    @staticmethod
    def _assign_shape(gate_vol, shape: VolumeShape) -> None:
        factor = UNIT_TO_GATE[Unit.CM]
        if isinstance(shape, BoxShape):
            gate_vol.size = [s * factor for s in shape.size]
            if hasattr(gate_vol, "rmin"):
                gate_vol.rmin = None
                gate_vol.rmax = None
        elif isinstance(shape, SphereShape):
            gate_vol.rmin = shape.rmin * factor
            gate_vol.rmax = shape.rmax * factor
        else:
            raise HTTPException(status_code=400, detail="Only Box / Sphere supported")

    @staticmethod
    def _extract_volume_shape(gate_volume) -> VolumeShape:
        factor = UNIT_TO_GATE[Unit.CM]
        gate_class = gate_volume.__class__.__name__
        if "Box" in gate_class:
            return BoxShape(
                type=VolumeType.BOX,
                size=[
                    s / factor for s in getattr(gate_volume, "size", [0.0, 0.0, 0.0])
                ],
                unit=Unit.CM,
            )
        if "Sphere" in gate_class:
            return SphereShape(
                type=VolumeType.SPHERE,
                rmin=getattr(gate_volume, "rmin", 0.0) / factor,
                rmax=getattr(gate_volume, "rmax", 0.0) / factor,
                unit=Unit.CM,
            )
        raise HTTPException(
            status_code=500, detail=f"Unknown volume type: {gate_class}"
        )

    async def create_volume(self, sim_id: int, payload: VolumeCreate) -> VolumeRead:
        sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        if payload.name in sim.volume_manager.volume_names:
            raise HTTPException(
                status_code=409, detail=f"Volume '{payload.name}' already exists"
            )
        gate_vol = sim.add_volume(payload.shape.type.value, payload.name)
        gate_vol.mother = payload.mother
        gate_vol.material = payload.material
        factor = UNIT_TO_GATE[Unit.MM]
        gate_vol.translation = [t * factor for t in payload.translation]
        self.apply_rotation(payload.rotation, gate_vol)
        self._assign_shape(gate_vol, payload.shape)
        sim.to_json_file()
        return await self.read_volume(sim_id, payload.name)

    async def read_volumes(self, sim_id: int) -> list[str]:
        sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        return sim.volume_manager.volume_names

    async def read_volume(self, sim_id: int, name: str) -> VolumeRead:
        sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        gate_vol = sim.volume_manager.volumes.get(name)
        if gate_vol is None:
            raise HTTPException(status_code=404, detail="Volume not found")
        return VolumeRead(
            name=gate_vol.name,
            mother=gate_vol.mother or "world",
            material=gate_vol.material,
            translation=gate_vol.translation,
            rotation=self.extract_rotation(gate_vol),
            shape=self._extract_volume_shape(gate_vol),
        )

    async def update_volume(
        self, sim_id: int, name: str, payload: VolumeUpdate
    ) -> VolumeRead:
        pass

    async def delete_volume(self, sim_id: int, name: str) -> dict:
        sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        if name not in sim.volume_manager.volumes:
            raise HTTPException(status_code=404, detail="Volume not found")
        sim.volume_manager.remove_volume(name)
        sim.to_json_file()
        return {"message": f"Volume '{name}' deleted successfully"}

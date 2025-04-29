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
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)

        if vol_create.name in gate_sim.volume_manager.volume_names:
            raise HTTPException(
                status_code=409, detail=f"Volume '{vol_create.name}' already exists"
            )
        
        gate_vol: VolumeBase = gate_sim.add_volume(
            vol_create.shape.type.value,
            vol_create.name
        )

        gate_vol.mother = vol_create.mother
        gate_vol.material = vol_create.material

        translation_unit = UNIT_TO_GATE[vol_create.translation_unit]
        gate_vol.translation = [
            t * translation_unit for t in vol_create.translation
        ]

        gate_vol.rotation = R.from_euler(
            vol_create.rotation.axis.value,
            vol_create.rotation.angle,
            degrees=True
        ).as_matrix()

        shape_unit = UNIT_TO_GATE[vol_create.shape.unit]
        match vol_create.shape:
            case BoxShape():
                gate_vol.size = [
                    t * shape_unit for t in vol_create.shape.size
                ]
            case SphereShape():
                gate_vol.rmin = vol_create.shape.rmin * shape_unit
                gate_vol.rmax = vol_create.shape.rmax * shape_unit

        if vol_create.dynamic_params.enabled:
            sim_read = await self.sim_service.read_simulation(sim_id)
            num_runs = sim_read.num_runs

            angle_start = vol_create.rotation.angle
            angle_end = vol_create.dynamic_params.angle_end or angle_start
            angles = np.linspace(angle_start, angle_end, num_runs)
            rotations = [
                R.from_euler(
                    vol_create.rotation.axis.value,
                    angle,
                    degrees=True
                ).as_matrix()
                for angle in angles
            ]

            if vol_create.dynamic_params.translation_end is not None:
                translation_start = np.array(vol_create.translation, dtype=float) * translation_unit
                translation_end = np.array(vol_create.dynamic_params.translation_end, dtype=float) * translation_unit
                translations = np.linspace(translation_start, translation_end, num_runs).tolist()
                
                gate_vol.add_dynamic_parametrisation(rotation=rotations, translation=translations)
            else:
                gate_vol.add_dynamic_parametrisation(rotation=rotations)

        gate_sim.to_json_file()

        await self.vol_repo.create(sim_id, vol_create)

        return {"message": f"Volume '{vol_create.name}' created successfully"}

    async def read_volumes(self, sim_id: int) -> list[str]:
        vols = await self.vol_repo.read_all(sim_id)
        return [v.name for v in vols]

    async def read_volume(self, sim_id: int, name: str) -> VolumeRead:
        db = await self.vol_repo.read(sim_id, name)
        if not db:
            raise HTTPException(404, "Volume not found")

        return VolumeRead(
            name=db.name,
            mother=db.mother,
            material=db.material,
            # These keys must match your Pydantic BaseModel fields
            translation=db.translation["value"] if isinstance(db.translation, dict) else db.translation,
            translation_unit=Unit(db.translation["unit"]) if isinstance(db.translation, dict) else Unit.MM,
            rotation=Rotation(**db.rotation),
            shape=VolumeShape.parse_obj(db.shape),
            dynamic_params=DynamicParams.model_validate(db.dynamic_params),
        )

    async def update_volume(
        self, sim_id: int, name: str, payload: VolumeUpdate
    ) -> MessageResponse:
        # 1) Load DB volume so we can read “old” values (e.g. translation_unit)
        db_vol = await self.vol_repo.read(sim_id, name)
        if not db_vol:
            raise HTTPException(404, "Volume not found")

        # 2) Load Gate simulation and find the existing volume object
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        try:
            gate_vol: VolumeBase = gate_sim.volume_manager.get_volume(name)
        except KeyError:
            raise HTTPException(404, "Volume not found in Gate simulation")

        # 3) Extract only the fields the user sent
        data = payload.model_dump(exclude_unset=True)

        # 4) Handle renaming
        if new_name := data.get("name"):
            if new_name in gate_sim.volume_manager.volume_names:
                raise HTTPException(409, f"Volume '{new_name}' already exists")
            gate_vol.name = new_name
            name = new_name  # so the repo.update() looks up by the old name

        # 5) Simple scalar updates
        if "mother" in data:
            gate_vol.mother = data["mother"]
        if "material" in data:
            gate_vol.material = data["material"]

        # 6) Translation (+ optional unit change)
        if "translation" in data or "translation_unit" in data:
            # choose the unit to use
            tu: Unit = data.get("translation_unit", Unit(db_vol.translation_unit))
            conv = UNIT_TO_GATE[tu]
            vec = data.get("translation", db_vol.translation)
            gate_vol.translation = [t * conv for t in vec]

        # 7) Rotation
        if rot := data.get("rotation"):
            gate_vol.rotation = R.from_euler(
                rot.axis.value, rot.angle, degrees=True
            ).as_matrix()

        # 8) Shape
        if shape := data.get("shape"):
            shape_unit = UNIT_TO_GATE[Unit(shape["unit"])]
            match shape["type"]:
                case VolumeType.BOX.value:
                    gate_vol.size = [s * shape_unit for s in shape["size"]]
                case VolumeType.SPHERE.value:
                    gate_vol.rmin = shape["rmin"] * shape_unit
                    gate_vol.rmax = shape["rmax"] * shape_unit
                # add other shape types here…

        # 9) Dynamic parameters (only support re-enabling with new trajectory)
        if dp := data.get("dynamic_params"):
            if dp["enabled"]:
                sim_read = await self.sim_service.read_simulation(sim_id)
                runs = sim_read.num_runs

                # start from the *currently stored* rotation/translation
                start_angle = db_vol.rotation["angle"]
                end_angle = dp.get("angle_end", start_angle)
                angles = np.linspace(start_angle, end_angle, runs)
                rotations = [
                    R.from_euler(
                        db_vol.rotation["axis"], a, degrees=True
                    ).as_matrix()
                    for a in angles
                ]

                if trans_end := dp.get("translation_end"):
                    orig_unit = Unit(db_vol.translation_unit)
                    t0 = np.array(db_vol.translation, float) * UNIT_TO_GATE[orig_unit]
                    t1 = np.array(trans_end, float) * UNIT_TO_GATE[orig_unit]
                    translations = np.linspace(t0, t1, runs).tolist()
                    gate_vol.add_dynamic_parametrisation(
                        rotation=rotations, translation=translations
                    )
                else:
                    gate_vol.add_dynamic_parametrisation(rotation=rotations)
            # (if dp["enabled"] is False, we currently leave any old dynamic in place;
            # to remove it you'd need Gate-side removal API)

        # 10) Write out Gate JSON
        gate_sim.to_json_file()

        # 11) Persist the same VolumeUpdate to the DB
        updated = await self.vol_repo.update(sim_id, name, payload)
        if not updated:
            raise HTTPException(404, "Volume not found when updating DB")

        return {"message": f"Volume '{updated.name}' updated successfully"}

    async def delete_volume(self, sim_id: int, name: str) -> MessageResponse:
        db = await self.vol_repo.delete(sim_id, name)
        if not db:
            raise HTTPException(404, "Volume not found")
        # also remove from Gate
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)
        gate_sim.volume_manager.remove_volume(name)
        gate_sim.to_json_file()
        return {"message": f"Volume '{name}' deleted successfully"}

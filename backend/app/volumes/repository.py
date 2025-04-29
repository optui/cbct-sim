from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from app.volumes.model import Volume
from app.volumes.schema import VolumeCreate, VolumeUpdate


class VolumeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, simulation_id: int, payload: VolumeCreate) -> Volume:
        # Convert payload → raw dict, replacing Enums with their values
        data = payload.dict()
        # Primitive fields go straight in; enums need .value
        data["translation_unit"] = payload.translation_unit.value
        data["shape"] = payload.shape.dict()          # JSON column
        data["dynamic_params"] = payload.dynamic_params.dict()
        data["rotation"] = {
            "axis": payload.rotation.axis.value,
            "angle": payload.rotation.angle,
        }
        # Duck-type the JSON columns in the DB model
        db_vol = Volume(
            simulation_id=simulation_id,
            name=payload.name,
            mother=payload.mother,
            material=payload.material,
            translation=data["translation"],
            translation_unit=data["translation_unit"],
            rotation=data["rotation"],
            shape=data["shape"],
            dynamic_params=data["dynamic_params"],
        )

        self.session.add(db_vol)
        try:
            await self.session.commit()
            await self.session.refresh(db_vol)
            return db_vol
        except IntegrityError:
            await self.session.rollback()
            raise

    async def read_all(self, simulation_id: int) -> List[Volume]:
        q = await self.session.execute(
            select(Volume).where(Volume.simulation_id == simulation_id)
        )
        return q.scalars().all()

    async def read(self, simulation_id: int, name: str) -> Volume | None:
        q = await self.session.execute(
            select(Volume).where(
                Volume.simulation_id == simulation_id, Volume.name == name
            )
        )
        return q.scalar_one_or_none()


    async def update(self, simulation_id: int, name: str, payload: VolumeUpdate) -> Volume:
        vol = await self.read(simulation_id, name)
        if not vol:
            return None

        data = payload.model_dump(exclude_unset=True)
        # Map any enums/dicts into the JSON columns
        if "translation" in data:
            vol.translation = data["translation"]
        if "translation_unit" in data:
            vol.translation["unit"] = data["translation_unit"].value
        if "rotation" in data:
            vol.rotation = {"axis": data["rotation"].axis.value,
                            "angle": data["rotation"].angle}
        if "shape" in data:
            vol.shape = data["shape"].dict()
        if "dynamic_params" in data:
            vol.dynamic_params = data["dynamic_params"].dict()
        # Simple scalars
        for attr in ("name", "mother", "material"):
            if attr in data:
                setattr(vol, attr, data[attr])

        await self.session.commit()
        await self.session.refresh(vol)
        return vol

    async def delete(self, simulation_id: int, name: str) -> Volume | None:
        vol = await self.read(simulation_id, name)
        if vol:
            await self.session.delete(vol)
            await self.session.commit()
        return vol

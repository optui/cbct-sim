from enum import Enum
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from app.volumes.model import Volume
from app.volumes.schema import VolumeCreate, VolumeUpdate


class VolumeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, sim_id: int, vol_create: VolumeCreate) -> Volume:
        session_vol = Volume(
            simulation_id=sim_id, **vol_create.model_dump(mode="json")
        )
        self.session.add(session_vol)
        try:
            await self.session.commit()
            await self.session.refresh(session_vol)
            return session_vol
        except IntegrityError:
            await self.session.rollback()
            raise

    async def read_all(self, sim_id: int) -> List[Volume]:
        vol_list = await self.session.execute(
            select(Volume).where(Volume.simulation_id == sim_id)
        )
        return vol_list.scalars().all()

    async def read(self, sim_id: int, name: str) -> Volume | None:
        vol = await self.session.execute(
            select(Volume).where(
                Volume.simulation_id == sim_id, Volume.name == name
            )
        )
        return vol.scalar_one_or_none()

    async def update(
        self, sim_id: int, name: str, vol_update: VolumeUpdate
    ) -> Volume:
        vol = await self.read(sim_id, name)
        vol_update: dict = vol_update.model_dump(exclude_unset=True)

        for key, value in vol_update.items():
            if (
                key in {"rotation", "shape", "dynamic_params"}
                and value is not None
            ):
                setattr(vol, key, value)
            elif key == "translation_unit" and isinstance(value, Enum):
                setattr(vol, key, value.value)
            else:
                setattr(vol, key, value)

        try:
            await self.session.commit()
            await self.session.refresh(vol)
            return vol
        except IntegrityError:
            await self.session.rollback()
            raise

    async def delete(self, sim_id: int, name: str) -> Volume | None:
        vol = await self.read(sim_id, name)
        if vol:
            await self.session.delete(vol)
            await self.session.commit()
        return vol

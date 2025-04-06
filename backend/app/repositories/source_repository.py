from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from app.models import Source

class SourceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, source: Source) -> Source:
        self.session.add(source)
        try:
            await self.session.commit()
            await self.session.refresh(source)
            return source
        except IntegrityError:
            await self.session.rollback()
            raise

    async def read_sources(self, simulation_id: int) -> List[Source]:
        result = await self.session.execute(
            select(Source).where(Source.simulation_id == simulation_id)
        )
        return result.scalars().all()

    async def read_source_by_name(self, simulation_id: int, name: str) -> Source | None:
        result = await self.session.execute(
            select(Source).where(
                Source.simulation_id == simulation_id,
                Source.name == name
            )
        )
        return result.scalar_one_or_none()
    
    async def update(self, source: Source) -> Source:
        self.session.add(source)
        await self.session.commit()
        await self.session.refresh(source)
        return source

    async def delete(self, simulation_id: int, name: str) -> Source | None:
        source = await self.read_source_by_name(simulation_id, name)
        if source:
            await self.session.delete(source)
            await self.session.commit()
        return source

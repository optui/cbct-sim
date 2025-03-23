from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from backend.models import Simulation


class SimulationRepository:
    """Handles database operations for simulations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_simulations(self):
        result = await self.session.execute(select(Simulation))
        return result.scalars().all()

    async def create(self, name: str):
        session_simulation = Simulation(
            name=name,
            output_dir=f"./output/{name}",
            json_archive_filename=f"{name}.json",
        )
        self.session.add(session_simulation)
        try:
            await self.session.commit()
            await self.session.refresh(session_simulation)
            return session_simulation
        except IntegrityError:
            await self.session.rollback()
            return None

    async def get_simulation(self, id: int) -> Simulation | None:
        result = await self.session.execute(
            select(Simulation).where(Simulation.id == id)
        )
        return result.scalar_one_or_none()

    async def update(self, id: int, name: str):
        simulation = await self.get_simulation(id)
        if not simulation:
            return None
        simulation.name = name
        await self.session.commit()
        await self.session.refresh(simulation)
        return simulation

    async def delete(self, id: int):
        simulation = await self.get_simulation(id)
        if not simulation:
            return None
        await self.session.delete(simulation)
        await self.session.commit()
        return simulation

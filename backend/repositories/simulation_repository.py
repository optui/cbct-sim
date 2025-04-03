from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from backend.models import Simulation


class SimulationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def read_simulations(self) -> List[Simulation]:
        result = await self.session.execute(select(Simulation))
        return result.scalars().all()

    async def create(self, name: str, num_runs: int, run_len: float) -> Simulation:
        session_simulation = Simulation(
            name=name,
            output_dir=f"./output/{name}",
            json_archive_filename=f"{name}.json",
            num_runs=num_runs,
            run_len=run_len
        )
        self.session.add(session_simulation)
        try:
            await self.session.commit()
            await self.session.refresh(session_simulation)
            return session_simulation
        except IntegrityError:
            await self.session.rollback()
            raise

    async def read_simulation(self, id: int) -> Simulation | None:
        result = await self.session.execute(
            select(Simulation).where(Simulation.id == id)
        )
        return result.scalar_one_or_none()

    async def update(self, id: int, name: str, num_runs: int, run_len: float) -> Simulation:
        simulation = await self.read_simulation(id)

        simulation.name = name
        simulation.output_dir = f"./output/{name}"
        simulation.json_archive_filename = f"{name}.json"
        simulation.num_runs = num_runs
        simulation.run_len = run_len
        try:
            await self.session.commit()
            await self.session.refresh(simulation)
            return simulation
        except IntegrityError:
            await self.session.rollback()
            raise

    async def delete(self, id: int) -> Simulation | None:
        simulation = await self.read_simulation(id)
        if not simulation:
            return None

        await self.session.delete(simulation)
        await self.session.commit()
        return simulation

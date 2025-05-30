from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from app.simulations.model import Simulation
from app.simulations.schema import SimulationCreate, SimulationUpdate


class SimulationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, sim_create: SimulationCreate) -> Simulation:
        sim = Simulation(
            **sim_create.model_dump(mode="json"),
            output_dir=f"./outputs/{sim_create.name}",
            json_archive_filename=f"{sim_create.name}.json",
        )
        self.session.add(sim)
        try:
            await self.session.commit()
            await self.session.refresh(sim)
            return sim
        except IntegrityError:
            await self.session.rollback()
            raise

    async def read_all(self) -> List[Simulation]:
        sim_list = await self.session.execute(select(Simulation))
        return sim_list.scalars().all()

    async def read(self, id: int) -> Simulation | None:
        sim = await self.session.execute(
            select(Simulation).where(Simulation.id == id)
        )
        return sim.scalar_one_or_none()

    async def update(self, id: int, sim_new: SimulationUpdate) -> Simulation:
        sim_old = await self.read(id)
        sim_new: dict = sim_new.model_dump(exclude_unset=True)

        for key, value in sim_new.items():
            setattr(sim_old, key, value)

        if "name" in sim_new:
            sim_old.output_dir = f"./outputs/{sim_old.name}"
            sim_old.json_archive_filename = f"{sim_old.name}.json"

        try:
            await self.session.commit()
            await self.session.refresh(sim_old)
            return sim_old
        except IntegrityError:
            await self.session.rollback()
            raise

    async def delete(self, id: int) -> Simulation | None:
        session_sim = await self.read(id)
        if not session_sim:
            return None
        await self.session.delete(session_sim)
        await self.session.commit()
        return session_sim

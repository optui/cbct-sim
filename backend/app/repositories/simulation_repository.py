from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from app.models import Simulation
from app.schemas.simulation import SimulationCreate, SimulationUpdate


class SimulationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    async def create(self, sim_create: SimulationCreate) -> Simulation:
        session_sim = Simulation(
            **sim_create.model_dump(),
            output_dir=f"./output/{sim_create.name}",
            json_archive_filename=f"{sim_create.name}.json",
        )
        self.session.add(session_sim)
        try:
            await self.session.commit()
            await self.session.refresh(session_sim)
            return session_sim
        except IntegrityError:
            await self.session.rollback()
            raise

    async def read_all(self) -> List[Simulation]:
        sim_list = await self.session.execute(select(Simulation))
        return sim_list.scalars().all()

    async def read(self, id: int) -> Simulation | None:
        sim = await self.session.execute(select(Simulation).where(Simulation.id == id))
        return sim.scalar_one_or_none()

    async def update(self, id: int, sim_update: SimulationUpdate) -> Simulation:
        session_sim = await self.read(id)
        sim_update: dict = sim_update.model_dump(exclude_unset=True)

        for key, value in sim_update.items():
            setattr(session_sim, key, value)

        if 'name' in sim_update:
            session_sim.output_dir = f"./output/{session_sim.name}"
            session_sim.json_archive_filename = f"{session_sim.name}.json"

        try:
            await self.session.commit()
            await self.session.refresh(session_sim)
            return session_sim
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

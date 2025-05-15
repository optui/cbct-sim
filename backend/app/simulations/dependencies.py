from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.simulations.repository import SimulationRepository
from app.simulations.service import SimulationService


def get_simulation_repository(
    db: Annotated[AsyncSession, Depends(get_session)],
) -> SimulationRepository:
    return SimulationRepository(db)


def get_simulation_service(
    repo: Annotated[SimulationRepository, Depends(get_simulation_repository)],
) -> SimulationService:
    return SimulationService(repo)


# Type Aliases
SimulationRepositoryDep = Annotated[
    SimulationRepository, Depends(get_simulation_repository)
]
SimulationServiceDep = Annotated[SimulationService, Depends(get_simulation_service)]
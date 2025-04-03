from typing import Annotated
from fastapi import Depends

from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import AsyncSessionLocal

from backend.repositories.simulation_repository import SimulationRepository
from backend.repositories.source_repository import SourceRepository

from backend.services.simulation_service import SimulationService
from backend.services.volume_service import VolumeService
from backend.services.source_service import SourceService
from backend.services.actor_service import ActorService


async def get_session():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()


def get_simulation_repository(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> SimulationRepository:
    return SimulationRepository(session)


def get_simulation_service(
    repository: Annotated[SimulationRepository, Depends(get_simulation_repository)],
) -> SimulationService:
    return SimulationService(repository)


def get_volume_service(
    simulation_service: Annotated[SimulationService, Depends(get_simulation_service)],
) -> VolumeService:
    return VolumeService(simulation_service)


def get_source_repository(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> SourceRepository:
    return SourceRepository(session)


def get_source_service(
    simulation_service: Annotated[SimulationService, Depends(get_simulation_service)],
    source_repository: Annotated[SourceRepository, Depends(get_source_repository)]
) -> SourceService:
    return SourceService(simulation_service, source_repository)


def get_actor_service(
    simulation_service: Annotated[SimulationService, Depends(get_simulation_service)],
) -> ActorService:
    return ActorService(simulation_service)


# Type aliases
SessionDep = Annotated[AsyncSession, Depends(get_session)]
SimulationRepositoryDep = Annotated[SimulationRepository, Depends(get_simulation_repository)]
SimulationServiceDep = Annotated[SimulationService, Depends(get_simulation_service)]
VolumeServiceDep = Annotated[VolumeService, Depends(get_volume_service)]
SourceRepositoryDep = Annotated[SourceRepository, Depends(get_source_repository)]
SourceServiceDep = Annotated[SourceService, Depends(get_source_service)]
ActorServiceDep = Annotated[ActorService, Depends(get_actor_service)]

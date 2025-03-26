from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.repositories.simulation_repository import SimulationRepository
from app.services.simulation_service import SimulationService
from app.services.volume_service import VolumeService
from app.services.source_service import SourceService
from app.services.actor_service import ActorService


# Database session dependency
async def get_session():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()


# Simulation Repository dependency
def get_simulation_repository(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> SimulationRepository:
    return SimulationRepository(session)


# Simulation Service dependency
def get_simulation_service(
    repository: Annotated[SimulationRepository, Depends(get_simulation_repository)],
) -> SimulationService:
    return SimulationService(repository)


# Volume Service dependency
def get_volume_service(
    simulation_service: Annotated[SimulationService, Depends(get_simulation_service)],
) -> VolumeService:
    return VolumeService(simulation_service)


# Source Service dependency
def get_source_service(
    simulation_service: Annotated[SimulationService, Depends(get_simulation_service)],
) -> SourceService:
    return SourceService(simulation_service)


# Actor Service dependency
def get_actor_service(
    simulation_service: Annotated[SimulationService, Depends(get_simulation_service)],
) -> ActorService:
    return ActorService(simulation_service)


# Type aliases
SessionDep = Annotated[AsyncSession, Depends(get_session)]
RepositoryDep = Annotated[SimulationRepository, Depends(get_simulation_repository)]
SimulationServiceDep = Annotated[SimulationService, Depends(get_simulation_service)]
VolumeServiceDep = Annotated[VolumeService, Depends(get_volume_service)]
SourceServiceDep = Annotated[SourceService, Depends(get_source_service)]
ActorServiceDep = Annotated[ActorService, Depends(get_actor_service)]

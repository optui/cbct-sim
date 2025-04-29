from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.volumes.repository import VolumeRepository
from app.volumes.service import VolumeService
from app.simulations.dependencies import SimulationServiceDep

def get_volume_repository(
    db: Annotated[AsyncSession, Depends(get_session)],
) -> VolumeRepository:
    return VolumeRepository(db)

def get_volume_service(
    sim_svc: SimulationServiceDep,
    repo: Annotated[VolumeRepository, Depends(get_volume_repository)],
) -> VolumeService:
    return VolumeService(sim_svc, repo)


VolumeRepositoryDep = Annotated[VolumeRepository, Depends(get_volume_repository)]
VolumeServiceDep    = Annotated[VolumeService,    Depends(get_volume_service)]

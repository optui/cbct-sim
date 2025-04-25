from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.sources.repository import SourceRepository
from app.sources.service import SourceService
from app.simulations.dependencies import SimulationServiceDep


def get_source_repository(
    db: Annotated[AsyncSession, Depends(get_session)],
) -> SourceRepository:
    return SourceRepository(db)


def get_source_service(
    sims: SimulationServiceDep,
    repo: Annotated[SourceRepository, Depends(get_source_repository)],
) -> SourceService:
    return SourceService(sims, repo)


SourceRepositoryDep = Annotated[SourceRepository, Depends(get_source_repository)]
SourceServiceDep = Annotated[SourceService, Depends(get_source_service)]

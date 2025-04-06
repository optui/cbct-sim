from fastapi import APIRouter, status
from typing import List
from app.api.dependencies import SourceServiceDep
from app.schemas.source import (
    GenericSourceCreate,
    GenericSourceRead,
    GenericSourceUpdate,
)
from app.schemas.api import MessageResponse

router = APIRouter(tags=["Sources"], prefix='/simulations')


@router.get("/{simulation_id}/sources", response_model=List[str])
async def read_sources(
    service: SourceServiceDep,
    simulation_id: int
):
    return await service.read_sources(simulation_id)


@router.post(
    "/{simulation_id}/sources",
    status_code=status.HTTP_201_CREATED,
    response_model=GenericSourceRead
)
async def create_source(
    service: SourceServiceDep,
    simulation_id: int,
    source: GenericSourceCreate
):
    return await service.create_source(simulation_id, source)


@router.get(
    "/{simulation_id}/sources/{name}",
    response_model=GenericSourceRead
)
async def read_source(
    service: SourceServiceDep,
    simulation_id: int,
    name: str
):
    return await service.read_source(simulation_id, name)


@router.put(
    "/{simulation_id}/sources/{name}",
    response_model=GenericSourceRead
)
async def update_source(
    service: SourceServiceDep,
    simulation_id: int,
    name: str,
    source_update: GenericSourceUpdate
):
    return await service.update_source(simulation_id, name, source_update)


@router.delete(
    "/{simulation_id}/sources/{name}",
    response_model=MessageResponse
)
async def delete_source(
    service: SourceServiceDep,
    simulation_id: int,
    name: str
):
    return await service.delete_source(simulation_id, name)

from fastapi import APIRouter, status
from typing import List
from app.sources.dependencies import SourceServiceDep
from app.sources.schema import (
    SourceCreate,
    SourceRead,
    SourceUpdate,
)
from app.shared.message import MessageResponse

router = APIRouter(tags=["Sources"], prefix="/simulations")


@router.get("/{simulation_id}/sources", response_model=List[str])
async def read_sources(service: SourceServiceDep, simulation_id: int):
    return await service.read_sources(simulation_id)


@router.post(
    "/{simulation_id}/sources",
    status_code=status.HTTP_201_CREATED,
    response_model=MessageResponse,
)
async def create_source(
    service: SourceServiceDep, simulation_id: int, source: SourceCreate
):
    return await service.create_source(simulation_id, source)


@router.get("/{simulation_id}/sources/{name}", response_model=SourceRead)
async def read_source(service: SourceServiceDep, simulation_id: int, name: str):
    return await service.read_source(simulation_id, name)


@router.put("/{simulation_id}/sources/{name}", response_model=MessageResponse)
async def update_source(
    service: SourceServiceDep,
    simulation_id: int,
    name: str,
    source_update: SourceUpdate,
):
    return await service.update_source(simulation_id, name, source_update)


@router.delete("/{simulation_id}/sources/{name}", response_model=MessageResponse)
async def delete_source(service: SourceServiceDep, simulation_id: int, name: str):
    return await service.delete_source(simulation_id, name)

from fastapi import APIRouter
from backend.api.dependencies import SourceServiceDep
from backend.schemas.source import SourceCreate
from typing import List

router = APIRouter(tags=["Sources"])


@router.get("/{id}/sources", response_model=List[str])
async def read_sources(service: SourceServiceDep, id: int):
    return await service.read_sources(id)


@router.post("/{id}/sources/", response_model=dict)
async def create_source(service: SourceServiceDep, id: int, source: SourceCreate):
    return await service.create_source(id, source)


@router.put("/{id}/sources/{source_name}")
async def update_source(
    service: SourceServiceDep, id: int, source_name: str, new_name: str
):
    return await service.update_source(id, source_name, new_name)


@router.delete("/{id}/sources/{source_name}")
async def delete_source(service: SourceServiceDep, id: int, source_name: str):
    return await service.delete_source(id, source_name)

from fastapi import APIRouter
from typing import List

from app.schemas.volume import (
    VolumeCreate,
    VolumeRead,
    VolumeUpdate,
)
from app.api.dependencies import VolumeServiceDep

router = APIRouter(tags=["Volumes"])


@router.get("/{id}/volumes", response_model=List[str])
async def read_volumes(service: VolumeServiceDep, id: int):
    return await service.read_volumes(id)


@router.post("/{id}/volumes", response_model=dict)
async def create_volume(service: VolumeServiceDep, id: int, volume: VolumeCreate):
    return await service.create_volume(id, volume)


@router.get("/{id}/volumes/{name}", response_model=VolumeRead)
async def read_volume(service: VolumeServiceDep, id: int, name: str):
    return await service.read_volume(id, name)


@router.put("/{id}/volumes/{name}", response_model=dict)
async def update_volume(service: VolumeServiceDep, id: int, volume: VolumeUpdate):
    return await service.update_volume(id, volume.name, volume)


@router.delete("/{id}/volumes/{name}", response_model=dict)
async def delete_volume(service: VolumeServiceDep, id: int, name: str):
    return await service.delete_volume(id, name)

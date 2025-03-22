from fastapi import APIRouter
from typing import List

from backend.schemas.volume import (
    VolumeCreate, 
    VolumeUpdate,
    VolumeRead,
)
from backend.api.dependencies import VolumeServiceDep
router = APIRouter(tags=["Volumes"])


@router.get("/{id}/volumes", response_model=List[str])
async def read_volumes(service: VolumeServiceDep, id: int):
    return await service.read_volumes(id)


@router.get("/{id}/volumes/{name}", response_model=VolumeRead)
async def read_volume(service: VolumeServiceDep, id: int, name: str):
    return await service.read_volume(id, name)


@router.post("/{id}/volumes", response_model=dict)
async def create_volume(service: VolumeServiceDep, id: int, volume: VolumeCreate):
    return await service.create_volume(id, volume)


@router.put("/{id}/volumes/{name}", response_model=dict)
async def update_volume(service: VolumeServiceDep, id: int, name: str, update_data: VolumeUpdate):
    return await service.update_volume(id, name, update_data)


@router.delete("/{id}/volumes/{name}", response_model=dict)
async def delete_volume(service: VolumeServiceDep, id: int, name: str):
    return await service.delete_volume(id, name)

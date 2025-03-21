from fastapi import APIRouter
from typing import List

from backend.schemas.volume import (
    VolumeCreate, 
    VolumeUpdate,
    VolumeRead,
)
from backend.api.dependencies import VolumeServiceDep
router = APIRouter(tags=["Volumes"])


@router.get("/{simulation_id}/volumes", response_model=List[str])
async def read_volumes(simulation_id: int, service: VolumeServiceDep):
    return await service.read_volumes(simulation_id)


@router.get("/{simulation_id}/volumes/{volume_name}", response_model=VolumeRead)
async def read_volume(simulation_id: int, volume_name: str, service: VolumeServiceDep):
    return await service.read_volume(simulation_id, volume_name)


@router.post("/{simulation_id}/volumes", response_model=dict)
async def create_volume(simulation_id: int, volume: VolumeCreate, service: VolumeServiceDep):
    return await service.create_volume(simulation_id, volume)


@router.put("/{simulation_id}/volumes/{volume_name}", response_model=dict)
async def update_volume(simulation_id: int, volume_name: str, update_data: VolumeUpdate, service: VolumeServiceDep):
    return await service.update_volume(simulation_id, volume_name, update_data)


@router.delete("/{simulation_id}/volumes/{volume_name}", response_model=dict)
async def delete_volume(simulation_id: int, volume_name: str, service: VolumeServiceDep):
    return await service.delete_volume(simulation_id, volume_name)

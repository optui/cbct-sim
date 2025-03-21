from fastapi import APIRouter
from backend.api.dependencies import ActorServiceDep
from typing import List

router = APIRouter(tags=["Actors"])

@router.get("/{id}/actors", response_model=List[str])
async def get_actors(service: ActorServiceDep, id: int):
    return await service.get_actors(id)

@router.post("/{id}/actors/")
async def create_actor(service: ActorServiceDep, id: int, actor_name: str):
    return await service.create_actor(id, actor_name)

@router.put("/{id}/actors/{actor_name}")
async def update_actor(service: ActorServiceDep, id: int, actor_name: str, new_name: str):
    return await service.update_actor(id, actor_name, new_name)

@router.delete("/{id}/actors/{actor_name}")
async def delete_actor(service: ActorServiceDep, id: int, actor_name: str):
    return await service.delete_actor(id, actor_name)

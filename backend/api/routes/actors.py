from fastapi import APIRouter
from backend.api.dependencies import ActorServiceDep
from typing import List

router = APIRouter(tags=["Actors"], prefix='/simulations')


@router.get("/{simulation_id}/actors/", response_model=List[str])
async def get_actors(service: ActorServiceDep, simulation_id: int):
    return await service.get_actors(simulation_id)


@router.post("/{simulation_id}/actors/")
async def create_actor(service: ActorServiceDep, simulation_id: int, actor_name: str):
    return await service.create_actor(simulation_id, actor_name)


@router.put("/{simulation_id}/actors/{actor_name}")
async def update_actor(
    service: ActorServiceDep, simulation_id: int, actor_name: str, new_name: str
):
    return await service.update_actor(simulation_id, actor_name, new_name)


@router.delete("/{simulation_id}/actors/{actor_name}")
async def delete_actor(service: ActorServiceDep, simulation_id: int, actor_name: str):
    return await service.delete_actor(simulation_id, actor_name)

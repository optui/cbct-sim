from fastapi import APIRouter
from app.api.dependencies import ActorServiceDep
from app.schemas.actor import ActorCreate, ActorRead, ActorUpdate
from typing import List

from app.schemas.message import MessageResponse

router = APIRouter(tags=["Actors"])


@router.get("/{simulation_id}/actors", response_model=List[str])
async def get_actors(service: ActorServiceDep, simulation_id: int):
    return await service.get_actors(simulation_id)


@router.post("/{simulation_id}/actors")
async def create_actor(
    service: ActorServiceDep, simulation_id: int, actor: ActorCreate
):
    return await service.create_actor(simulation_id, actor)


@router.get("/{simulation_id}/actors/{actor_name}", response_model=ActorRead)
async def read_actor(service: ActorServiceDep, simulation_id: int, actor_name: str):
    return await service.read_actor(simulation_id, actor_name)


@router.put("/{simulation_id}/actors/{actor_name}", response_model=MessageResponse)
async def update_actor(
    service: ActorServiceDep,
    simulation_id: int,
    actor_name: str,
    actor_update: ActorUpdate,
):
    return await service.update_actor(simulation_id, actor_name, actor_update)


@router.delete("/{simulation_id}/actors/{actor_name}")
async def delete_actor(service: ActorServiceDep, simulation_id: int, actor_name: str):
    return await service.delete_actor(simulation_id, actor_name)

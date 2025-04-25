from typing import Annotated
from fastapi import Depends

from app.actors.service import ActorService
from app.simulations.dependencies import SimulationServiceDep


def get_actor_service(
    sims: SimulationServiceDep,
) -> ActorService:
    return ActorService(sims)


# Type Alias
ActorServiceDep = Annotated[ActorService, Depends(get_actor_service)]

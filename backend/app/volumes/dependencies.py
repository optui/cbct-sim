from typing import Annotated
from fastapi import Depends

from app.volumes.service import VolumeService
from app.simulations.dependencies import SimulationServiceDep


def get_volume_service(
    sims: SimulationServiceDep,
) -> VolumeService:
    return VolumeService(sims)


# Type Alias
VolumeServiceDep = Annotated[VolumeService, Depends(get_volume_service)]

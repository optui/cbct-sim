from fastapi import APIRouter, status
from app.simulations.dependencies import SimulationServiceDep
from app.sources.dependencies import SourceRepositoryDep, SourceServiceDep
from app.shared.message import MessageResponse
from app.simulations.schema import (
    SimulationCreate,
    SimulationUpdate,
    SimulationRead,
)
from typing import List

from app.volumes.dependencies import VolumeRepositoryDep

router = APIRouter(tags=["Simulations"], prefix="/simulations")


@router.post(
    "/",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": MessageResponse}},
)
async def create_simulation(
    service: SimulationServiceDep, simulation: SimulationCreate
):
    return await service.create_simulation(simulation)


@router.get("/", response_model=List[SimulationRead])
async def read_simulations(service: SimulationServiceDep):
    return await service.read_simulations()


@router.get(
    "/{simulation_id}",
    response_model=SimulationRead,
    responses={404: {"model": MessageResponse}},
)
async def read_simulation(service: SimulationServiceDep, simulation_id: int):
    return await service.read_simulation(simulation_id)


@router.put(
    "/{simulation_id}",
    response_model=MessageResponse,
    responses={404: {"model": MessageResponse}, 409: {"model": MessageResponse}},
)
async def update_simulation(
    service: SimulationServiceDep, simulation_id: int, simulation: SimulationUpdate
):
    return await service.update_simulation(simulation_id, simulation)


@router.delete(
    "/{simulation_id}",
    response_model=MessageResponse,
    responses={404: {"model": MessageResponse}},
)
async def delete_simulation(service: SimulationServiceDep, simulation_id: int):
    return await service.delete_simulation(simulation_id)


@router.post(
    "/{simulation_id}/import",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    responses={501: {"model": MessageResponse}},
)
async def import_simulation(service: SimulationServiceDep, simulation_id: int):
    return await service.import_simulation(simulation_id)


@router.post(
    "/{simulation_id}/export",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    responses={501: {"model": MessageResponse}},
)
async def export_simulation(service: SimulationServiceDep, simulation_id: int):
    return await service.export_simulation(simulation_id)


@router.post(
    "/{simulation_id}/view",
    status_code=status.HTTP_200_OK,
    responses={404: {"model": MessageResponse}},
)
async def view_simulation(
    service: SimulationServiceDep,
    src_repo: SourceRepositoryDep,
    vol_repo: VolumeRepositoryDep,
    simulation_id: int,
):
    return await service.view_simulation(simulation_id, src_repo, vol_repo)


@router.post(
    "/{simulation_id}/run",
    status_code=status.HTTP_200_OK,
    responses={404: {"model": MessageResponse}},
)
async def run_simulation(
    service: SimulationServiceDep,
    src_repo: SourceRepositoryDep,
    vol_repo: VolumeRepositoryDep,
    simulation_id: int,
):
    return await service.run_simulation(simulation_id, src_repo, vol_repo)

from fastapi import APIRouter, status
from app.api.dependencies import SimulationServiceDep
from app.schemas.api import MessageResponse
from app.schemas.simulation import (
    SimulationCreate,
    SimulationUpdate,
    SimulationRead,
)
from typing import List

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.get("/", response_model=List[SimulationRead], status_code=status.HTTP_200_OK)
async def read_simulations(service: SimulationServiceDep):
    return await service.read_simulations()


@router.post(
    "/",
    response_model=SimulationRead,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": MessageResponse}},
)
async def create_simulation(
    service: SimulationServiceDep, simulation: SimulationCreate
):
    return await service.create_simulation(simulation)


@router.get(
    "/{id}",
    response_model=SimulationRead,
    status_code=status.HTTP_200_OK,
    responses={404: {"model": MessageResponse}},
)
async def read_simulation(service: SimulationServiceDep, id: int):
    return await service.read_simulation(id)


@router.put(
    "/{id}",
    response_model=SimulationRead,
    status_code=status.HTTP_200_OK,
    responses={404: {"model": MessageResponse}, 409: {"model": MessageResponse}},
)
async def update_simulation(
    service: SimulationServiceDep, id: int, simulation: SimulationUpdate
):
    return await service.update_simulation(id, simulation)


@router.delete(
    "/{id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    responses={404: {"model": MessageResponse}},
)
async def delete_simulation(service: SimulationServiceDep, id: int):
    return await service.delete_simulation(id)


@router.get(
    "/{id}/import",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    responses={501: {"model": MessageResponse}},
)
async def import_simulation(service: SimulationServiceDep, id: int):
    return await service.import_simulation(id)


@router.get(
    "/{id}/export",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    responses={501: {"model": MessageResponse}},
)
async def export_simulation(service: SimulationServiceDep, id: int):
    return await service.export_simulation(id)


@router.get(
    "/{id}/view",
    status_code=status.HTTP_200_OK,
    responses={404: {"model": MessageResponse}},
)
async def view_simulation(service: SimulationServiceDep, id: int):
    return await service.view_simulation(id)


@router.get(
    "/{id}/run",
    status_code=status.HTTP_200_OK,
    responses={404: {"model": MessageResponse}},
)
async def run_simulation(service: SimulationServiceDep, id: int):
    return await service.run_simulation(id)

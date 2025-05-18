import os
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from fastapi.responses import FileResponse
from app.simulations.dependencies import SimulationServiceDep
from app.sources.dependencies import SourceRepositoryDep, SourceServiceDep
from app.shared.message import MessageResponse
from app.simulations.schema import (
    ReconstructionParams,
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
    "/{sim_id}",
    response_model=SimulationRead,
    responses={404: {"model": MessageResponse}},
)
async def read_simulation(service: SimulationServiceDep, sim_id: int):
    return await service.read_simulation(sim_id)


@router.put(
    "/{sim_id}",
    response_model=MessageResponse,
    responses={404: {"model": MessageResponse}, 409: {"model": MessageResponse}},
)
async def update_simulation(
    service: SimulationServiceDep, sim_id: int, simulation: SimulationUpdate
):
    return await service.update_simulation(sim_id, simulation)


@router.delete(
    "/{sim_id}",
    response_model=MessageResponse,
    responses={404: {"model": MessageResponse}},
)
async def delete_simulation(service: SimulationServiceDep, sim_id: int):
    return await service.delete_simulation(sim_id)


@router.post(
    "/{sim_id}/import",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    responses={501: {"model": MessageResponse}},
)
async def import_simulation(service: SimulationServiceDep, sim_id: int):
    return await service.import_simulation(sim_id)


@router.get(
    "/{sim_id}/export",
    response_class=FileResponse,
    responses={404: {"model": MessageResponse}},
)
async def export_simulation(
    background_tasks: BackgroundTasks,
    service: SimulationServiceDep,
    sim_id: int
    ):
    zip_path = await service.export_simulation(sim_id)

    background_tasks.add_task(os.remove, zip_path)

    return FileResponse(
        path=zip_path,
        media_type="application/zip",
        filename=os.path.basename(zip_path),
    )


@router.post(
    "/{sim_id}/view",
    status_code=status.HTTP_200_OK,
    responses={404: {"model": MessageResponse}},
)
async def view_simulation(
    service: SimulationServiceDep,
    src_repo: SourceRepositoryDep,
    vol_repo: VolumeRepositoryDep,
    sim_id: int,
):
    return await service.view_simulation(sim_id, src_repo, vol_repo)


@router.post(
    "/{sim_id}/run",
    status_code=status.HTTP_200_OK,
    responses={404: {"model": MessageResponse}},
)
async def run_simulation(
    service: SimulationServiceDep,
    src_repo: SourceRepositoryDep,
    vol_repo: VolumeRepositoryDep,
    sim_id: int,
):
    return await service.run_simulation(sim_id, src_repo, vol_repo)


@router.post(
    "/{sim_id}/reconstruct",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=MessageResponse,
    responses={404: {"model": MessageResponse}},
)
async def reconstruct(
    sim_id: int,
    params: ReconstructionParams,
    service: SimulationServiceDep,
):
    """Trigger FBP reconstruction of the projection stack."""
    out_path = await service.reconstruct_simulation(
        sim_id,
        params.sod,
        params.sdd
    )
    return {"message": f"Reconstruction finished - for results export the simulation"}

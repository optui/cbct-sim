from fastapi import APIRouter
from backend.api.dependencies import SimulationServiceDep
from backend.schemas.simulation import SimulationCreate, SimulationUpdate, SimulationRead
from typing import List

router = APIRouter(prefix="/simulations", tags=["Simulations"])

@router.get("/", response_model=List[SimulationRead])
async def read_simulations(service: SimulationServiceDep):
    return await service.read_simulations()

@router.post("/", response_model=SimulationRead)
async def create_simulation(service: SimulationServiceDep, simulation: SimulationCreate):
    return await service.create_simulation(simulation)

@router.get("/{id}/", response_model=SimulationRead)
async def read_simulation(service: SimulationServiceDep, id: int):
    return await service.read_simulation(id)

@router.put("/{id}/", response_model=SimulationRead)
async def update_simulation(service: SimulationServiceDep, id: int, simulation: SimulationUpdate):
    return await service.update_simulation(id, simulation)
    
@router.delete("/{id}/")
async def delete_simulation(service: SimulationServiceDep, id: int):
    return await service.delete_simulation(id)

@router.get("/{id}/import")
async def import_simulation(service: SimulationServiceDep, id: int):
    return await service.import_simulation(id)

@router.get("/{id}/export")
async def export_simulation(service: SimulationServiceDep, id: int):
    return await service.export_simulation(id)

@router.get("/{id}/view")
async def view_simulation(service: SimulationServiceDep, id: int):
    return await service.view_simulation(id)

@router.get("/{id}/run")
async def run_simulation(service: SimulationServiceDep, id: int):
    return await service.run_simulation(id)

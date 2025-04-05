import os
import shutil
from fastapi import HTTPException
from backend.repositories.simulation_repository import SimulationRepository
from backend.repositories.source_repository import SourceRepository
from backend.schemas.api import MessageResponse
from backend.schemas.simulation import SimulationCreate, SimulationRead, SimulationUpdate
from backend.utils.utils import UNIT_MAP, get_gate_simulation, handle_directory_rename, to_json_file


class SimulationService:
    def __init__(self, simulation_repository: SimulationRepository):
        self.sim_repo = simulation_repository

    async def create_simulation(self, sim_create: SimulationCreate) -> SimulationRead:
        sim: SimulationRead = await self.sim_repo.create(sim_create)
        to_json_file(sim)
        return sim

    async def read_simulations(self) -> list[SimulationRead]:
        return await self.sim_repo.read_all()

    async def read_simulation(self, id: int) -> SimulationRead:
        sim: SimulationRead | None = await self.sim_repo.read(id)
        if not sim:
            raise HTTPException(status_code=404, detail=f"Simulation with id {id} not found")
        return sim

    async def update_simulation(self, id: int, sim_update: SimulationUpdate) -> SimulationRead:
        existing_sim: SimulationRead = await self.read_simulation(id)
        handle_directory_rename(existing_sim, sim_update.name)
        updated_sim = await self.sim_repo.update(id, sim_update)
        to_json_file(updated_sim)
        return updated_sim

    async def delete_simulation(self, id: int) -> MessageResponse:
        sim: SimulationRead | None = await self.sim_repo.delete(id)
        if not sim:
            raise HTTPException(status_code=404, detail=f"Simulation with id {id} not found")
        if os.path.exists(sim.output_dir):
            shutil.rmtree(sim.output_dir)
        return {"message": "Simulation deleted successfully"}

    async def import_simulation(self, id: int) -> MessageResponse:
        raise HTTPException(status_code=501, detail="Import functionality not implemented yet")

    async def export_simulation(self, id: int) -> MessageResponse:
        raise HTTPException(status_code=501, detail="Export functionality not implemented yet")

    async def view_simulation(self, id: int, source_repository: SourceRepository) -> MessageResponse:
        gate_sim = await get_gate_simulation(id, self.sim_repo, source_repository)
        gate_sim.visu = True
        gate_sim.run(start_new_process=True)
        return {"message": "Simulation visualization ended"}

    async def run_simulation(self, id: int, source_repository: SourceRepository) -> MessageResponse:
        gate_sim = await get_gate_simulation(id, self.sim_repo, source_repository)
        gate_sim.visu = False
        gate_sim.run(start_new_process=True)
        return {"message": "Simulation finished running"}

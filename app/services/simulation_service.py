import os
import shutil
from fastapi import HTTPException, status
from app.repositories.simulation_repository import SimulationRepository
from app.repositories.source_repository import SourceRepository
from app.schemas.simulation import SimulationCreate, SimulationRead, SimulationUpdate
from app.utils.utils import get_gate_simulation
import opengate as gate


class SimulationService:
    def __init__(self, repository: SimulationRepository):
        self.repository = repository

    async def read_simulations(self) -> list:
        return await self.repository.read_simulations()

    async def create_simulation(self, simulation: SimulationCreate) -> dict:
        session_simulation = await self.repository.create(simulation.name)

        gate_simulation = gate.Simulation(
            name=simulation.name,
            output_dir=session_simulation.output_dir,
            json_archive_filename=session_simulation.json_archive_filename,
        )
        gate_simulation.to_json_file()
        return session_simulation

    async def read_simulation(self, id: int) -> SimulationRead:
        simulation = await self.repository.read_simulation(id)
        if not simulation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Simulation with id {id} not found",
            )
        return simulation

    async def update_simulation(self, id: int, simulation: SimulationUpdate) -> dict:
        current = await self.read_simulation(id)

        old_dir = current.output_dir
        new_dir = f"./output/{simulation.name}"

        if old_dir != new_dir and os.path.exists(old_dir):
            os.rename(old_dir, new_dir)
            old_json_path = os.path.join(new_dir, current.json_archive_filename)
            if os.path.exists(old_json_path):
                os.remove(old_json_path)

        updated = await self.repository.update(id, simulation.name)

        gate_sim = gate.Simulation(
            name=simulation.name,
            output_dir=updated.output_dir,
            json_archive_filename=updated.json_archive_filename,
        )
        gate_sim.to_json_file()

        return updated

    async def delete_simulation(self, id: int) -> dict:
        simulation = await self.repository.delete(id)
        if not simulation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Simulation with id {id} not found",
            )

        if os.path.exists(simulation.output_dir):
            shutil.rmtree(simulation.output_dir)

        return {"message": "Simulation deleted successfully"}

    async def import_simulation(self, id: int) -> dict:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Import functionality not implemented yet",
        )

    async def export_simulation(self, id: int) -> dict:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Export functionality not implemented yet",
        )

    async def view_simulation(self, id: int, source_repository: SourceRepository) -> dict:
        gate_simulation = await get_gate_simulation(id, self.repository, source_repository)
        gate_simulation.visu = True
        gate_simulation.run(start_new_process=True)
        return {"message": "Simulation visualization started"}

    async def run_simulation(self, id: int, source_repository: SourceRepository) -> dict:
        gate_simulation = await get_gate_simulation(id, self.repository, source_repository)
        gate_simulation.visu = False
        gate_simulation.run(start_new_process=True)
        return {"message": "Simulation started"}

import os
import shutil
from fastapi import HTTPException
from backend.repositories.simulation_repository import SimulationRepository
from backend.schemas.simulation import SimulationCreate, SimulationUpdate

import opengate as gate

class SimulationService:
    """Handles business logic for simulations."""

    def __init__(self, repository: SimulationRepository):
        self.repository = repository

    async def read_simulations(self):
        return await self.repository.get_simulations()

    async def create_simulation(self, simulation: SimulationCreate):
        existing_simulation = await self.repository.get_simulation_by_name(simulation.name)
        if existing_simulation:
            raise HTTPException(status_code=400, detail="Simulation name in use!")
        session_simulation = await self.repository.create(simulation.name)
        if not session_simulation:
            raise HTTPException(status_code=400, detail="IntegrityError")
        
        gate_simulation = gate.Simulation(
            name=simulation.name,
            output_dir=f"./output/{simulation.name}",
            json_archive_filename = f"{simulation.name}.json"
        )
        
        gate_simulation.to_json_file()

        return session_simulation

    async def read_simulation(self, id: int):
        session_simulation = await self.repository.get_simulation_by_id(id)
        if not session_simulation:
            raise HTTPException(status_code=404, detail="Simulation not found")
        return session_simulation

    async def update_simulation(self, id: int, simulation: SimulationUpdate):
        session_simulation = await self.repository.update(id, simulation.name)
        if not session_simulation:
            raise HTTPException(status_code=404, detail="Simulation not found")
        return session_simulation

    async def delete_simulation(self, id: int):
        session_simulation = await self.repository.delete(id)
        if not session_simulation:
            raise HTTPException(status_code=404, detail="Simulation not found")
        if os.path.exists(session_simulation.output_dir):
            shutil.rmtree(session_simulation.output_dir)
        return {"message": "Simulation deleted successfully"}

    async def _get_gate_simulation(self, id: int) -> gate.Simulation:
        session_simulation = await self.read_simulation(id)
        path: str = f"{session_simulation.output_dir}/{session_simulation.json_archive_filename}"
        gate_simulation = gate.Simulation()
        gate_simulation.from_json_file(path)
        return gate_simulation

    async def import_simulation(self, id: int):
        pass

    async def export_simulation(self, id: int):
        pass

    async def view_simulation(self, id: int):
        gate_simulation = await self._get_gate_simulation(id)
        gate_simulation.visu = True
        gate_simulation.run(start_new_process=True)

    async def run_simulation(self, id: int):
        gate_simulation = await self._get_gate_simulation(id)
        gate_simulation.visu = False
        gate_simulation.run(start_new_process=True)

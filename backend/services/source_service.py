import opengate as gate
from fastapi import HTTPException
from backend.schemas.source import SourceCreate

class SourceService:
    async def read_sources(self, id: int):
        gate_simulation = await self._get_gate_simulation(id)
        sources: list = gate_simulation.source_manager.sources.keys()
        return sources
    
    async def create_source(self, simulation_id: int, source_data: SourceCreate):
        # Get the simulation object
        gate_sim = await self._get_gate_simulation(simulation_id)
        
        # Ensure source name doesn't already exist
        if source_data.name in gate_sim.source_manager.sources:
            raise HTTPException(status_code=400, detail=f"Source '{source_data.name}' already exists.")
        
        # Create and configure the source
        source = gate_sim.add_source(source_data.type, source_data.name)
        
        source.particle = source_data.particle
        source.energy.mono = source_data.energy_mono  # Set mono energy
        
        # Optional energy range configuration
        if source_data.energy_min and source_data.energy_max:
            source.energy.min = source_data.energy_min
            source.energy.max = source_data.energy_max
        
        source.position.type = source_data.position_type
        source.position.size = source_data.position_size  # Set position size
        
        source.direction.type = source_data.direction_type
        source.direction.focus_point = source_data.focus_point  # Set direction focus point
        
        source.n = source_data.number_of_particles / gate_sim.number_of_threads  # Distribute particles across threads
        
        # Handle activity if present (for now it's just an integer)
        if source_data.activity:
            # Integrate the activity in some way (you can refine this logic)
            source.activity = source_data.activity  # Just an example of using activity
        
        gate_sim.to_json_file()  # Save the simulation after adding the source

        return {"message": f"Source '{source_data.name}' created successfully"}

    async def _get_gate_simulation(self, simulation_id: int) -> gate.Simulation:
        # Fetch the simulation from your simulation service
        return await self.simulation_service._get_gate_simulation(simulation_id)

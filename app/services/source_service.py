import json
import opengate as gate
from fastapi import HTTPException, status
from app.models import Source
from app.services.simulation_service import SimulationService
from app.repositories.source_repository import SourceRepository
from app.utils.utils import get_gate_simulation, UNIT_MAP
from app.schemas.source import GenericSourceCreate, GenericSourceRead

class SourceService:
    def __init__(self, simulation_service: SimulationService, source_repository: SourceRepository):
        self.simulation_service = simulation_service
        self.source_repository = source_repository

    async def read_sources(self, simulation_id: int) -> list[str]:
        sources = await self.source_repository.read_sources(simulation_id)
        return [source.name for source in sources]

    async def create_source(self, simulation_id: int, source: GenericSourceCreate) -> dict:
        gate_sim = await get_gate_simulation(simulation_id, self.simulation_service.repository, self.source_repository)

        new_source = gate_sim.add_source("GenericSource", source.name)
        new_source.particle = source.particle.value

        # Handle Position
        pos = source.position
        if pos.type == "box":
            new_source.position.type = "box"
            factor = UNIT_MAP[pos.unit]
            new_source.position.size = [s * factor for s in pos.size]
            new_source.position.translation = [s * factor for s in pos.translation]

        # Handle Direction
        direction = source.direction
        if direction.type == "focused":
            new_source.direction.type = "focused"
            new_source.direction.focus_point = [s * factor for s in direction.focus_point]

        # Handle Energy
        energy = source.energy
        if energy.type == "mono":
            energy_factor = UNIT_MAP[energy.unit]
            new_source.energy.type = "mono"
            new_source.energy.mono = energy.mono * energy_factor

        # Set activity or n if provided
        if source.activity:
            activity_factor = UNIT_MAP[source.activity_unit]
            new_source.activity = source.activity * activity_factor
        if source.n:
            new_source.n = source.n

        # Save simulation config
        gate_sim.to_json_file()

        # Store source info in DB
        db_source = Source(
            simulation_id=simulation_id,
            name=source.name,
            attached_to=source.attached_to,
            particle=source.particle.value,
            position=json.loads(source.position.model_dump_json()),
            direction=json.loads(source.direction.model_dump_json()),
            energy=json.loads(source.energy.model_dump_json()),
            n=source.n,
            activity=source.activity,
            activity_unit=source.activity_unit,
        )
        await self.source_repository.create(db_source)

        return {"name": source.name}
    

    async def read_source(self, simulation_id: int, name: str) -> GenericSourceRead:
        source = await self.source_repository.read_source_by_name(simulation_id, name)
        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in simulation '{simulation_id}'."
            )
        return GenericSourceRead.model_validate(source)


    async def delete_source(self, simulation_id: int, name: str) -> dict:
        gate_sim = await get_gate_simulation(simulation_id, self.simulation_service.repository, self.source_repository)

        # Correct check here
        if name not in gate_sim.source_manager.sources:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in simulation."
            )

        # Remove source explicitly and correctly
        del gate_sim.source_manager.sources[name]

        # Save simulation config
        gate_sim.to_json_file()

        # Delete from DB
        source_deleted = await self.source_repository.delete(simulation_id, name)
        if not source_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in database."
            )

        return {"message": f"Source '{name}' deleted successfully"}

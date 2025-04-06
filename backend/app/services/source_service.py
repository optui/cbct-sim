import json
import opengate as gate
from fastapi import HTTPException, status
from app.models import Source
from app.services.simulation_service import SimulationService
from app.repositories.source_repository import SourceRepository
from app.schemas.source import (
    GenericSourceCreate,
    GenericSourceRead,
    GenericSourceUpdate,
)
from app.utils.utils import UNIT_MAP

class SourceService:
    def __init__(
        self,
        simulation_service: SimulationService,
        source_repository: SourceRepository
    ):
        self.sim_service = simulation_service
        self.source_repository = source_repository

    async def read_sources(self, sim_id: int) -> list[str]:
        sources = await self.source_repository.read_sources(sim_id)
        return [source.name for source in sources]

    async def create_source(
        self,
        sim_id: int,
        source_data: GenericSourceCreate
    ) -> GenericSourceRead:
        """
        Create a new Gate source and save it in the database.
        Return the newly created source details as GenericSourceRead.
        """

        gate_sim = await self.sim_service.read_simulation(sim_id)

        # 1. Add the source to Gate's simulation
        new_source = gate_sim.add_source("GenericSource", source_data.name)
        new_source.particle = source_data.particle.value

        # position
        pos = source_data.position
        factor_position = UNIT_MAP[pos.unit]
        if pos.type == "box":
            new_source.position.type = "box"
            new_source.position.size = [s * factor_position for s in pos.size]
            new_source.position.translation = [
                s * factor_position for s in pos.translation
            ]
            # If you handle rotation as well, apply it here

        # direction
        direction = source_data.direction
        if direction.type == "focused":
            new_source.direction.type = "focused"
            # Note: using the same factor as position if relevant
            new_source.direction.focus_point = [
                s * factor_position for s in direction.focus_point
            ]

        # energy
        energy = source_data.energy
        factor_energy = UNIT_MAP[energy.unit]
        if energy.type == "mono":
            new_source.energy.type = "mono"
            new_source.energy.mono = energy.mono * factor_energy

        # activity or number of particles
        if source_data.activity is not None:
            activity_factor = UNIT_MAP.get(source_data.activity_unit, 1)
            new_source.activity = source_data.activity * activity_factor

        if source_data.n is not None:
            new_source.n = source_data.n

        # 2. Save the Gate simulation config
        gate_sim.to_json_file()

        # 3. Store source info in DB
        db_source = Source(
            sim_id=sim_id,
            name=source_data.name,
            attached_to=source_data.attached_to,
            particle=source_data.particle.value,
            position=json.loads(source_data.position.model_dump_json()),
            direction=json.loads(source_data.direction.model_dump_json()),
            energy=json.loads(source_data.energy.model_dump_json()),
            n=source_data.n,
            activity=source_data.activity,
            activity_unit=source_data.activity_unit,
        )
        await self.source_repository.create(db_source)

        # 4. Return the newly created source, but in a `GenericSourceRead` format
        return await self.read_source(sim_id, source_data.name)

    async def read_source(self, sim_id: int, name: str) -> GenericSourceRead:
        """
        Load the source from DB and return it as GenericSourceRead.
        """
        source = await self.source_repository.read_source_by_name(sim_id, name)
        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in simulation '{sim_id}'."
            )
        return GenericSourceRead.model_validate(source)

    async def update_source(
        self,
        sim_id: int,
        name: str,
        update: GenericSourceUpdate
    ) -> GenericSourceRead:
        # Step 1: Load existing source
        existing: Source = await self.source_repository.read_source_by_name(sim_id, name)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Source '{name}' not found")

        # Step 2: Merge update fields into existing SQLAlchemy model
        update_data = update.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(existing, field, value)

        # Step 3: Save it back to the DB
        updated = await self.source_repository.update(existing)

        # Step 4: Return the updated object
        return GenericSourceRead.model_validate(updated)

    async def delete_source(self, sim_id: int, name: str) -> dict:
        """
        Delete the source from Gate and DB, returning a confirmation message.
        """
        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)

        # 1. Delete from Gate
        if name not in gate_sim.source_manager.sources:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in Gate simulation."
            )
        del gate_sim.source_manager.sources[name]

        gate_sim.to_json_file()

        # 2. Delete from DB
        source_deleted = await self.source_repository.delete(sim_id, name)
        if not source_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in DB."
            )

        return {"message": f"Source '{name}' deleted successfully"}

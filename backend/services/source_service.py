import json
import opengate as gate
from fastapi import HTTPException, status
from backend.models import Source
from backend.services.simulation_service import SimulationService
from backend.repositories.source_repository import SourceRepository
from backend.schemas.source import (
    GenericSourceCreate,
    GenericSourceRead,
    GenericSourceUpdate,
)
from backend.utils.utils import get_gate_simulation_without_sources, UNIT_MAP

class SourceService:
    def __init__(
        self,
        simulation_service: SimulationService,
        source_repository: SourceRepository
    ):
        self.simulation_service = simulation_service
        self.source_repository = source_repository

    async def read_sources(self, simulation_id: int) -> list[str]:
        sources = await self.source_repository.read_sources(simulation_id)
        return [source.name for source in sources]

    async def create_source(
        self,
        simulation_id: int,
        source_data: GenericSourceCreate
    ) -> GenericSourceRead:
        """
        Create a new Gate source and save it in the database.
        Return the newly created source details as GenericSourceRead.
        """

        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )

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
            simulation_id=simulation_id,
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
        return await self.read_source(simulation_id, source_data.name)

    async def read_source(self, simulation_id: int, name: str) -> GenericSourceRead:
        """
        Load the source from DB and return it as GenericSourceRead.
        """
        source = await self.source_repository.read_source_by_name(simulation_id, name)
        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in simulation '{simulation_id}'."
            )
        return GenericSourceRead.model_validate(source)

    async def update_source(
        self,
        simulation_id: int,
        name: str,
        source_update: GenericSourceUpdate
    ) -> GenericSourceRead:
        """
        Update an existing source in Gate and the DB,
        then return the updated source as `GenericSourceRead`.
        """

        # 1. Check if source exists in DB
        existing = await self.source_repository.read_source_by_name(simulation_id, name)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in simulation '{simulation_id}'."
            )

        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )

        # 2. Check if source exists in Gate
        if name not in gate_sim.source_manager.sources:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in Gate simulation."
            )

        gate_source = gate_sim.source_manager.sources[name]

        # 3. Update fields if provided
        if source_update.attached_to is not None:
            existing.attached_to = source_update.attached_to
            # Gate doesn't have a direct "attached_to" concept unless you implement it,
            # but you can handle that if needed.

        if source_update.particle is not None:
            existing.particle = source_update.particle.value
            gate_source.particle = source_update.particle.value

        # position
        if source_update.position is not None:
            pos = source_update.position
            factor_position = UNIT_MAP[pos.unit]
            if pos.type == "box":
                gate_source.position.type = "box"
                gate_source.position.size = [s * factor_position for s in pos.size]
                gate_source.position.translation = [
                    s * factor_position for s in pos.translation
                ]
            # Save position to DB
            existing.position = json.loads(pos.model_dump_json())

        # direction
        if source_update.direction is not None:
            direction = source_update.direction
            # Possibly same factor as position if needed
            factor_position = 1  # or UNIT_MAP[...]
            if direction.type == "focused":
                gate_source.direction.type = "focused"
                gate_source.direction.focus_point = [
                    s * factor_position for s in direction.focus_point
                ]
            existing.direction = json.loads(direction.model_dump_json())

        # energy
        if source_update.energy is not None:
            energy = source_update.energy
            factor_energy = UNIT_MAP[energy.unit]
            if energy.type == "mono":
                gate_source.energy.type = "mono"
                gate_source.energy.mono = energy.mono * factor_energy
            existing.energy = json.loads(energy.model_dump_json())

        # activity
        if source_update.activity is not None:
            activity_factor = UNIT_MAP.get(
                source_update.activity_unit or existing.activity_unit,
                1
            )
            gate_source.activity = source_update.activity * activity_factor
            existing.activity = source_update.activity

            if source_update.activity_unit is not None:
                existing.activity_unit = source_update.activity_unit

        # n
        if source_update.n is not None:
            gate_source.n = source_update.n
            existing.n = source_update.n

        # 4. Save Gate config
        gate_sim.to_json_file()

        # 5. Save changes to DB
        await self.source_repository.update(existing)  # or whatever your repo method is

        # 6. Return updated version
        return GenericSourceRead.model_validate(existing)

    async def delete_source(self, simulation_id: int, name: str) -> dict:
        """
        Delete the source from Gate and DB, returning a confirmation message.
        """
        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )

        # 1. Delete from Gate
        if name not in gate_sim.source_manager.sources:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in Gate simulation."
            )
        del gate_sim.source_manager.sources[name]

        gate_sim.to_json_file()

        # 2. Delete from DB
        source_deleted = await self.source_repository.delete(simulation_id, name)
        if not source_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in DB."
            )

        return {"message": f"Source '{name}' deleted successfully"}

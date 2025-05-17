from fastapi import HTTPException, status
from app.sources.model import Source
from app.simulations.service import SimulationService
from app.sources.repository import SourceRepository
from app.sources.schema import (
    GenericSourceCreate,
    GenericSourceRead,
    GenericSourceUpdate,
    BoxPosition
)
from app.shared.primitives import Unit, UNIT_TO_GATE
from app.shared.message import MessageResponse

class SourceService:
    def __init__(
        self, simulation_service: SimulationService, source_repository: SourceRepository
    ):
        self.sim_service = simulation_service
        self.source_repository = source_repository

    async def read_sources(self, sim_id: int) -> list[str]:
        sources = await self.source_repository.read_all(sim_id)
        return [source.name for source in sources]

    async def create_source(
        self, sim_id: int, source_data: GenericSourceCreate
    ) -> MessageResponse:
        """
        Create a new Gate source and save it in the database.
        Return the newly created source details as GenericSourceRead.
        """

        gate_sim = await self.sim_service.get_gate_sim_without_sources(sim_id)

        if source_data.name in await self.read_sources(sim_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{source_data.name}' already exists!",
            )

        gate_source = gate_sim.add_source("GenericSource", source_data.name)
        gate_source.attached_to = source_data.attached_to
        gate_source.particle = source_data.particle

        # position
        pos: BoxPosition = source_data.position
        factor_position = UNIT_TO_GATE[Unit(pos.unit)]
        gate_source.position.type = pos.type
        gate_source.position.size = [
            s * factor_position for s in pos.size
        ]
        gate_source.position.translation = [
            s * factor_position for s in pos.translation
        ]

        # focus point
        gate_source.direction.type = "focused"
        gate_source.direction.focus_point = [
            s * factor_position for s in source_data.focus_point
        ]

        # energy
        factor_energy = UNIT_TO_GATE[Unit(source_data.energy.unit)]
        gate_source.energy.mono = source_data.energy.energy * factor_energy

        # activity
        activity_factor = UNIT_TO_GATE[Unit(source_data.unit)]
        gate_source.activity = source_data.activity * activity_factor

        await self.source_repository.create(sim_id, source_data)

        return {"message": f"Source '{source_data.name}' created successfully"}

    async def read_source(self, sim_id: int, name: str) -> GenericSourceRead:
        """
        Load the source from DB and return it as GenericSourceRead.
        """
        source = await self.source_repository.read(sim_id, name)
        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in simulation '{sim_id}'.",
            )
        return GenericSourceRead.model_validate(source)

    async def update_source(
        self, sim_id: int, name: str, update: GenericSourceUpdate
    ) -> MessageResponse:
        existing: Source = await self.source_repository.read(
            sim_id, name
        )
        if not existing:
            raise HTTPException(status_code=404, detail=f"Source '{name}' not found")

        update_data = update.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(existing, field, value)

        await self.source_repository.update(existing)

        return {"message": f"Source '{update.name}' updated successfully"}

    async def delete_source(self, sim_id: int, name: str) -> MessageResponse:
        """
        Delete the source from Gate and DB, returning a confirmation message.
        """
        source_deleted = await self.source_repository.delete(sim_id, name)
        if not source_deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Source '{name}' not found in DB.",
            )

        return {"message": f"Source '{name}' deleted successfully"}

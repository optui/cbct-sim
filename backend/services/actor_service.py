from fastapi import HTTPException, status
from backend.utils.utils import get_gate_simulation_without_sources
from backend.services.simulation_service import SimulationService
from backend.schemas.actor import (
    ActorCreate,
    ActorRead,
    ActorUpdate,
    SimulationStatisticsActorConfig,
    DigitizerHitsCollectionActorConfig,
    DigitizerProjectionActorConfig,
)
import opengate as gate


class ActorService:
    def __init__(self, simulation_service: SimulationService):
        self.simulation_service = simulation_service

    async def get_actors(self, simulation_id: int):
        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )
        return list(gate_sim.actor_manager.actors.keys())

    async def create_actor(self, simulation_id: int, actor: ActorCreate):
        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )

        actor_instance = gate_sim.add_actor(actor.type, actor.name)

        if isinstance(actor, SimulationStatisticsActorConfig):
            actor_instance.output_filename = actor.output_filename

        elif isinstance(actor, DigitizerHitsCollectionActorConfig):
            actor_instance.attached_to = actor.attached_to
            actor_instance.attributes = actor.attributes
            actor_instance.output_filename = actor.output_filename

        elif isinstance(actor, DigitizerProjectionActorConfig):
            actor_instance.attached_to = actor.attached_to
            actor_instance.input_digi_collections = actor.input_digi_collections
            actor_instance.spacing = actor.spacing
            actor_instance.size = actor.size
            actor_instance.origin_as_image_center = actor.origin_as_image_center
            actor_instance.output_filename = actor.output_filename

        else:
            raise HTTPException(status_code=400, detail="Unsupported actor type")

        gate_sim.to_json_file()
        return {"message": f"Actor '{actor.name}' of type '{actor.type}' created."}

    async def read_actor(self, simulation_id: int, actor_name: str):
        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )
        
        if actor_name not in gate_sim.actor_manager.actors:
            raise HTTPException(
                status_code=404,
                detail=f"Actor '{actor_name}' not found in simulation '{simulation_id}'"
            )

        actor_instance = gate_sim.actor_manager.actors[actor_name]
        
        if isinstance(actor_instance, gate.opengate.actors.miscactors.SimulationStatisticsActor):
            return SimulationStatisticsActorConfig(
                name=actor_name,
                output_filename=actor_instance.output_filename
            )
        elif isinstance(actor_instance, gate.opengate.actors.digitizers.DigitizerHitsCollectionActor):
            return DigitizerHitsCollectionActorConfig(
                name=actor_name,
                attached_to=actor_instance.attached_to,
                attributes=actor_instance.attributes,
                output_filename=actor_instance.output_filename
            )
        elif isinstance(actor_instance, gate.opengate.actors.digitizers.DigitizerProjectionActor):
            return DigitizerProjectionActorConfig(
                name=actor_name,
                attached_to=actor_instance.attached_to,
                input_digi_collections=actor_instance.input_digi_collections,
                spacing=actor_instance.spacing,
                size=actor_instance.size,
                origin_as_image_center=actor_instance.origin_as_image_center,
                output_filename=actor_instance.output_filename
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported actor type")

    async def update_actor(self, simulation_id: int, actor_name: str, actor_update: ActorUpdate):
        gate_sim = await get_gate_simulation_without_sources(
            simulation_id, self.simulation_service.repository
        )

        if actor_name not in gate_sim.actor_manager.actors:
            raise HTTPException(
                status_code=404,
                detail=f"Actor '{actor_name}' not found in simulation '{simulation_id}'"
            )

        actor_instance = gate_sim.actor_manager.actors[actor_name]

        if actor_update.name:
            actor_instance.name = actor_update.name

        if actor_update.config:
            if isinstance(actor_update.config, SimulationStatisticsActorConfig):
                actor_instance.output_filename = actor_update.config.output_filename
            elif isinstance(actor_update.config, DigitizerHitsCollectionActorConfig):
                actor_instance.attached_to = actor_update.config.attached_to
                actor_instance.attributes = actor_update.config.attributes
                actor_instance.output_filename = actor_update.config.output_filename
            elif isinstance(actor_update.config, DigitizerProjectionActorConfig):
                actor_instance.attached_to = actor_update.config.attached_to
                actor_instance.input_digi_collections = actor_update.config.input_digi_collections
                actor_instance.spacing = actor_update.config.spacing
                actor_instance.size = actor_update.config.size
                actor_instance.origin_as_image_center = actor_update.config.origin_as_image_center
                actor_instance.output_filename = actor_update.config.output_filename
            else:
                raise HTTPException(status_code=400, detail="Unsupported actor type for update")

        gate_sim.to_json_file()
        return {"message": f"Actor '{actor_name}' updated successfully."}

    def delete_actor(self, actor_name):
        """
        Deletes the actor from the simulation by its name.
        """
        try:
            self.remove_actor(actor_name)
            self.simulation.to_json_file()
            return {"message": f"Actor '{actor_name}' has been deleted successfully."}
        except KeyError:
            raise HTTPException(
                status_code=404,
                detail=f"Actor '{actor_name}' not found in the simulation."
            )

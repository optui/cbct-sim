from backend.utils.utils import get_gate_simulation_without_sources

class ActorService:
    async def get_actors(self, id: int):
        gate_simulation = await get_gate_simulation_without_sources(id)
        actors: list = gate_simulation.actor_manager.actors.keys()
        return actors

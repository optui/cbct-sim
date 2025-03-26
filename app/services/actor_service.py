class ActorService:
    async def get_actors(self, id: int):
        gate_simulation = await self._get_gate_simulation(id)
        actors: list = gate_simulation.actor_manager.actors.keys()
        return actors

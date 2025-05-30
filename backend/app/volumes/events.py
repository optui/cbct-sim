from sqlalchemy import event
from app.simulations.model import Simulation
from app.volumes.model import Volume
from app.volumes.schema import VolumeType
from app.shared.primitives import Axis, Unit


WORLD_VOLUME = {
    "name": "world",
    "mother": None,
    "material": "G4_AIR",
    "translation": [0.0, 0.0, 0.0],
    "translation_unit": Unit.MM.value,
    "rotation": {"axis": Axis.X.value, "angle": 0.0},
    "shape": {
        "type": VolumeType.BOX.value,
        "size": [3000.0, 3000.0, 3000.0],
        "unit": Unit.MM.value,
    },
    "dynamic_params": {
        "enabled": False,
        "translation_end": None,
        "angle_end": None,
    },
}


@event.listens_for(Simulation, "after_insert")
def _insert_world_volume(mapper, connection, simulation):
    connection.execute(
        Volume.__table__.insert().values(
            simulation_id=simulation.id,
            **WORLD_VOLUME,
        )
    )

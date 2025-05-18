from pathlib import Path

import opengate as gate
from fastapi import HTTPException, status


from app.simulations.repository import SimulationRepository
from app.sources.repository import SourceRepository
from app.shared.primitives import Unit, UNIT_TO_GATE
from app.sources.schema import BoxPosition, SourceRead

from app.volumes.repository import VolumeRepository


async def get_gate_sim(
    id: int,
    sim_repo: SimulationRepository,
    src_repo: SourceRepository,
    vol_repo: VolumeRepository
) -> gate.Simulation:
    sim_rec = await sim_repo.read(id)
    if not sim_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Simulation with id {id} not found",
        )

    cfg = Path(sim_rec.output_dir) / sim_rec.json_archive_filename
    if not cfg.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation configuration file not found",
        )

    sim = gate.Simulation()
    sim.from_json_file(str(cfg))

    for src in await src_repo.read_all(id):
        data = SourceRead.model_validate(src)
        gs = sim.add_source("GenericSource", data.name)
        gs.particle = data.particle

        pos: BoxPosition = data.position
        factor_position = UNIT_TO_GATE[Unit(pos.unit.value)]
        gs.position.type = pos.type
        gs.position.size = [
            s * factor_position for s in pos.size
        ]
        gs.position.translation = [
            s * factor_position for s in pos.translation
        ]

        gs.direction.type = "focused"
        gs.direction.focus_point = [
            s * factor_position for s in data.focus_point
        ]

        factor_energy = UNIT_TO_GATE[Unit(data.energy.unit.value)]
        gs.energy.mono = data.energy.energy * factor_energy

        activity_factor = UNIT_TO_GATE[Unit(data.unit.value)]
        gs.activity = data.activity * activity_factor

    return sim

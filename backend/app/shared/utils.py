import os
from pathlib import Path

import numpy as np
import opengate as gate
from fastapi import HTTPException, status


from app.sources.model import Source
from app.simulations.repository import SimulationRepository
from app.sources.repository import SourceRepository
from app.shared.primitives import Rotation, UNIT_TO_GATE, Unit


UNIT_MAP = {u.value: UNIT_TO_GATE[u] for u in Unit}


def handle_directory_rename(current, new_name: str) -> None:
    old_dir, new_dir = current.output_dir, f"./output/{new_name}"
    if old_dir != new_dir and os.path.exists(old_dir):
        os.rename(old_dir, new_dir)
        old_json = os.path.join(new_dir, current.json_archive_filename)
        if os.path.exists(old_json):
            os.remove(old_json)


def to_json_file(sim) -> None:
    run_intervals = compute_run_timing_intervals(sim.num_runs, sim.run_len)
    gate.Simulation(
        name=sim.name,
        output_dir=sim.output_dir,
        json_archive_filename=sim.json_archive_filename,
        run_timing_intervals=run_intervals,
    ).to_json_file()


def compute_run_timing_intervals(num_runs: int, run_len: float) -> list[list[float]]:
    return [
        [
            i * run_len * UNIT_TO_GATE[Unit.SEC],
            (i + 1) * run_len * UNIT_TO_GATE[Unit.SEC],
        ]
        for i in range(num_runs)
    ]


async def get_gate_sim(
    id: int,
    simulation_repository: SimulationRepository,
    source_repository: SourceRepository,
) -> gate.Simulation:
    sim_rec = await simulation_repository.read(id)
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

    for src in await source_repository.read_sources(id):
        gs = sim.add_source("GenericSource", src.name)
        gs.particle = src.particle

        pos_factor = UNIT_TO_GATE[Unit(src.position["unit"])]
        if src.position["type"] == "box":
            gs.position.type = "box"
            gs.position.size = [s * pos_factor for s in src.position["size"]]
            gs.position.translation = [
                t * pos_factor for t in src.position["translation"]
            ]

        if src.direction["type"] == "focused":
            gs.direction.type = "focused"
            gs.direction.focus_point = [
                fp * pos_factor for fp in src.direction["focus_point"]
            ]

        e_factor = UNIT_TO_GATE[Unit(src.energy["unit"])]
        if src.energy["type"] == "mono":
            gs.energy.type, gs.energy.mono = "mono", src.energy["mono"] * e_factor

        if src.activity:
            gs.activity = src.activity * UNIT_TO_GATE.get(Unit(src.activity_unit), 1)
        if src.n:
            gs.n = src.n

    return sim

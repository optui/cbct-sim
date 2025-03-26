from pathlib import Path
from fastapi import HTTPException, status
import opengate as gate
from app.repositories.simulation_repository import SimulationRepository

UNIT_MAP = {
    "nm": gate.g4_units.nm,
    "mm": gate.g4_units.mm,
    "cm": gate.g4_units.cm,
    "m": gate.g4_units.m,
    "keV": gate.g4_units.keV,
    "Bq": gate.g4_units.Bq,
}


async def get_gate_simulation(
    id: int, repository: SimulationRepository
) -> gate.Simulation:
    simulation = await repository.read_simulation(id)
    if not simulation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Simulation with id {id} not found",
        )

    path = Path(simulation.output_dir) / simulation.json_archive_filename
    if not path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulation configuration file not found",
        )

    sim = gate.Simulation()
    sim.from_json_file(str(path))
    return sim

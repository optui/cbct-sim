from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class SimulationBase(BaseModel):
    name: str = Field(..., description="A unique name for the simulation", min_length=1)
    num_runs: int = Field(
        1, gt=0, description="Number of times the simulation should run"
    )
    run_len: float = Field(1.0, gt=0, description="Length (in seconds) of each run")


class SimulationCreate(SimulationBase):
    pass


class SimulationUpdate(SimulationBase):
    name: str | None = Field(
        None, description="New unique name for the simulation", min_length=1
    )
    num_runs: int | None = Field(None, gt=0, description="Updated number of runs")
    run_len: float | None = Field(
        None, gt=0, description="Updated run length in seconds"
    )


class SimulationRead(SimulationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Unique database ID of the simulation")
    created_at: datetime = Field(
        ..., description="Timestamp when the simulation was created"
    )
    output_dir: str = Field(..., description="Filesystem path for simulation outputs")
    json_archive_filename: str = Field(
        ..., description="Filename of the simulation's JSON archive"
    )

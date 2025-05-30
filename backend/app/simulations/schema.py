from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class ReconstructionParams(BaseModel):
    sod: float = Field(..., gt=0, description="Source-to-object distance (mm)")
    sdd: float = Field(
        ..., gt=0, description="Source-to-detector distance (mm)"
    )


class ActorBase(BaseModel):
    """Base model for simulation actors with core attributes."""

    attached_to: str = Field(
        "world", description="Entity to which this actor is attached"
    )
    spacing: List[float] = Field(
        [1, 1],
        min_length=2,
        max_length=2,
        description="Spacing in [x, y] format",
    )
    size: List[int] = Field(
        [256, 256],
        min_length=2,
        max_length=2,
        description="Size in pixels [width, height]",
    )
    origin_as_image_center: bool = Field(
        True, description="Whether the origin is at the center of the image"
    )


class ActorUpdate(BaseModel):
    """Model for updating actor attributes with all fields optional."""

    attached_to: Optional[str] = None
    spacing: Optional[List[float]] = Field(None, min_length=2, max_length=2)
    size: Optional[List[int]] = Field(None, min_length=2, max_length=2)
    origin_as_image_center: Optional[bool] = None


class SimulationBase(BaseModel):
    """Base model for simulation with core attributes."""

    name: str = Field(description="Unique name for the simulation")
    num_runs: int = Field(
        1, gt=0, description="No. of times the simulation will run"
    )
    run_len: float = Field(
        1.0, gt=0, description="Length (in seconds) of each run"
    )
    actor: ActorBase = Field(description="Primary actor in the simulation")


class SimulationCreate(SimulationBase):
    """Model for creating new simulations with all required fields."""

    pass


class SimulationUpdate(BaseModel):
    """Model for updating simulation attributes with all fields optional."""

    name: Optional[str] = None
    num_runs: Optional[int] = Field(None, gt=0)
    run_len: Optional[float] = Field(None, gt=0)
    actor: Optional[ActorUpdate] = None


class SimulationRead(SimulationBase):
    """Model for reading simulation data with metadata included."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description="Unique database ID of the simulation")
    created_at: datetime = Field(
        description="Timestamp when the simulation was created"
    )
    output_dir: str = Field(
        description="Relative filesystem path for simulation outputs"
    )
    json_archive_filename: str = Field(
        description="Filename of the simulation's JSON archive"
    )

from pydantic import BaseModel, ConfigDict, Field
from typing import List, Literal
from app.shared.primitives import Unit


class BoxPosition(BaseModel):
    type: Literal["box"]
    translation: List[float] = Field(
        default_factory=lambda: [0.0, 0.0, 0.0], min_items=3, max_items=3
    )
    size: List[float] = Field(
        default_factory=lambda: [0.0, 0.0, 0.0], min_items=3, max_items=3
    )
    unit: Unit = Unit.MM


class MonoEnergy(BaseModel):
    energy: float = 60.0
    unit: Unit = Unit.KEV


class SourceBase(BaseModel):
    name: str
    attached_to: str = "world"
    particle: str = "gamma"

    position: BoxPosition
    focus_point: List[float] = Field(
        default_factory=lambda: [0.0, 0.0, 0.0], min_items=3, max_items=3
    )
    energy: MonoEnergy

    activity: float = 1e4
    unit: Unit = Unit.BQ

    model_config = ConfigDict(from_attributes=True)


# Create schema (identical to base for now)
class SourceCreate(SourceBase):
    pass


# Update schema (all fields optional for PATCH-like updates)
class SourceUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str | None = None
    attached_to: str | None = None
    particle: str | None = "gamma"

    position: BoxPosition | None = None
    focus_point: List[float] | None = Field(None, min_items=3, max_items=3)
    energy: MonoEnergy | None = None

    activity: float | None = None
    activity_unit: Unit | None = None


# Read schema includes ID
class SourceRead(SourceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    simulation_id: int

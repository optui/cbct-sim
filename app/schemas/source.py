from enum import Enum
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Annotated, List, Literal, Optional, Union

class ParticleType(str, Enum):
    GAMMA = "gamma"

class Rotation(BaseModel):
    axis: Literal["x", "y", "z"] = "x"
    angle: float = 0.0

# --- Positions ---
class BoxPosition(BaseModel):
    type: Literal["box"]
    translation: List[float] = Field(default_factory=lambda: [0.0, 0.0, 0.0], min_items=3, max_items=3)
    rotation: Rotation = Field(default_factory=Rotation)
    size: List[float] = Field(..., min_items=3, max_items=3)
    unit: Literal["nm", "mm", "cm", "m"] = "mm"

PositionConfig = Annotated[
    Union[BoxPosition], 
    Field(discriminator="type")
]

# --- Directions ---
class FocusedDirection(BaseModel):
    type: Literal["focused"]
    focus_point: List[float] = Field(..., min_items=3, max_items=3)

DirectionConfig = Annotated[
    Union[FocusedDirection],
    Field(discriminator="type")
]

# --- Energies ---
class MonoEnergy(BaseModel):
    type: Literal["mono"]
    mono: float
    unit: Literal["keV", "MeV", "eV"] = "keV"

EnergyConfig = Annotated[
    Union[MonoEnergy],
    Field(discriminator="type")
]

# --- Base Source ---
class GenericSourceBase(BaseModel):    
    name: str
    attached_to: str = "world"
    particle: ParticleType = ParticleType.GAMMA
    
    position: PositionConfig
    direction: DirectionConfig
    energy: EnergyConfig

    n: Optional[int] = None
    activity: Optional[float] = None
    activity_unit: Literal["Bq", "kBq", "MBq"] = "Bq"

    model_config = ConfigDict(from_attributes=True)

# Create schema (identical to base for now)
class GenericSourceCreate(GenericSourceBase):
    pass

# Update schema (all fields optional for PATCH-like updates)
class GenericSourceUpdate(BaseModel):    
    attached_to: Optional[str] = None
    particle: Optional[ParticleType] = None
    
    position: Optional[PositionConfig] = None
    direction: Optional[DirectionConfig] = None
    energy: Optional[EnergyConfig] = None

    n: Optional[int] = None
    activity: Optional[float] = None
    activity_unit: Optional[Literal["Bq", "kBq", "MBq"]] = None

    model_config = ConfigDict(from_attributes=True)

# Read schema includes ID
class GenericSourceRead(GenericSourceBase):
    id: int

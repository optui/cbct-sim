from enum import Enum
from typing import List, Literal, Union
from pydantic import BaseModel, Field, field_validator


class VolumeType(str, Enum):
    BOX = "Box"
    SPHERE = "Sphere"



class Rotation(BaseModel):
    axis: Literal["x", "y", "z"] = "x"
    angle: float = 0.0

    @field_validator("angle")
    def validate_angle(cls, v):
        if not -360.0 <= v <= 360.0:
            raise ValueError("Rotation angle must be between -360 and 360 degrees.")
        return v



class BoxShape(BaseModel):
    type: Literal[VolumeType.BOX]
    size: List[float] = Field(..., min_items=3, max_items=3)
    unit: Literal["mm", "cm", "m"] = "cm"

    @field_validator("size")
    def validate_size(cls, v):
        if any(s <= 0 for s in v):
            raise ValueError("All dimensions in 'size' must be > 0.")
        return v


class SphereShape(BaseModel):
    type: Literal[VolumeType.SPHERE]
    rmin: float = 0.0
    rmax: float = Field(..., gt=0.0)
    unit: Literal["mm", "cm", "m"] = "cm"

    @field_validator("rmax")
    def validate_rmax(cls, v, values):
        if "rmin" in values and v <= values["rmin"]:
            raise ValueError("rmax must be greater than rmin.")
        return v


VolumeShape = Union[BoxShape, SphereShape]



class VolumeCreate(BaseModel):
    name: str
    mother: str = "world"
    material: str = "G4_AIR"
    translation: List[float] = Field(default=[0.0, 0.0, 0.0], min_items=3, max_items=3)
    rotation: Rotation = Field(default_factory=Rotation)
    color: List[float] = Field(default=[0.25, 0.25, 0.25, 1.0], min_items=4, max_items=4)
    shape: VolumeShape

    @field_validator("color")
    def validate_color(cls, v):
        if any(not 0.0 <= c <= 1.0 for c in v):
            raise ValueError("All color components must be in range [0.0, 1.0]")
        return v


class VolumeUpdate(VolumeCreate):
    pass


class VolumeRead(BaseModel):
    name: str
    mother: str
    material: str
    translation: List[float]
    rotation: Rotation
    color: List[float]
    shape: VolumeShape

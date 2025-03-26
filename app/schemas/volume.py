from typing import List, Literal
from pydantic import BaseModel, Field, model_validator
from enum import Enum


class VolumeType(str, Enum):
    BOX = "Box"
    SPHERE = "Sphere"


class Rotation(BaseModel):
    axis: Literal["x", "y", "z"] = "x"
    angle: float = 0.0


class VolumeShape(BaseModel):
    type: VolumeType
    parameters: dict

    @model_validator(mode="before")
    @classmethod
    def set_shape_defaults(cls, values):
        shape_type = values.get("type")
        parameters = values.get("parameters", {})

        if shape_type == VolumeType.BOX:
            parameters.setdefault("size", [10.0, 10.0, 10.0])
        elif shape_type == VolumeType.SPHERE:
            parameters.setdefault("rmin", 0.0)
            parameters.setdefault("rmax", 5.0)

        values["parameters"] = parameters
        return values


class VolumeCreate(BaseModel):
    name: str
    mother: str = "world"
    material: str = "G4_AIR"
    translation: List[float] = Field(
        default=[0.0, 0.0, 0.0], min_length=3, max_length=3
    )
    rotation: Rotation = Field(default_factory=Rotation)
    color: List[float] = Field(
        default=[0.25, 0.25, 0.25, 1.0], min_length=4, max_length=4
    )
    shape: VolumeShape


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

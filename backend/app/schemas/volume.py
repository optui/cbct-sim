from enum import Enum
from typing import List, Literal, Union, Annotated
from pydantic import BaseModel, Field


class VolumeType(str, Enum):
    BOX = "Box"
    SPHERE = "Sphere"


Vector3 = Annotated[List[float], Field(min_items=3, max_items=3)]
Vector4 = Annotated[List[float], Field(min_items=4, max_items=4)]


class Rotation(BaseModel):
    axis: Literal["x", "y", "z"] = "x"
    angle: float = 0.0


class ShapeBase(BaseModel):
    unit: Literal["mm", "cm", "m"] = "cm"


class BoxShape(ShapeBase):
    type: Literal[VolumeType.BOX]
    size: Vector3


class SphereShape(ShapeBase):
    type: Literal[VolumeType.SPHERE]
    rmin: float = 0.0
    rmax: float = Field(1.0, gt=0.0)


VolumeShape = Annotated[
    Union[BoxShape, SphereShape],
    Field(discriminator="type")
]


class VolumeBase(BaseModel):
    mother: str | None = "world"
    material: str = "G4_AIR"
    translation: Vector3 = [0.0, 0.0, 0.0]
    rotation: Rotation = Rotation()
    color: Vector4 = [0.25, 0.25, 0.25, 1.0]
    shape: VolumeShape


class VolumeCreate(VolumeBase):
    name: str


class VolumeUpdate(BaseModel):
    name: str | None = None
    mother: str | None = None
    material: str | None = None
    translation: Vector3 | None = None
    rotation: Rotation | None = None
    color: Vector4 | None = None
    shape: VolumeShape | None = None


class VolumeRead(VolumeBase):
    name: str

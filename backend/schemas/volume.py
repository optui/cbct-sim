from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from enum import Enum


class VolumeType(str, Enum):
    BOX = "Box"
    SPHERE = "Sphere"


class Rotation(BaseModel):
    axis: Literal["x", "y", "z"] = "x"
    angle: float = 0.0


class Box(BaseModel):
    size: List[float] = Field(default=[10.0, 10.0, 10.0], min_length=3, max_length=3)


class Sphere(BaseModel):
    rmin: float = Field(default=0.0, ge=0.0)
    rmax: float = Field(default=5.0, gt=0.0)


class VolumeBase(BaseModel):
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


class VolumeCreate(VolumeBase):
    type: VolumeType | None = None
    box: Box | None = None
    sphere: Sphere | None = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.type == VolumeType.BOX and self.box is None:
            self.box = Box()
        elif self.type == VolumeType.SPHERE and self.sphere is None:
            self.sphere = Sphere()


class VolumeUpdate(VolumeBase):
    type: Optional[VolumeType] = None
    box: Optional[Box] = None
    sphere: Optional[Sphere] = None


class VolumeRead(VolumeBase):
    type: VolumeType
    box: Optional[Box] = None
    sphere: Optional[Sphere] = None

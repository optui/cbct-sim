from enum import Enum
from typing import Annotated, Literal, Union, List

from pydantic import BaseModel, ConfigDict, Field

from app.shared.primitives import Vector3, Rotation, Unit


class VolumeType(str, Enum):
    BOX = "Box"
    SPHERE = "Sphere"


class BaseShape(BaseModel):
    unit: Unit = Unit.MM


class BoxShape(BaseShape):
    type: Literal[VolumeType.BOX] = Field(VolumeType.BOX, frozen=True)
    size: Vector3 = Field(default_factory=lambda: [10.0, 10.0, 10.0])


class SphereShape(BaseShape):
    type: Literal[VolumeType.SPHERE] = Field(VolumeType.SPHERE, frozen=True)
    rmin: float = Field(0.0, ge=0.0)  # 0.0 means solid sphere
    rmax: float = Field(1.0, gt=0.0)


VolumeShape = Annotated[Union[BoxShape, SphereShape], Field(discriminator="type")]


class DynamicParams(BaseModel):
    enabled: bool = False
    translation_end: Vector3 | None = None
    angle_end: float | None = None


class VolumeBase(BaseModel):
    name: str
    mother: str | None = Field("world")
    material: str = Field("G4_AIR")
    translation: Vector3 = Field(default_factory=lambda: [0.0, 0.0, 0.0])
    translation_unit: Unit = Unit.MM
    rotation: Rotation = Field(default_factory=Rotation)
    shape: VolumeShape
    dynamic_params: DynamicParams = Field(default_factory=DynamicParams)


class VolumeCreate(VolumeBase):
    pass


class VolumeUpdate(BaseModel):
    name: str | None = None
    mother: str | None = None
    material: str | None = None
    translation: Vector3 | None = None
    translation_unit: Unit | None = None
    rotation: Rotation | None = None
    shape: VolumeShape | None = None
    dynamic_params: DynamicParams | None = None


class VolumeRead(VolumeBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    simulation_id: int

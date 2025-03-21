from typing import Optional, List, Literal, Union
from pydantic import BaseModel, Field
from enum import Enum


class VolumeType(str, Enum):
    Box = "Box"
    Sphere = "Sphere"
    Image = "Image"


class UnitType(str, Enum):
    mm = "mm"
    cm = "cm"
    m = "m"


class Rotation(BaseModel):
    axis: Literal["x", "y", "z"] = "x"
    angle: float = 0.0


class BoxVolumeProps(BaseModel):
    size: List[float] = Field(default_factory=lambda: [10.0, 10.0, 10.0])
    size_unit: UnitType = UnitType.mm


class SphereVolumeProps(BaseModel):
    rmin: float = 0.0
    rmax: float = 10.0
    radius_unit: UnitType = UnitType.mm


class ImageVolumeProps(BaseModel):
    image_path: str
    hu_material_table: Optional[str] = None
    hu_density_table: Optional[str] = None
    hu_tolerance: Optional[float] = None


class VolumeCreate(BaseModel):
    name: str
    type: VolumeType
    material: Optional[str] = "G4_AIR"
    translation: Optional[List[float]] = None
    rotation: Optional[Rotation] = None
    box: Optional[BoxVolumeProps] = None
    sphere: Optional[SphereVolumeProps] = None
    image: Optional[ImageVolumeProps] = None

    def validate_volume_properties(self):
        if self.type == VolumeType.Box and not self.box:
            raise ValueError("Box volume requires 'box' properties to be defined.")
        elif self.type == VolumeType.Sphere and not self.sphere:
            raise ValueError("Sphere volume requires 'sphere' properties to be defined.")
        elif self.type == VolumeType.Image and not self.image:
            raise ValueError("Image volume requires 'image' properties to be defined.")

    def get_volume_props(self) -> Union[BoxVolumeProps, SphereVolumeProps, ImageVolumeProps]:
        self.validate_volume_properties()

        if self.type == VolumeType.Box:
            return self.box
        elif self.type == VolumeType.Sphere:
            return self.sphere
        elif self.type == VolumeType.Image:
            return self.image
        raise ValueError(f"Invalid volume type: {self.type}")


class VolumeUpdate(BaseModel):
    material: Optional[str] = None
    translation: Optional[List[float]] = None
    rotation: Optional[Rotation] = None
    box: Optional[BoxVolumeProps] = None
    sphere: Optional[SphereVolumeProps] = None
    image: Optional[ImageVolumeProps] = None


class VolumeRead(BaseModel):
    name: str
    type: VolumeType
    material: Optional[str] = None
    translation: Optional[List[float]] = None
    rotation_matrix: Optional[List[List[float]]] = None
    size: Optional[List[float]] = None  # For Box
    rmin: Optional[float] = None        # For Sphere
    rmax: Optional[float] = None        # For Sphere
    image_path: Optional[str] = None    # For Image

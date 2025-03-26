from pydantic import BaseModel
from typing import List, Optional


class SourceCreate(BaseModel):
    name: str
    type: str = "GenericSource"
    particle: str = "gamma"
    energy_mono: Optional[float] = 60.0
    position_type: str = "box"
    position_size: List[float]
    direction_type: str  # Direction type (e.g., "focused")
    focus_point: List[float]  # Focus point for direction
    activity: int = 10

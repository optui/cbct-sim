from enum import Enum
from typing import Annotated, List

import opengate as gate
from pydantic import BaseModel, Field

Vector3 = Annotated[List[float], Field(min_items=3, max_items=3)]


class Axis(str, Enum):
    X = "x"
    Y = "y"
    Z = "z"


class Rotation(BaseModel):
    axis: Axis = Axis.X
    angle: float = 0.0


class Unit(str, Enum):
    NM = "nm"
    MM = "mm"
    CM = "cm"
    M = "m"
    KEV = "keV"
    EV = "eV"
    MEV = "MeV"
    BQ = "Bq"
    SEC = "sec"


UNIT_TO_GATE = {
    Unit.NM: gate.g4_units.nm,
    Unit.MM: gate.g4_units.mm,
    Unit.CM: gate.g4_units.cm,
    Unit.M: gate.g4_units.m,
    Unit.KEV: gate.g4_units.keV,
    Unit.EV: gate.g4_units.eV,
    Unit.MEV: gate.g4_units.MeV,
    Unit.BQ: gate.g4_units.Bq,
    Unit.SEC: gate.g4_units.second,
}

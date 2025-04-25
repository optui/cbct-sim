from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, List, Optional, Annotated, Union


# --- Base ---
class ActorBase(BaseModel):
    name: str


# --- Simulation Statistics Actor ---
class SimulationStatisticsActorConfig(ActorBase):
    type: Literal["SimulationStatisticsActor"] = "SimulationStatisticsActor"
    output_filename: str = "output/simulation_stats.txt"


# --- Digitizer Hits Collection Actor ---
class DigitizerHitsCollectionActorConfig(ActorBase):
    type: Literal["DigitizerHitsCollectionActor"] = "DigitizerHitsCollectionActor"
    attached_to: str
    attributes: List[str] = Field(default_factory=lambda: ["TotalEnergyDeposit"])
    output_filename: str = "output/hits.root"


# --- Digitizer Projection Actor ---
class DigitizerProjectionActorConfig(ActorBase):
    type: Literal["DigitizerProjectionActor"] = "DigitizerProjectionActor"
    attached_to: str
    input_digi_collections: List[str]
    spacing: List[float] = Field(
        default_factory=lambda: [1.0, 1.0], min_items=2, max_items=2
    )
    size: List[int] = Field(
        default_factory=lambda: [256, 256], min_items=2, max_items=2
    )
    origin_as_image_center: bool = True
    output_filename: str = "output/projection.mhd"


# --- Discriminator Union ---
ActorConfig = Annotated[
    Union[
        SimulationStatisticsActorConfig,
        DigitizerHitsCollectionActorConfig,
        DigitizerProjectionActorConfig,
    ],
    Field(discriminator="type"),
]


ActorCreate = ActorConfig

ActorRead = ActorConfig


class SimulationStatisticsActorUpdateConfig(BaseModel):
    type: Literal["SimulationStatisticsActor"]
    output_filename: Optional[str] = None


class DigitizerHitsCollectionActorUpdateConfig(BaseModel):
    type: Literal["DigitizerHitsCollectionActor"]
    attached_to: Optional[str] = None
    attributes: Optional[List[str]] = None
    output_filename: Optional[str] = None


class DigitizerProjectionActorUpdateConfig(BaseModel):
    type: Literal["DigitizerProjectionActor"]
    attached_to: Optional[str] = None
    input_digi_collections: Optional[List[str]] = None
    spacing: Optional[List[float]] = None
    size: Optional[List[int]] = None
    origin_as_image_center: Optional[bool] = None
    output_filename: Optional[str] = None


ActorUpdateConfig = Annotated[
    Union[
        SimulationStatisticsActorUpdateConfig,
        DigitizerHitsCollectionActorUpdateConfig,
        DigitizerProjectionActorUpdateConfig,
    ],
    Field(discriminator="type"),
]


class ActorUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[ActorUpdateConfig] = None

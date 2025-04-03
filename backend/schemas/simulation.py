from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class SimulationBase(BaseModel):
    name: str
    num_runs: int = 1
    run_len: float = 1.0


class SimulationCreate(SimulationBase):
    pass

class SimulationUpdate(SimulationBase):
    pass

class SimulationRead(SimulationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    output_dir: str
    json_archive_filename: str

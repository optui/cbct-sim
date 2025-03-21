<h1 align="center">
    OpenCT
</h1>

<p align="center">
    <img src="https://img.shields.io/badge/Python-3.10+-blue?style=flat&logo=python&logoColor=white" alt="Python"/>
    <img src="https://img.shields.io/badge/FastAPI-0.115.11-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/SQLAlchemy-2.0.39-a83254?style=flat&logo=SqlAlchemy" alt="SQLAlchemy"/>
    <img src="https://img.shields.io/badge/OpenGATE-10.0.1-0a3e68?style=flat" alt="OpenGATE"/>
    <img src="https://img.shields.io/badge/License-GPL--3.0-yellow?style=flat" alt="License"/>
</p>

A full-stack application for computed tomography (CT) research. It uses [FastAPI](https://fastapi.tiangolo.com/) as a web framework to interface with [GATE 10](https://github.com/OpenGATE/opengate).

## Setup

1. Clone the Repository

    ```bash
    git clone <repository-url>
    cd openct
    ```

### Using [uv](https://github.com/astral-sh/uv)

1. Create & Activate Virtual Environment

    ```bash
    uv venv
    source .venv/bin/activate # Windows: .venv\Scripts\activate
    ```

2. Install Dependencies

    ```bash
    uv pip install -r requirements.txt
    ```

### Using Traditional Virtual Environment

1. Create & Activate Virtual Environment

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate # Windows: .venv\Scripts\activate
    ```

2. Install Dependencies

    ```bash
    pip install -r requirements.txt
    ```

## Running the Application

1. Optional: Disable pycache

    ```bash
    export PYTHONDONTWRITEBYTECODE=1
    ```

2. Download Gate 10's Geant4 binaries and handle exports

    ```bash
    export GLIBC_TUNABLES=glibc.rtld.optional_static_tls=2000000
    ```

3. Run Application

    ```bash
    uvicorn backend.main:app --reload
    ```

4. Interactive API docs

   Go to either [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) or [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc).

## FastAPI Reference

### Simulations

| Method | Endpoint                    | Description                          | Request Body                     | Response                     |
|--------|-----------------------------|--------------------------------------|-----------------------------------|------------------------------|
| GET    | `/simulations/`             | Get all simulations                  | N/A                               | `List[SimulationRead]`        |
| POST   | `/simulations/`             | Create a new simulation              | `SimulationCreate`                | `SimulationRead`              |
| GET    | `/simulations/{id}/`        | Get details of a specific simulation | N/A                               | `SimulationRead`              |
| PUT    | `/simulations/{id}/`        | Update a specific simulation         | `SimulationUpdate`                | `SimulationRead`              |
| DELETE | `/simulations/{id}/`        | Delete a specific simulation         | N/A                               | `{"message": "Simulation deleted successfully"}` |
| POST   | `/simulations/{id}/import`  | Import simulation data               | N/A                               | `{"message": "Simulation imported successfully"}` |
| GET    | `/simulations/{id}/export`  | Export simulation data               | N/A                               | File download (simulation data) |
| GET    | `/simulations/{id}/view`    | View the simulation visualization    | N/A                               | Visualization opened or processed |
| POST   | `/simulations/{id}/run`     | Run a simulation                     | N/A                               | `{"message": "Simulation started."}` |

### Sources

| Method | Endpoint                        | Description                          | Request Body                   | Response                        |
|--------|---------------------------------|--------------------------------------|---------------------------------|---------------------------------|
| GET    | `/simulations/{id}/sources/`    | Get all sources in a simulation      | N/A                             | `List[str]` (List of source names) |
| POST   | `/simulations/{id}/sources/`    | Create a new source                  | `SourceCreate`                  | `{"message": "Source '{name}' created successfully"}` |
| PUT    | `/simulations/{id}/sources/{name}` | Update a specific source            | `SourceUpdate`                  | `{"message": "Source updated successfully"}` |
| DELETE | `/simulations/{id}/sources/{name}` | Delete a specific source            | N/A                             | `{"message": "Source '{name}' deleted successfully"}` |

### Volumes

| Method | Endpoint                        | Description                          | Request Body                   | Response                        |
|--------|---------------------------------|--------------------------------------|---------------------------------|---------------------------------|
| GET    | `/simulations/{simulation_id}/volumes/` | Get all volumes in a simulation      | N/A                             | `List[str]` (List of volume names) |
| POST   | `/simulations/{simulation_id}/volumes/` | Create a new volume                  | `VolumeCreate`                  | `{"name": "volume_name"}`       |
| GET    | `/simulations/{simulation_id}/volumes/{volume_name}` | Get details of a specific volume    | N/A                             | `VolumeRead`                    |
| PUT    | `/simulations/{simulation_id}/volumes/{volume_name}` | Update a specific volume            | `VolumeUpdate`                  | `{"message": "Volume updated successfully"}` |
| DELETE | `/simulations/{simulation_id}/volumes/{volume_name}` | Delete a specific volume            | N/A                             | `{"message": "Volume '{name}' deleted successfully"}` |

### Actors

| Method | Endpoint                        | Description                          | Request Body                   | Response                        |
|--------|---------------------------------|--------------------------------------|---------------------------------|---------------------------------|
| GET    | `/simulations/{id}/actors/`     | Get all actors in a simulation       | N/A                             | `List[str]` (List of actor names) |
| POST   | `/simulations/{id}/actors/`     | Create a new actor                   | `ActorCreate`                   | `{"message": "Actor created successfully"}` |
| PUT    | `/simulations/{id}/actors/{name}` | Update a specific actor             | `ActorUpdate`                   | `{"message": "Actor updated successfully"}` |
| DELETE | `/simulations/{id}/actors/{name}` | Delete a specific actor             | N/A                             | `{"message": "Actor '{name}' deleted successfully"}` |

## FastAPI Example Request/Response Formats

### Simulation Create (POST `/simulations/`)

**Request:**

```json
{
  "name": "SimulationName",
  "description": "Example description of simulation"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "SimulationName",
  "description": "Example description of simulation",
  "created_at": "2023-03-22T12:00:00Z",
  "output_dir": "./output/SimulationName"
}
```

### Source Create (POST `/simulations/{id}/sources/`)

**Request:**

```json
{
  "name": "MySource",
  "type": "GenericSource",
  "particle": "gamma",
  "energy_mono": 60.0,
  "position_type": "box",
  "position_size": [1.0, 16.0, 16.0],
  "direction_type": "focused",
  "focus_point": [100.0, 0.0, 0.0],
  "activity": 10
}
```

**Response:**

```json
{
  "message": "Source 'MySource' created successfully"
}
```

### Volume Create (POST `/simulations/{simulation_id}/volumes/`)

**Request:**

```json
{
  "name": "PatientVolume",
  "type": "Image",
  "material": "G4_AIR",
  "image_path": "path/to/image.mhd",
  "hu_material_table": "path/to/material_table.txt",
  "hu_density_table": "path/to/density_table.txt"
}
```

**Response:**

```json
{
  "name": "PatientVolume"
}
```

### Actor Create (POST `/simulations/{id}/actors/`)

**Request:**

```json
{
  "name": "DetectorActor",
  "type": "FluenceActor",
  "attached_to": "CBCT_detector_plane",
  "output_filename": "actor_output.mhd",
  "spacing": [10.0, 5.0, 5.0],
  "size": [1, 100, 100]
}
```

**Response:**

```json
{
  "message": "Actor created successfully"
}
```

### License

Read [`LICENSE`](LICENSE).

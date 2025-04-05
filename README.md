<h1 align="center">
    ProjeCT
</h1>

<p align="center">
    <img src="https://img.shields.io/badge/Python-3.10+-blue?style=flat&logo=python&logoColor=white" alt="Python"/>
    <img src="https://img.shields.io/badge/FastAPI-0.115.11-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/SQLAlchemy-2.0.39-a83254?style=flat&logo=SqlAlchemy" alt="SQLAlchemy"/>
    <img src="https://img.shields.io/badge/OpenGATE-10.0.1-0a3e68?style=flat" alt="OpenGATE"/>
    <img src="https://img.shields.io/badge/License-GPL--3.0-yellow?style=flat" alt="License"/>
</p>

Full-stack application for computed tomography (CT) research. It uses [FastAPI](https://fastapi.tiangolo.com/) for the backend to interface with [GATE 10](https://github.com/OpenGATE/opengate), and [Angular v19](https://angular.dev/) for the frontend to facilitate communication with the backend.

## Setup

1. Clone the Repository

    ```bash
    git clone https://github.com/optui/ProjeCT.git
    cd ProjeCT
    ```

### Using [uv](https://github.com/astral-sh/uv)

1. Create & Activate Virtual Environment

    ```bash
    uv venv
    source .venv/bin/activate  # Windows: .venv\Scripts\activate
    ```

2. Install Dependencies

    ```bash
    uv sync
    ```

### Using Traditional Virtual Environment

1. Create & Activate Virtual Environment

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # Windows: .venv\Scripts\activate
    ```

2. Install Dependencies

    ```bash
    pip install -r requirements.txt
    ```

## Running

1. Make run.sh executable

    ```bash
    chmod +x scripts/run.sh
    ```

2. Run the script

    > **Warning:** On first run, GATE 10 will download and install Geant4 (~11GB).

    ```bash
    scripts/run.sh
    ```

3. Open the interactive API docs

    - [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
    - [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## API Reference

API prefix: `/api/`

### Simulations

| Method | Endpoint                 | Description                          | Request Body       | Response                                          |
| ------ | ------------------------ | ------------------------------------ | ------------------ | ------------------------------------------------- |
| GET    | `/simulations/`          | Get all simulations                  | N/A                | `List[SimulationRead]`                            |
| POST   | `/simulations/`          | Create a new simulation              | `SimulationCreate` | `SimulationRead`                                  |
| GET    | `/simulations/{id}/`     | Get details of a specific simulation | N/A                | `SimulationRead`                                  |
| PUT    | `/simulations/{id}/`     | Update a specific simulation         | `SimulationUpdate` | `SimulationRead`                                  |
| DELETE | `/simulations/{id}/`     | Delete a specific simulation         | N/A                | `{"detail": "Simulation deleted successfully"}`   |
| GET    | `/simulations/{id}/view` | View simulation visualization        | N/A                | `{"detail": "Simulation visualization started"}`  |
| GET    | `/simulations/{id}/run`  | Run a simulation                     | N/A                | `{"detail": "Simulation started."}`               |

### Volumes

| Method | Endpoint                                  | Description                      | Request Body   | Response                                                     |
| ------ | ----------------------------------------- | -------------------------------- | -------------- | ------------------------------------------------------------ |
| GET    | `/simulations/{id}/volumes`               | Get all volumes in a simulation  | N/A            | `List[str]` (List of volume names)                           |
| POST   | `/simulations/{id}/volumes`               | Create a new volume              | `VolumeCreate` | `{"name": "volume_name"}`                                    |
| GET    | `/simulations/{id}/volumes/{volume_name}` | Get details of a specific volume | N/A            | `VolumeRead`                                                 |
| PUT    | `/simulations/{id}/volumes/{volume_name}` | Update a specific volume         | `VolumeUpdate` | `{"message": "Volume '{volume_name}' updated successfully"}` |
| DELETE | `/simulations/{id}/volumes/{volume_name}` | Delete a specific volume         | N/A            | `{"message": "Volume '{volume_name}' deleted successfully"}` |

### Sources

| Method | Endpoint                                      | Description                      | Request Body          | Response                                              |
| ------ | --------------------------------------------- | -------------------------------- | --------------------- | ----------------------------------------------------- |
| GET    | `/simulations/{simulation_id}/sources`        | Get all sources in a simulation  | N/A                   | `List[str]` (List of source names)                    |
| POST   | `/simulations/{simulation_id}/sources`        | Create a new source              | `GenericSourceCreate` | `{"name": "source_name"}`                             |
| GET    | `/simulations/{simulation_id}/sources/{name}` | Get details of a specific source | N/A                   | `GenericSourceRead`                                   |
| DELETE | `/simulations/{simulation_id}/sources/{name}` | Delete a specific source         | N/A                   | `{"message": "Source '{name}' deleted successfully"}` |

### Actors

| Method | Endpoint                                | Description                    | Request Body   | Response                                                   |
| ------ | --------------------------------------- | ------------------------------ | -------------- | ---------------------------------------------------------- |
| GET    | `/simulations/{id}/actors`              | Get all actors in a simulation | N/A            | `List[str]` (List of actor names)                          |
| POST   | `/simulations/{id}/actors/`             | Create a new actor             | `{actor_name}` | `{"message": "Actor '{actor_name}' created successfully"}` |
| PUT    | `/simulations/{id}/actors/{actor_name}` | Update a specific actor        | `{new_name}`   | `{"message": "Actor '{actor_name}' updated successfully"}` |
| DELETE | `/simulations/{id}/actors/{actor_name}` | Delete a specific actor        | N/A            | `{"message": "Actor '{actor_name}' deleted successfully"}` |

## FastAPI Example Request/Response Formats

### Simulation Create (POST `/simulations/`)

**Request:**

```json
{
  "name": "CT_Simulation_01",
  "num_runs": 180,
  "run_len": 1
}
```

**Response:**

```json
{
  "name": "CT_Simulation_01",
  "num_runs": 1,
  "run_len": 1,
  "id": 1,
  "created_at": "2025-04-04T10:59:39",
  "output_dir": "./output/CT_Simulation_001",
  "json_archive_filename": "CT_Simulation_001.json"
}
```

### Box Volume Create (POST `/simulations/{simulation_id}/volumes`)

**Request:**

```json
{
  "name": "Phantom",
  "mother": "world",
  "material": "G4_WATER",
  "translation": [0.0, 0.0, 0.0],
  "rotation": {"axis": "z", "angle": 0},
  "color": [0.5, 0.5, 1.0, 1.0],
  "shape": {
    "type": "Box",
    "size": [30, 30, 30],
    "unit": "cm"
  }
}
```

**Response:**

```json
{
  "name": "Phantom"
}
```

### **Sphere Volume Create (POST `/simulations/{simulation_id}/volumes`)**

**Request:**

```json
{
  "name": "Phantom_Sphere",
  "mother": "world",
  "material": "G4_WATER",
  "translation": [0.0, 0.0, 0.0],
  "rotation": {"axis": "z", "angle": 0},
  "color": [0.5, 0.5, 1.0, 1.0],
  "shape": {
    "type": "Sphere",
    "rmin": 0.0,
    "rmax": 15.0,
    "unit": "cm"
  }
}
```

**Response:**

```json
{
  "name": "Phantom_Sphere"
}
```

### Source Create (POST `/simulations/{simulation_id}/sources`)

**Request:**

```json
{
  "name": "GammaSource",
  "attached_to": "Phantom",
  "particle": "gamma",
  "position": {
    "type": "box",
    "translation": [0.0, 0.0, 10.0],
    "rotation": {"axis": "z", "angle": 0},
    "size": [5, 5, 5],
    "unit": "cm"
  },
  "direction": {
    "type": "focused",
    "focus_point": [0.0, 0.0, 0.0]
  },
  "energy": {
    "type": "mono",
    "mono": 140.0,
    "unit": "keV"
  },
  "activity": 37.0,
  "activity_unit": "Bq"
}
```

**Response:**

```json
{
  "name": "GammaSource"
}
```

### **Actor Create (POST `/simulations/{simulation_id}/actors/`)**

#### 1. **SimulationStatisticsActor Create**

**Request:**

```json
{
  "name": "SimulationStatsActor",
  "type": "SimulationStatisticsActor",
  "output_filename": "output/simulation_stats.txt"
}
```

**Response:**

```json
{
  "name": "SimulationStatsActor",
  "type": "SimulationStatisticsActor",
  "output_filename": "output/simulation_stats.txt"
}
```

---

#### 2. **DigitizerHitsCollectionActor Create**

**Request:**

```json
{
  "name": "HitsCollectionActor",
  "type": "DigitizerHitsCollectionActor",
  "attached_to": "Phantom",
  "attributes": ["TotalEnergyDeposit", "PostPosition", "GlobalTime"],
  "output_filename": "output/hits_collection.root"
}
```

**Response:**

```json
{
  "name": "HitsCollectionActor",
  "type": "DigitizerHitsCollectionActor",
  "attached_to": "Phantom",
  "attributes": ["TotalEnergyDeposit", "PostPosition", "GlobalTime"],
  "output_filename": "output/hits_collection.root"
}
```

---

#### 3. **DigitizerProjectionActor Create**

**Request:**

```json
{
  "name": "ProjectionActor",
  "type": "DigitizerProjectionActor",
  "attached_to": "Phantom",
  "input_digi_collections": ["Hits"],
  "spacing": [1.0, 1.0],
  "size": [256, 256],
  "origin_as_image_center": true,
  "output_filename": "output/projection.mhd"
}
```

**Response:**

```json
{
  "name": "ProjectionActor",
  "type": "DigitizerProjectionActor",
  "attached_to": "Phantom",
  "input_digi_collections": ["Hits"],
  "spacing": [1.0, 1.0],
  "size": [256, 256],
  "origin_as_image_center": true,
  "output_filename": "output/projection.mhd"
}
```

### License

Read [`LICENSE`](LICENSE).

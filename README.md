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

## Features

Create, read, update or delete simulations; also export, import, view or run them.  

For each simulation you can: create, read, update or delete volumes, sources and actors.

You can also decide if you want a dynamic (with moving parts) or a static simulation.

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

## Running

1. Optionally Disable pycache

    ```bash
    export PYTHONDONTWRITEBYTECODE=1
    ```

2. GATE 10 Prerequisite

    ```bash
    export GLIBC_TUNABLES=glibc.rtld.optional_static_tls=2000000
    ```

3. Run Application

     **Warning:** When running GATE 10 for the first time it'll install its Geant4 dependencies totalling **~11GB**.

    ```bash
    uvicorn app.main:app --reload
    ```

4. Interactive API docs

   Go to either [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) or [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc).

## API Reference

API prefix: `/api/`

### Simulations

| Method | Endpoint                 | Description                          | Request Body       | Response                                          |
| ------ | ------------------------ | ------------------------------------ | ------------------ | ------------------------------------------------- |
| GET    | `/simulations/`          | Get all simulations                  | N/A                | `List[SimulationRead]`                            |
| POST   | `/simulations/`          | Create a new simulation              | `SimulationCreate` | `SimulationRead`                                  |
| GET    | `/simulations/{id}/`     | Get details of a specific simulation | N/A                | `SimulationRead`                                  |
| PUT    | `/simulations/{id}/`     | Update a specific simulation         | `SimulationUpdate` | `SimulationRead`                                  |
| DELETE | `/simulations/{id}/`     | Delete a specific simulation         | N/A                | `{"message": "Simulation deleted successfully"}`  |
| GET    | `/simulations/{id}/view` | View simulation visualization        | N/A                | `{"message": "Simulation visualization started"}` |
| GET    | `/simulations/{id}/run`  | Run a simulation                     | N/A                | `{"message": "Simulation started."}`              |

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
  "name": "CT_Simulation_01"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "CT_Simulation_01",
  "created_at": "2023-03-22T12:00:00Z",
  "output_dir": "./output/CT_Simulation_01",
  "json_archive_filename": "CT_Simulation_01.json"
}
```

### Volume Create (POST `/simulations/{simulation_id}/volumes`)

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
  "activity_unit": "MBq"
}
```

**Response:**

```json
{
  "name": "GammaSource"
}
```

### Actor Create (POST `/simulations/{id}/actors/`)

**Request:**

```json
```

**Response:**

```json
```

### License

Read [`LICENSE`](LICENSE).

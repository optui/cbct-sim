# Backend

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
  "name": "string",
  "num_runs": 180,
  "run_len": 1
}
```

**Response:**

```json
{
  "message": "Simulation 'string' created successfully"
}
```

### Box Volume Create (POST `/simulations/{simulation_id}/volumes`)

**Request:**

```json
{
  "name": "box_vol",
  "mother": "world",
  "material": "G4_CONCRETE",
  "translation": [
    0,
    0,
    0
  ],
  "translation_unit": "mm",
  "rotation": {
    "axis": "x",
    "angle": 0
  },
  "shape": {
    "unit": "cm",
    "type": "Box",
    "size": [
      5,
      5,
      5
    ]
  },
  "dynamic_params": {
    "enabled": true,
    "translation_end": [
      0,
      0,
      0
    ],
    "angle_end": 360
  }
}
```

**Response:**

```json
{
  "message": "Volume 'box_vol' created successfully"
}
```

### Detector Volume Create (POST `/simulations/{simulation_id}/volumes`)

**Request:**

```json
{
  "name": "detector",
  "mother": "world",
  "material": "G4_Si",
  "translation": [
    0,
    0,
    -0.5
  ],
  "translation_unit": "m",
  "rotation": {
    "axis": "x",
    "angle": 0
  },
  "shape": {
    "unit": "cm",
    "type": "Box",
    "size": [
      20,
      20,
      0.5
    ]
  },
  "dynamic_params": {
    "enabled": false,
    "translation_end": [
      0,
      0,
      0
    ],
    "angle_end": 0
  }
}
```

**Response:**

```json
{
  "message": "Volume 'detector' created successfully"
}
```

### Source Create (POST `/simulations/{simulation_id}/sources`)

**Request:**

```json
{
  "name": "src",
  "attached_to": "world",
  "particle": "gamma",
  "position": {
    "type": "box",
    "translation": [
      0,
      0,
      700
    ],
    "size": [
      16,
      16,
      0.1
    ],
    "unit": "mm"
  },
  "focus_point": [
    0,
    0,
    600
  ],
  "energy": {
    "energy": 80,
    "unit": "keV"
  },
  "activity": 1e4,
  "unit": "Bq"
}
```

**Response:**

```json
{
  "message": "Source 'src' created successfully"
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

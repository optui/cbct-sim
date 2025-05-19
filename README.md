<h1 align="center">
    ProjeCT
</h1>

<p align="center">
    <img src="https://img.shields.io/badge/Python-3.10+-blue?style=flat&logo=python&logoColor=white" alt="Python"/>
    <img src="https://img.shields.io/badge/FastAPI-0.115.12-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/SQLAlchemy-2.0.40-a83254?style=flat&logo=SqlAlchemy" alt="SQLAlchemy"/>
    <img src="https://img.shields.io/badge/OpenGATE-10.0.2-0a3e68?style=flat" alt="OpenGATE"/>
    <img src="https://img.shields.io/badge/Angular-19.2.4-f12286?style=flat&logo=angular" alt="Angular"/>
    <img src="https://img.shields.io/badge/Docker-20.10+-2496ED?style=flat&logo=docker&logoColor=white" alt="Docker"/>
    <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat" alt="License"/>
</p>

Full-stack application for creating tomographic projections. It uses [FastAPI](https://fastapi.tiangolo.com/) for the backend to interface with [GATE 10](https://github.com/OpenGATE/opengate) and [LEAP](https://github.com/LLNL/LEAP), and [Angular](https://angular.dev/) for the frontend.

<p align="center">
    <img src="./media/cube_rotate.gif" alt="Sinogram of a cube from a CBCT"/>
</p>

## Features

### Keep track of your GATE simulations

![Screenshot of 3 list items representing simulation names with buttons](./media/screenshot_1.png)

### View your GATE simulation before running it

![Screenshot of a source emitting rays in a cone shape towards a cube and a flat-panel detector](./media/screenshot_3.png)

### Generate projections and reconstruct them

|                              Sinogram of a cube from a CBCT                              |                              Reconstructed middle slice of a cube from a CBCT                              |
| :--------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------: |
| <img src="./media/screenshot_4.png" alt="Sinogram of a cube from a CBCT" height="550px"/> | <img src="./media/screenshot_5.png" alt="Reconstructed middle slice of a cube from a CBCT" height="550px"/> |

## Prerequisites

Choose one of the following options to get started:

### 1. Docker (recommended)

* **Docker** 20.10 or newer
* **NVIDIA Container Toolkit** (for GPU support; optional if no GPU is needed)

**or**

### 2. Manual Setup

* **Python** 3.10+
* **Node.js** v22.15.0 or newer
* **cmake** v3.23 or newer
* **CUDA Toolkit** 11.7 or newer
* **NVIDIA Container Toolkit** (for GPU support; optional if no GPU is needed)

## Setup

### Docker (recommended)

1. **Build the development image**

   ```bash
   docker build -t project-dev .
   ```
2. **Run the container**

   ```bash
   docker run --gpus all -it -p 8000:8000 -p 4200:4200 project-dev
   ```

   * `--gpus all` enables GPU access (omit if not using GPU).
   * `-p 8000:8000` exposes the FastAPI backend.
   * `-p 4200:4200` exposes the Angular dev server.
3. **Start services inside container**

   * In the running shell (container):

     ```bash
     # Start backend
     chmod +x scripts/run.sh && scripts/run.sh
     # In a new shell: start frontend
     cd frontend && ng serve --host 0.0.0.0
     ```
4. **Access application**

   * Backend OpenAPI: [http://localhost:8000/media](http://localhost:8000/media) or [http://localhost:8000/redoc](http://localhost:8000/redoc)
   * Frontend UI: [http://localhost:4200](http://localhost:4200)

### Manual (without Docker)

* Clone the repository

  ```bash
  git clone https://github.com/optui/ProjeCT.git
  cd ProjeCT
  ```

#### Backend Setup

##### Environment

* Copy the template

  ```bash
  cp backend/.env.example backend/.env
  ```

##### Using [uv](https://github.com/astral-sh/uv)

1. Go to the backend directory

   ```bash
   cd backend
   ```
2. Create & activate virtual environment

   ```bash
   uv venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
3. Install & lock dependencies

   ```bash
   uv sync
   ```

##### Using [virtualenv](https://virtualenv.pypa.io/en/latest/)

1. Go to the backend directory

   ```bash
   cd backend
   ```
2. Create & activate virtual environment

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
3. Install dependencies

   ```bash
   pip install -e .
   ```

#### Integrating LEAP

ProjeCT relies on LLNL’s [LEAP](https://github.com/LLNL/LEAP) library for reconstructing generated projections.

1. Activate the backend environment

   ```bash
   cd backend && source .venv/bin/activate
   ```
2. Clone and install LEAP

   ```bash
   git clone https://github.com/LLNL/LEAP.git
   cd LEAP
   pip install .
   ```
3. Return to project root

   ```bash
   cd ../..
   ```

### Frontend Setup

1. Go to the frontend directory

   ```bash
   cd frontend
   ```
2. Install dependencies

   ```bash
   npm install
   ```

## Running

### Backend

1. Make `run.sh` executable

   ```bash
   chmod +x scripts/run.sh
   ```
2. Run the script

   > **Note:** On first run, GATE 10 downloads Geant4 data (\~11 GB).

   ```bash
   scripts/run.sh
   ```
3. Open the interactive API media

   * [http://127.0.0.1:8000/media](http://127.0.0.1:8000/media)
   * [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Frontend

* Run the frontend server

  ```bash
  ng serve
  ```

## Documentation

* Backend API: [backend/README.md](./backend/README.md)
* Frontend GUI: [frontend/README.md](./frontend/README.md)

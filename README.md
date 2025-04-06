<h1 align="center">
    ProjeCT
</h1>

<p align="center">
    <img src="https://img.shields.io/badge/Python-3.10+-blue?style=flat&logo=python&logoColor=white" alt="Python"/>
    <img src="https://img.shields.io/badge/FastAPI-0.115.12-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/SQLAlchemy-2.0.40-a83254?style=flat&logo=SqlAlchemy" alt="SQLAlchemy"/>
    <img src="https://img.shields.io/badge/OpenGATE-10.0.2-0a3e68?style=flat" alt="OpenGATE"/>
    <img src="https://img.shields.io/badge/Angular-19.2.4-f12286?style=flat&logo=angular" alt="OpenGATE"/>
    <img src="https://img.shields.io/badge/License-GPL--3.0-orange?style=flat" alt="License"/>
</p>

Full-stack application for computed tomography (CT) research. It uses [FastAPI](https://fastapi.tiangolo.com/) for the backend to interface with [GATE 10](https://github.com/OpenGATE/opengate), and [Angular](https://angular.dev/) for the frontend to facilitate communication with the backend.

## Setup

1. Clone the Repository

    ```bash
    git clone https://github.com/optui/ProjeCT.git
    cd ProjeCT
    ```

### Backend

#### Environment

This project includes a pre-configured `backend/.env` file for local development - no manual setup is required.

The file contains non-sensitive defaults such as:

| Variable                  | Description                            | Example Value                        |
| ------------------------- | -------------------------------------- | ------------------------------------ |
| `TITLE`                   | Name of the application                | `ProjeCT`                            |
| `DESCRIPTION`             | Short description used in API metadata | `Computed Tomography Simulator`      |
| `SQLALCHEMY_DATABASE_URI` | URI for the local SQLite database      | `sqlite+aiosqlite:///../database.db` |

If you ever accidentally delete or modify it, you can restore it with:

  ```bash
  git restore backend/.env
  ```

#### Using [uv](https://github.com/astral-sh/uv) package & project manager

1. Go to the backend directory

    ```bash
    cd backend
    ```

2. Create & Activate Virtual Environment

    ```bash
    uv venv
    source .venv/bin/activate  # Windows: .venv\Scripts\activate
    ```

3. Install Dependencies

    ```bash
    uv sync
    ```

#### Using Traditional Virtual Environment

1. Go to the backend directory

    ```bash
    cd backend
    ```

2. Create & Activate Virtual Environment

    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # Windows: .venv\Scripts\activate
    ```

3. Install Dependencies

    ```bash
    pip install -r requirements.txt
    ```

## Running

1. Make run.sh executable

    ```bash
    chmod +x scripts/run.sh
    ```

2. Run the script

    > **Warning:** On the first run, GATE 10 will download and install Geant4 (~11GB).

    ```bash
    scripts/run.sh
    ```

3. Open the interactive API docs

    - [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
    - [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

## Documentation

See the [backend README](./backend/README.md) for API details and examples.

## License

Read [`LICENSE`](LICENSE).

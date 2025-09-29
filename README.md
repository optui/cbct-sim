<h1 align="center">
  cbct-lab
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.115.12-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Angular-19.2.4-f12286?style=flat&logo=angular" alt="Angular"/>
  <img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat" alt="License"/>
</p>

<p align="center">
    <img src="./media/cube_rotate.gif" alt="Sinogram of a cube from a CBCT" height="250px"/>
</p>

<p align="center">
  An open-source application that simulates the imaging workflow of cone-beam computed tomography (CBCT). It uses **FastAPI** for the backend to interface with **GATE 10** and **LEAP** and uses **Angular** as the frontend.
</p>

## Features

### Manage your GATE simulations

![Screenshot of 3 list items representing simulation names with buttons](./media/screenshot_1.png)

### View your existing GATE simulations

![Screenshot of a source emitting rays in a cone shape towards a cube and a flat-panel detector](./media/screenshot_3.png)

### Generate projections and reconstruct them

|                              Sinogram of a cube from a CBCT                               |                              Reconstructed middle slice of a cube from a CBCT                               |
| :---------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------: |
| <img src="./media/screenshot_4.png" alt="Sinogram of a cube from a CBCT" height="500px"/> | <img src="./media/screenshot_5.png" alt="Reconstructed middle slice of a cube from a CBCT" height="500px"/> |

## Setup

For setup check out the [GitHub Wiki](https://github.com/optui/ProjeCT/wiki).

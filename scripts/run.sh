#!/bin/bash

# Optionally Disable pycache
export PYTHONDONTWRITEBYTECODE=1

# GATE 10 Prerequisite
export GLIBC_TUNABLES=glibc.rtld.optional_static_tls=2000000

# Enable virtual environment
source ./venv/bin/activate

# Run the backend with uvicorn
echo "Starting FastAPI backend..."
export PYTHONPATH=$PYTHONPATH:./backend
uvicorn app.main:app --reload &

# Run the frontend
echo "Starting Angular frontend..."
cd frontend
npm run start

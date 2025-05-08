#!/bin/bash

# Optionally Disable pycache
export PYTHONDONTWRITEBYTECODE=1

# GATE 10 Prerequisite
export GLIBC_TUNABLES=glibc.rtld.optional_static_tls=2000000

# Enable virtual environment
source ./backend/.venv/bin/activate

# Run the backend with uvicorn
echo "Starting FastAPI backend..."
cd backend/
uvicorn app.main:app --reload

deactivate
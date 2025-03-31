#!/bin/bash

# Optionally Disable pycache
export PYTHONDONTWRITEBYTECODE=1

# GATE 10 Prerequisite
export GLIBC_TUNABLES=glibc.rtld.optional_static_tls=2000000

# Run the application with uvicorn
echo "Starting FastAPI with Uvicorn..."
uvicorn backend.main:app --reload

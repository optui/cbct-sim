from fastapi import APIRouter

from app.api.routes import simulations, volumes, sources, actors

api_router = APIRouter(prefix="/api")

api_router.include_router(simulations.router)
api_router.include_router(volumes.router, prefix="/simulations")
api_router.include_router(sources.router, prefix="/simulations")
api_router.include_router(actors.router, prefix="/simulations")

from fastapi import APIRouter
from app.simulations.router import router as simulations_router
from app.sources.router import router as sources_router
from app.volumes.router import router as volumes_router


api_router = APIRouter(prefix="/api")

api_router.include_router(simulations_router)
api_router.include_router(volumes_router)
api_router.include_router(sources_router)

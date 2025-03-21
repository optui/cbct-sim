from contextlib import asynccontextmanager

from fastapi import FastAPI

from backend.core.config import get_settings
from backend.core.database import engine
from backend.api import api_router
from backend.models import Base

import opengate as gate

@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

settings = get_settings()

app = FastAPI(
    title=settings.TITLE,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

app.include_router(api_router)

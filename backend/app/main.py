from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError
from app.api import api_router
from contextlib import asynccontextmanager
from app.core.database import engine
from app.models import Base
from app.core.exceptions import *
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    lifespan=lifespan,
    version="0.5.0",
    title=settings.TITLE,
    description=settings.DESCRIPTION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins="http://localhost:4200",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(StarletteHTTPException, handle_http_exception)
app.add_exception_handler(IntegrityError, handle_integrity_error)
app.add_exception_handler(RequestValidationError, handle_validation_error)
app.add_exception_handler(Exception, handle_exception)


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse("/docs")


app.include_router(api_router)

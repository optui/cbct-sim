from fastapi import FastAPI, APIRouter
from fastapi.responses import RedirectResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
from contextlib import asynccontextmanager

from app.core import (
    engine,
    Base,
    get_settings,
    api_router,
    handle_http_exception,
    handle_integrity_error,
    handle_validation_error,
    handle_exception,
)

from fastapi.middleware.cors import CORSMiddleware

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    lifespan=lifespan,
    title=settings.TITLE,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
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

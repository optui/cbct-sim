from fastapi import FastAPI
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.api import api_router
from contextlib import asynccontextmanager
from app.core.database import engine
from app.models import Base
from app.core.exceptions import handle_exception, handle_http_exception


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(lifespan=lifespan)

app.add_exception_handler(StarletteHTTPException, handle_http_exception)
app.add_exception_handler(Exception, handle_exception)

app.include_router(api_router)

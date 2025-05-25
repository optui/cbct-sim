from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from app.core import (
    Base, engine, api_router, get_settings,
    handle_exception, handle_http_exception,
    handle_integrity_error, handle_validation_error
)
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

BACKEND_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = BACKEND_DIR.parent / "frontend" / "dist" / "frontend" / "browser"

@app.get("/{file_path:path}")
async def serve_spa(file_path: str, request: Request):
    """
    Serve Angular SPA files:
    1. API routes are handled first by the API router above
    2. Static files (with extensions) are served directly
    3. All other routes serve index.html for Angular routing
    """
    
    # If the path has a file extension, it's likely a static asset
    if "." in file_path:
        file = FRONTEND_DIST / file_path
        if file.exists() and file.is_file():
            return FileResponse(file)
        # If static file doesn't exist, return 404
        raise HTTPException(status_code=404, detail="File not found")
    
    # For paths without extensions (Angular routes), serve index.html
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    
    raise HTTPException(status_code=404, detail="Angular index.html not found")

app.add_exception_handler(HTTPException, handle_http_exception)
app.add_exception_handler(IntegrityError, handle_integrity_error)  
app.add_exception_handler(RequestValidationError, handle_validation_error)
app.add_exception_handler(Exception, handle_exception)
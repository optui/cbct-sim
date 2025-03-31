from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError


async def handle_http_exception(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def handle_exception(_: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, IntegrityError):
        message = str(exc)

        for line in message.splitlines():
            if "UNIQUE constraint failed" in line:
                parts = line.split(": ")
                if len(parts) == 2 and "." in parts[1]:
                    table, column = parts[1].split(".")
                    return JSONResponse(
                        status_code=status.HTTP_409_CONFLICT,
                        content={
                            "detail": f"Value for {column} in {table} already exists"
                        },
                    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"},
    )

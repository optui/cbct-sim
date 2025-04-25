from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import IntegrityError


async def handle_http_exception(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

async def handle_integrity_error(_: Request, exc: IntegrityError) -> JSONResponse:
    msg = str(exc.orig or exc)
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"message": "Simulation with that name already exists"},
    )

async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = {}
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err["loc"][1:])
        msg = err["msg"]
        errors[field] = msg

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "message": "Validation Failed",
            "errors": errors,
        },
    )

async def handle_exception(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "An unexpected error occurred"},
    )

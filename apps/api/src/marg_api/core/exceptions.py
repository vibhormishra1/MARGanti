import structlog
from fastapi import Request, status
from fastapi.responses import JSONResponse

logger = structlog.get_logger()


class MargDomainException(Exception):
    """Base exception for domain-level errors."""

    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


async def domain_exception_handler(request: Request, exc: MargDomainException) -> JSONResponse:
    logger.warning("domain_exception", path=request.url.path, detail=exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("unhandled_exception", path=request.url.path, error=str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )

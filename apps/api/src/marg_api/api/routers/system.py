from fastapi import APIRouter, Depends, Response, status
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from sqlalchemy.ext.asyncio import AsyncSession

from marg_api.core.config import settings
from marg_api.core.dependencies import get_db
from marg_api.infrastructure.database.engine import check_db_health

router = APIRouter()


@router.get("/health", tags=["System"], deprecated=True)
async def health_check(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    # Kept for backward compatibility, but liveness/readiness are preferred
    db_ok = await check_db_health(db)
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
    }


@router.get("/liveness", tags=["System"])
async def liveness() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/readiness", tags=["System"])
async def readiness(response: Response, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    db_ok = await check_db_health(db)
    if not db_ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "unavailable", "reason": "database_disconnected"}

    return {"status": "ready"}


@router.get("/metrics", tags=["System"])
async def metrics() -> Response:
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@router.get("/version", tags=["System"])
async def get_version() -> dict[str, str]:
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }

from fastapi import APIRouter

from marg_api.core.config import settings
from marg_api.infrastructure.database.engine import check_db_health

router = APIRouter()


@router.get("/health", tags=["System"])
async def health_check() -> dict[str, str]:
    db_ok = await check_db_health()
    status = "ok" if db_ok else "degraded"
    return {
        "status": status,
        "database": "connected" if db_ok else "disconnected",
    }


@router.get("/version", tags=["System"])
async def get_version() -> dict[str, str]:
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }

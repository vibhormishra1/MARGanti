from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from marg_api.api.routers import system
from marg_api.api.routes import router as domain_routes
from marg_api.core.config import settings
from marg_api.core.exceptions import (
    MargDomainException,
    domain_exception_handler,
    global_exception_handler,
)
from marg_api.core.logging import configure_logging
from marg_api.core.middleware import RequestLoggingMiddleware
from marg_api.infrastructure.database.engine import dispose_engine

# Configure JSON logging immediately
configure_logging()
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("startup", project=settings.PROJECT_NAME, version=settings.VERSION)
    yield
    await dispose_engine()
    logger.info("shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DOCS_ENABLED else None,
        docs_url="/docs" if settings.DOCS_ENABLED else None,
        redoc_url="/redoc" if settings.DOCS_ENABLED else None,
        lifespan=lifespan,
    )

    # Middleware Registration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)

    # Exception Handlers
    app.add_exception_handler(MargDomainException, domain_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)

    # Router Registration
    app.include_router(system.router, prefix=settings.API_V1_STR)
    app.include_router(domain_routes, prefix=settings.API_V1_STR)

    return app


app = create_app()

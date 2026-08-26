from pathlib import Path
import sys
from typing import Any

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_INSECURE_JWT_DEFAULT = "super-secret-key-for-local-dev-only"

_CURRENT_FILE = Path(__file__).resolve()
_ENV_FILES = [str(p / ".env") for p in _CURRENT_FILE.parents if (p / ".env").is_file()] + [".env", "../../.env"]


class Settings(BaseSettings):
    PROJECT_NAME: str = "MARG API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:54322/postgres"

    # CORS Configuration
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Auth
    JWT_SECRET_KEY: str = _INSECURE_JWT_DEFAULT
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Deployment
    LOG_LEVEL: str = "INFO"
    DOCS_ENABLED: bool = True

    model_config = SettingsConfigDict(
        env_file=tuple(_ENV_FILES),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def _normalize_database_url(cls, v: Any) -> Any:
        if isinstance(v, str):
            if v.startswith("postgresql://"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
        return v

    @model_validator(mode="after")
    def _validate_production_safety(self) -> "Settings":
        """Prevent insecure defaults from reaching production."""
        if self.ENVIRONMENT in ("production", "staging"):
            if self.JWT_SECRET_KEY == _INSECURE_JWT_DEFAULT:
                print(
                    "FATAL: JWT_SECRET_KEY must be explicitly set in production/staging. "
                    "Refusing to start with the development default.",
                    file=sys.stderr,
                )
                raise SystemExit(1)
            # Disable interactive API docs in production
            self.DOCS_ENABLED = False
        return self


settings = Settings()

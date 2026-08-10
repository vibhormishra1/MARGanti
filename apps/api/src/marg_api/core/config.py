import sys

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_INSECURE_JWT_DEFAULT = "super-secret-key-for-local-dev-only"


class Settings(BaseSettings):
    PROJECT_NAME: str = "MARG API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
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
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

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

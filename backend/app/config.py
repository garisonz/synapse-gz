"""
app/config.py — Application configuration via Pydantic BaseSettings.

Defines a Settings class that reads values from environment variables (or a
.env file in the backend root). Any variable can be overridden at deploy time
without changing code.

Settings:
  CORS_ORIGINS     — list of allowed frontend origins for the CORS middleware.
                     Defaults to ["http://localhost:3000"] for local development.
  MAX_FILE_SIZE_MB — maximum upload size enforced by the /api/upload endpoint.
                     Defaults to 50 MB.

The singleton `settings` object is imported by main.py (CORS setup) and
upload.py (file-size validation).
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    MAX_FILE_SIZE_MB: int = 50

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://synapse:synapse@localhost:5432/synapse"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"


settings = Settings()

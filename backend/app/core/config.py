"""Application configuration loaded from environment variables / .env."""
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]

ModelName = Literal["mobilenetv3", "efficientnetb0", "resnet50"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    app_name: str = "CocoScan API"
    environment: str = "development"

    # Empty -> local SQLite file so the API runs without a PostgreSQL server.
    database_url: str = ""

    secret_key: str = "dev-only-insecure-secret-change-me"
    access_token_expire_minutes: int = 60 * 24 * 7
    algorithm: str = "HS256"

    upload_dir: str = "storage/uploads"
    max_upload_mb: int = 10

    active_model: ModelName = "mobilenetv3"
    model_dir: str = "models_store"
    confidence_threshold: float = 0.70

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        return f"sqlite:///{(BASE_DIR / 'cocoscan.db').as_posix()}"

    @property
    def upload_path(self) -> Path:
        p = Path(self.upload_dir)
        return p if p.is_absolute() else BASE_DIR / p

    @property
    def model_path(self) -> Path:
        p = Path(self.model_dir)
        return p if p.is_absolute() else BASE_DIR / p


@lru_cache
def get_settings() -> Settings:
    return Settings()

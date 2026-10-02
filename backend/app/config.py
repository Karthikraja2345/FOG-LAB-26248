import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "FOG-LAB 26248"
    APP_ENV: str = "development"
    VERSION: str = "1.0.0"
    SECRET_KEY: str = "foglab-sih2026-simulation-secret-key-change-in-prod"
    API_PORT: int = 8000
    API_HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    DATABASE_URL: str = "sqlite:///./data/demo/foglab.db"
    DEFAULT_SEED: int = 424242
    TICK_INTERVAL_MS: int = 1000
    REPLAY_SPEED_MULTIPLIER: float = 1.0
    ALLOW_ANONYMOUS_DEMO: bool = True
    MASK_GROUND_TRUTH_FROM_TRAINEES: bool = True
    LOG_LEVEL: str = "INFO"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

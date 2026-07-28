import secrets
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "MarketPilot AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/marketpilot"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET: str = ""
    JWT_REFRESH_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    CORS_ORIGINS: str = "http://localhost:3000"

    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_GENERAL_PER_MINUTE: int = 30
    RATE_LIMIT_AUTH_PER_MINUTE: int = 5
    RATE_LIMIT_AI_PER_MINUTE: int = 20
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15

    MAX_REQUEST_SIZE_MB: int = 10
    CRAWL_TIMEOUT_SECONDS: int = 15
    CRAWL_MAX_RESPONSE_MB: int = 5

    _jwt_secret_cache: str = ""
    _jwt_refresh_secret_cache: str = ""

    model_config = {"env_file": ".env", "case_sensitive": True}

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def jwt_secret_key(self) -> str:
        if not self.JWT_SECRET:
            if self.ENVIRONMENT == "production":
                raise RuntimeError("JWT_SECRET must be set in production environment")
            if not self._jwt_secret_cache:
                self._jwt_secret_cache = secrets.token_urlsafe(64)
            return self._jwt_secret_cache
        return self.JWT_SECRET

    @property
    def jwt_refresh_secret_key(self) -> str:
        if not self.JWT_REFRESH_SECRET:
            if self.ENVIRONMENT == "production":
                raise RuntimeError("JWT_REFRESH_SECRET must be set in production environment")
            if not self._jwt_refresh_secret_cache:
                self._jwt_refresh_secret_cache = secrets.token_urlsafe(64)
            return self._jwt_refresh_secret_cache
        return self.JWT_REFRESH_SECRET


@lru_cache
def get_settings() -> Settings:
    return Settings()

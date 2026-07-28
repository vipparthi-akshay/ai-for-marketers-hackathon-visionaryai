import time
from collections import defaultdict
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import get_settings

settings = get_settings()


class RateLimiter:
    def __init__(self):
        self._requests: dict[str, list[float]] = defaultdict(list)
        self._auth_requests: dict[str, list[float]] = defaultdict(list)
        self._last_cleanup: float = 0.0

    def _clean_old_entries(self, entries: list[float], window: int) -> list[float]:
        now = time.time()
        return [t for t in entries if now - t < window]

    def _cleanup_stale_keys(self):
        now = time.time()
        if now - self._last_cleanup < 300:
            return
        self._last_cleanup = now
        stale_keys = [k for k, v in self._requests.items() if not v]
        for k in stale_keys:
            del self._requests[k]
        stale_auth_keys = [k for k, v in self._auth_requests.items() if not v]
        for k in stale_auth_keys:
            del self._auth_requests[k]

    def is_rate_limited(self, client_ip: str, is_auth: bool = False) -> bool:
        now = time.time()
        window = 60

        self._cleanup_stale_keys()

        if is_auth:
            self._auth_requests[client_ip] = self._clean_old_entries(
                self._auth_requests[client_ip], window
            )
            self._auth_requests[client_ip].append(now)
            return len(self._auth_requests[client_ip]) > settings.RATE_LIMIT_AUTH_PER_MINUTE
        else:
            self._requests[client_ip] = self._clean_old_entries(
                self._requests[client_ip], window
            )
            self._requests[client_ip].append(now)
            return len(self._requests[client_ip]) > settings.RATE_LIMIT_GENERAL_PER_MINUTE


rate_limiter_instance = RateLimiter()

AUTH_PATHS = {"/api/v1/auth/login", "/api/v1/auth/register"}


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not settings.RATE_LIMIT_ENABLED:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        is_auth = request.url.path in AUTH_PATHS

        if rate_limiter_instance.is_rate_limited(client_ip, is_auth=is_auth):
            from fastapi.responses import JSONResponse

            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": {
                        "code": "RATE_LIMITED",
                        "detail": "Too many requests. Please try again later.",
                    },
                },
            )

        return await call_next(request)

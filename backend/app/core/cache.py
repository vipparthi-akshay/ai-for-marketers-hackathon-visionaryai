import json
import logging
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_redis_client = None
_redis_available = False


async def get_redis():
    global _redis_client, _redis_available
    if _redis_client is not None and _redis_available:
        return _redis_client
    return None


async def init_redis():
    global _redis_client, _redis_available
    try:
        import redis.asyncio as aioredis
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=3,
            retry_on_timeout=True,
        )
        await _redis_client.ping()
        _redis_available = True
        logger.info("Redis connected successfully")
    except Exception as e:
        _redis_available = False
        logger.warning(f"Redis not available, using in-memory fallback: {e}")


async def close_redis():
    global _redis_client, _redis_available
    if _redis_client:
        try:
            await _redis_client.close()
        except Exception:
            pass
        _redis_client = None
        _redis_available = False


class CacheService:
    def __init__(self, prefix: str = "mp", default_ttl: int = 300):
        self.prefix = prefix
        self.default_ttl = default_ttl

    def _key(self, key: str) -> str:
        return f"{self.prefix}:{key}"

    async def get(self, key: str) -> Any | None:
        redis = await get_redis()
        if not redis:
            return None
        try:
            data = await redis.get(self._key(key))
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.warning(f"Cache get error: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int | None = None) -> bool:
        redis = await get_redis()
        if not redis:
            return False
        try:
            serialized = json.dumps(value, default=str)
            await redis.set(
                self._key(key),
                serialized,
                ex=ttl or self.default_ttl,
            )
            return True
        except Exception as e:
            logger.warning(f"Cache set error: {e}")
            return False

    async def delete(self, key: str) -> bool:
        redis = await get_redis()
        if not redis:
            return False
        try:
            await redis.delete(self._key(key))
            return True
        except Exception as e:
            logger.warning(f"Cache delete error: {e}")
            return False

    async def delete_pattern(self, pattern: str) -> int:
        redis = await get_redis()
        if not redis:
            return 0
        try:
            keys = []
            async for key in redis.scan_iter(match=self._key(pattern)):
                keys.append(key)
            if keys:
                return await redis.delete(*keys)
            return 0
        except Exception as e:
            logger.warning(f"Cache delete pattern error: {e}")
            return 0

    async def incr(self, key: str, ttl: int | None = None) -> int | None:
        redis = await get_redis()
        if not redis:
            return None
        try:
            full_key = self._key(key)
            val = await redis.incr(full_key)
            if val == 1 and ttl:
                await redis.expire(full_key, ttl)
            return val
        except Exception as e:
            logger.warning(f"Cache incr error: {e}")
            return None


cache = CacheService(prefix="mp", default_ttl=300)
ai_cache = CacheService(prefix="mp:ai", default_ttl=600)
rate_limit_cache = CacheService(prefix="mp:rl", default_ttl=60)

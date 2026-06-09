# app/services/cache.py
import os
import json
import hashlib
import httpx
from typing import Any, Optional

_URL = os.getenv("UPSTASH_REDIS_REST_URL")
_TOK = os.getenv("UPSTASH_REDIS_REST_TOKEN")
_ENABLED = bool(_URL and _TOK)
_headers = {"Authorization": f"Bearer {_TOK}"} if _ENABLED else {}

def make_key(*parts: Any) -> str:
    raw = ":".join(str(p) for p in parts)
    return "fl:" + hashlib.sha1(raw.encode()).hexdigest()[:24]

async def cache_get(key: str) -> Optional[Any]:
    if not _ENABLED:
        return None
    try:
        async with httpx.AsyncClient(timeout=5) as c:
            r = await c.get(f"{_URL}/get/{key}", headers=_headers)
            data = r.json().get("result")
            return json.loads(data) if data else None
    except Exception:
        return None

async def cache_set(key: str, value: Any, ttl: int = 86400) -> None:
    if not _ENABLED:
        return
    try:
        payload = json.dumps(value)
        async with httpx.AsyncClient(timeout=5) as c:
            await c.post(f"{_URL}/set/{key}?EX={ttl}", headers=_headers, content=payload)
    except Exception:
        pass

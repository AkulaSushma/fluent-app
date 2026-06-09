"""
Fluent API — FastAPI application entry point.
"""

from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
import asyncio
import httpx
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.base import Base
from app.db.session import engine

# Ensure all models are imported so Base.metadata is populated
import app.db.models  # noqa: F401


async def _keep_warm():
    url = os.getenv("SELF_URL")  # e.g. https://fluent-app-1gvx.onrender.com/health
    if not url:
        return
    async with httpx.AsyncClient(timeout=10) as c:
        while True:
            try:
                await c.get(url)
            except Exception:
                pass
            await asyncio.sleep(600)



@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: create tables and seed data on startup, dispose engine on shutdown."""
    setup_logging()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Auto-seed database if needed on startup
    from app.seed.seed_data import seed
    try:
        await seed()
    except Exception as e:
        import logging
        logging.error(f"Database auto-seeding failed: {e}")
        
    if os.getenv("ENABLE_KEEP_WARM", "1") == "1":
        asyncio.create_task(_keep_warm())

    yield
    await engine.dispose()


# ── Sentry Observability ──────────────────────────────────────────────
if settings.SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            integrations=[FastApiIntegration()],
            # Cost and performance budget controls:
            traces_sample_rate=0.05,   # 5% transaction sampling
            profiles_sample_rate=0.01,  # 1% profiling sampling
            send_default_pii=False,
        )
        import logging
        logging.info("Sentry initialized successfully.")
    except ImportError:
        import logging
        logging.warning("Sentry SDK not installed. Skipping Sentry setup.")
    except Exception as e:
        import logging
        logging.error(f"Sentry setup failed: {e}")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────

API_PREFIX = "/api/v1"

app.include_router(api_router, prefix=API_PREFIX)


# ── Health check ─────────────────────────────────────────────────────

@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "message": "Fluent API is running"}


@app.get("/health", include_in_schema=False)
async def health():
    return {"status": "ok"}


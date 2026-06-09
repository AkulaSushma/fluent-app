"""
Fluent API — Async database engine and session factory.
"""

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

# Configure connection pool parameters dynamically.
# pool_size=5, max_overflow=10, and pool_recycle=1800 ensure connection reuse.
# pool_pre_ping=True verifies connections before execution.
# prepare_threshold=None is required for Supabase transaction mode pooler.
engine_kwargs = {
    "echo": os.getenv("SQL_ECHO", "false").lower() == "true",
    "future": True,
}

if not settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"prepare_threshold": None}
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
        "pool_recycle": 1800,
    })

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)


async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a transactional async session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

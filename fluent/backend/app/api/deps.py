"""
Fluent API — Shared FastAPI dependencies.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_token
from app.db.models import User
from app.db.session import async_session_factory

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a transactional async database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Extract the user from the JWT bearer token.
    Raises 401 if the token is invalid or the user doesn't exist.
    """
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_token(token)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    user = await db.get(User, user_id)
    if user is None:
        raise credentials_exc

    # Retrieve user settings to populate request-scoped API keys ContextVar
    from sqlalchemy import select
    from app.db.models import UserSettings
    from app.core.context import user_api_keys
    
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == user.id))
    settings = result.scalar_one_or_none()
    if settings:
        user_api_keys.set({
            "gemini_api_key": settings.gemini_api_key,
            "openrouter_api_key": settings.openrouter_api_key,
            "groq_api_key": settings.groq_api_key,
        })
    else:
        user_api_keys.set({
            "gemini_api_key": None,
            "openrouter_api_key": None,
            "groq_api_key": None,
        })

    return user

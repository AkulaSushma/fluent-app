"""
Fluent API — User settings endpoints (notifications, daily goals).
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import User
from app.schemas.learning import UserSettingsOut, UserSettingsUpdate
from app.services.notification_service import (
    get_notification_schedule,
    get_user_settings,
    update_user_settings,
)

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/me", response_model=UserSettingsOut)
async def my_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the authenticated user's notification and learning settings."""
    settings = await get_user_settings(db, current_user.id)
    return UserSettingsOut(**settings)


@router.put("/me", response_model=UserSettingsOut)
async def update_settings(
    body: UserSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user settings (notification times, daily goals, themes).

    Morning reminder time must be between 06:00 and 11:59.
    Evening reminder time must be between 15:00 and 23:59.
    """
    try:
        updated = await update_user_settings(
            db,
            current_user.id,
            body.model_dump(exclude_none=True),
        )
        return UserSettingsOut(**updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/schedule")
async def notification_schedule(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the user's complete notification schedule."""
    settings = await get_user_settings(db, current_user.id)
    schedule = get_notification_schedule(settings)
    return {"schedule": schedule, "reminders_enabled": settings["reminders_enabled"]}

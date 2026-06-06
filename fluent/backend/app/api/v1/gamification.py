"""
Fluent API — Gamification routes: XP, achievements, and daily challenges.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import User
from app.schemas.learning import (
    AchievementOut,
    AchievementsResponse,
    ChallengeOut,
    ChallengesResponse,
    XPResponse,
)
from app.services.gamification_service import (
    check_achievements,
    get_achievements,
    get_daily_challenges,
    get_xp_state,
)

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/xp", response_model=XPResponse)
async def get_xp(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> XPResponse:
    """Return the current XP, level, and progress towards the next level."""
    state = await get_xp_state(db, user.id)
    return XPResponse(**state)


@router.get("/achievements", response_model=AchievementsResponse)
async def get_all_achievements(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AchievementsResponse:
    """
    Return every achievement with its unlock status.
    Also runs a background check to unlock any newly-earned achievements.
    """
    # Attempt to unlock new achievements before returning the full list
    await check_achievements(db, user.id)
    data = await get_achievements(db, user.id)
    return AchievementsResponse(
        achievements=[AchievementOut(**a) for a in data["achievements"]],
        unlocked_count=data["unlocked_count"],
        total_count=data["total_count"],
    )


@router.get("/challenges", response_model=ChallengesResponse)
async def get_challenges(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ChallengesResponse:
    """Return today's three daily challenges with live progress."""
    challenges = await get_daily_challenges(db, user.id)
    return ChallengesResponse(
        challenges=[ChallengeOut(**c) for c in challenges],
    )

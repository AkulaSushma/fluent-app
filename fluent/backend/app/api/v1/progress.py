"""
Fluent API — User progress & analytics endpoints.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import User
from app.services.progress_service import get_trends, get_user_progress, log_session

router = APIRouter(prefix="/progress", tags=["progress"])


class SessionLogRequest(BaseModel):
    session_type: str = Field(pattern="^(vocab|grammar|pronunciation|tutor)$")
    duration: int = Field(ge=1, description="Duration in minutes")
    score: float | None = Field(default=None, ge=0, le=100)


@router.get("/me")
async def my_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the authenticated user's complete progress stats with intelligence data."""
    base = await get_user_progress(db, current_user.id)

    # Enrich with intelligence data
    try:
        from app.services.srs_engine import get_due_count
        base["srs_due_count"] = await get_due_count(db, current_user.id)
    except Exception:
        base["srs_due_count"] = 0

    try:
        from app.services.curriculum_service import get_phase_progress
        curriculum = await get_phase_progress(db, current_user.id)
        base["curriculum_day"] = curriculum.get("current_day", 1)
        base["curriculum_phase"] = curriculum.get("phase", "foundation")
    except Exception:
        base["curriculum_day"] = 1
        base["curriculum_phase"] = "foundation"

    try:
        from app.services.adaptive_engine import calculate_seriousness_score
        seriousness = await calculate_seriousness_score(db, current_user.id)
        base["seriousness_score"] = seriousness.get("score", 0)
    except Exception:
        base["seriousness_score"] = 0

    # Include XP data
    base["xp"] = current_user.xp
    base["xp_level"] = current_user.xp_level

    return base


@router.get("/trends")
async def my_trends(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return improvement trends (current vs. previous 4-week period)."""
    return await get_trends(db, current_user.id)


@router.get("/heatmap")
async def activity_heatmap(
    days: int = Query(90, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return activity heatmap data for the last N days."""
    try:
        from app.services.adaptive_engine import get_activity_heatmap
        return await get_activity_heatmap(db, current_user.id, days)
    except Exception:
        return {"days": [], "total_active_days": 0, "longest_streak": 0}


@router.get("/seriousness")
async def seriousness_score(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the user's engagement/seriousness score (0-100)."""
    try:
        from app.services.adaptive_engine import calculate_seriousness_score
        return await calculate_seriousness_score(db, current_user.id)
    except Exception:
        return {
            "score": 0,
            "login_consistency": 0.0,
            "completion_rate": 0.0,
            "session_depth": 0.0,
            "streak_bonus": 0.0,
            "label": "Casual",
        }


@router.get("/recommendation")
async def content_recommendation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return a smart content recommendation / hero message."""
    try:
        from app.services.adaptive_engine import recommend_content
        message = await recommend_content(db, current_user.id)
        return {"message": message}
    except Exception:
        return {"message": f"Keep going, {current_user.name.split(' ')[0]}! Every minute of practice builds real fluency."}


@router.post("/session")
async def create_session(
    body: SessionLogRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Log a completed practice session and award XP."""
    result = await log_session(
        db,
        current_user.id,
        body.session_type,
        body.duration,
        body.score,
    )

    # Award XP for completing a session
    try:
        from app.services.gamification_service import award_xp, check_achievements
        xp_amount = max(5, body.duration * 3)
        if body.score and body.score >= 90:
            xp_amount += 30  # Perfect score bonus
        await award_xp(db, current_user.id, xp_amount, body.session_type, f"{body.session_type} session ({body.duration}min)")
        new_achievements = await check_achievements(db, current_user.id)
        result["xp_awarded"] = xp_amount
        result["new_achievements"] = new_achievements
    except Exception:
        result["xp_awarded"] = 0
        result["new_achievements"] = []

    return result

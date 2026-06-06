"""
Fluent API — User progress tracking and analytics service.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import SessionLog, SessionType, StreakRecord, User, UserSettings, VocabProgress


async def get_user_progress(db: AsyncSession, user_id: str) -> dict[str, Any]:
    """
    Build a comprehensive progress snapshot for the dashboard:
    streak, fluency score, total words, weekly minutes, daily breakdown,
    and goal-progress percentage.
    """
    user = await db.get(User, user_id)
    if user is None:
        return {}

    today = date.today()
    week_start = today - timedelta(days=today.weekday())  # Monday

    # Weekly minutes
    weekly_q = select(func.coalesce(func.sum(StreakRecord.minutes_practiced), 0)).where(
        StreakRecord.user_id == user_id,
        StreakRecord.date >= week_start,
    )
    weekly_minutes: int = (await db.execute(weekly_q)).scalar_one()

    # Daily breakdown (last 7 days)
    daily_breakdown: list[dict[str, Any]] = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_q = select(StreakRecord).where(
            StreakRecord.user_id == user_id,
            StreakRecord.date == d,
        )
        record = (await db.execute(day_q)).scalar_one_or_none()
        daily_breakdown.append({
            "date": d.isoformat(),
            "minutes": record.minutes_practiced if record else 0,
            "drills": record.drills_completed if record else 0,
        })

    # Words mastered
    mastered_q = select(func.count()).where(
        VocabProgress.user_id == user_id,
        VocabProgress.mastered.is_(True),
    )
    words_mastered: int = (await db.execute(mastered_q)).scalar_one()

    # Goal: daily_goal_minutes from settings / day  → progress as a percentage
    settings_q = select(UserSettings.daily_goal_minutes).where(UserSettings.user_id == user_id)
    goal_minutes: int = (await db.execute(settings_q)).scalar_one_or_none() or 30

    today_q = select(StreakRecord).where(
        StreakRecord.user_id == user_id,
        StreakRecord.date == today,
    )
    today_record = (await db.execute(today_q)).scalar_one_or_none()
    today_minutes = today_record.minutes_practiced if today_record else 0
    goal_progress = min(round(today_minutes / goal_minutes * 100), 100)

    return {
        "streak_days": user.streak_days,
        "fluency_score": user.fluency_score,
        "total_words": user.total_words,
        "words_mastered": words_mastered,
        "weekly_minutes": weekly_minutes,
        "today_minutes": today_minutes,
        "goal_progress": goal_progress,
        "daily_breakdown": daily_breakdown,
        "level": user.level,
    }


async def update_streak(db: AsyncSession, user_id: str) -> int:
    """
    Recalculate and persist the user's current streak (consecutive days
    with at least one practice session).  Returns the new streak count.
    """
    user = await db.get(User, user_id)
    if user is None:
        return 0

    today = date.today()
    streak = 0
    check_date = today

    while True:
        q = select(StreakRecord).where(
            StreakRecord.user_id == user_id,
            StreakRecord.date == check_date,
        )
        record = (await db.execute(q)).scalar_one_or_none()
        if record and record.minutes_practiced > 0:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    user.streak_days = streak
    db.add(user)
    await db.flush()
    return streak


async def log_session(
    db: AsyncSession,
    user_id: str,
    session_type: str,
    duration: int,
    score: float | None = None,
) -> dict[str, Any]:
    """
    Record a completed practice session and update today's streak record.
    """
    # Create session log
    log_entry = SessionLog(
        user_id=user_id,
        session_type=SessionType(session_type),
        duration_minutes=duration,
        score=score,
    )
    db.add(log_entry)

    # Upsert today's streak record
    today = date.today()
    q = select(StreakRecord).where(
        StreakRecord.user_id == user_id,
        StreakRecord.date == today,
    )
    record = (await db.execute(q)).scalar_one_or_none()
    if record:
        record.minutes_practiced += duration
        record.drills_completed += 1
    else:
        record = StreakRecord(
            user_id=user_id,
            date=today,
            minutes_practiced=duration,
            drills_completed=1,
        )
        db.add(record)

    # Update streak count
    await db.flush()
    streak = await update_streak(db, user_id)

    return {
        "session_id": log_entry.id,
        "streak_days": streak,
        "today_minutes": record.minutes_practiced,
    }


async def get_trends(db: AsyncSession, user_id: str) -> dict[str, Any]:
    """
    Calculate improvement trends over the last 4 weeks compared to the
    4 weeks before that.
    """
    today = date.today()
    current_start = today - timedelta(days=28)
    previous_start = current_start - timedelta(days=28)

    async def _period_stats(start: date, end: date) -> dict[str, Any]:
        minutes_q = select(
            func.coalesce(func.sum(StreakRecord.minutes_practiced), 0)
        ).where(
            StreakRecord.user_id == user_id,
            StreakRecord.date >= start,
            StreakRecord.date < end,
        )
        drills_q = select(
            func.coalesce(func.sum(StreakRecord.drills_completed), 0)
        ).where(
            StreakRecord.user_id == user_id,
            StreakRecord.date >= start,
            StreakRecord.date < end,
        )
        sessions_q = select(func.count()).where(
            SessionLog.user_id == user_id,
            SessionLog.created_at >= datetime(start.year, start.month, start.day, tzinfo=timezone.utc),
            SessionLog.created_at < datetime(end.year, end.month, end.day, tzinfo=timezone.utc),
        )
        avg_score_q = select(func.avg(SessionLog.score)).where(
            SessionLog.user_id == user_id,
            SessionLog.score.is_not(None),
            SessionLog.created_at >= datetime(start.year, start.month, start.day, tzinfo=timezone.utc),
            SessionLog.created_at < datetime(end.year, end.month, end.day, tzinfo=timezone.utc),
        )

        total_minutes = (await db.execute(minutes_q)).scalar_one()
        total_drills = (await db.execute(drills_q)).scalar_one()
        total_sessions = (await db.execute(sessions_q)).scalar_one()
        avg_score = (await db.execute(avg_score_q)).scalar_one()

        return {
            "total_minutes": total_minutes,
            "total_drills": total_drills,
            "total_sessions": total_sessions,
            "avg_score": round(avg_score, 1) if avg_score else None,
        }

    current = await _period_stats(current_start, today)
    previous = await _period_stats(previous_start, current_start)

    def _delta(curr: int | float | None, prev: int | float | None) -> float | None:
        if curr is None or prev is None or prev == 0:
            return None
        return round((curr - prev) / prev * 100, 1)

    return {
        "current_period": current,
        "previous_period": previous,
        "deltas": {
            "minutes": _delta(current["total_minutes"], previous["total_minutes"]),
            "drills": _delta(current["total_drills"], previous["total_drills"]),
            "sessions": _delta(current["total_sessions"], previous["total_sessions"]),
            "avg_score": _delta(current["avg_score"], previous["avg_score"]),
        },
    }

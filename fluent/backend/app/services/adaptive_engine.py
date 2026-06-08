"""
Fluent API — Adaptive engine: seriousness scoring, heatmap, and content recommendations.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    DailyPlan,
    GrammarProgress,
    SessionLog,
    SessionType,
    SRSCard,
    StreakRecord,
    User,
    UserCurriculumProgress,
    VocabProgress,
)

# ── Seriousness labels ──────────────────────────────────────────────

_SERIOUSNESS_LABELS: list[tuple[int, str]] = [
    (76, "Obsessed"),
    (51, "Dedicated"),
    (26, "Committed"),
    (0, "Casual"),
]


def _seriousness_label(score: int) -> str:
    """Map a 0-100 score to a human-readable label."""
    for threshold, label in _SERIOUSNESS_LABELS:
        if score >= threshold:
            return label
    return "Casual"


# ── Seriousness Score ───────────────────────────────────────────────


async def calculate_seriousness_score(
    db: AsyncSession, user_id: str,
) -> dict[str, Any]:
    """
    Calculate a 0-100 "seriousness" score for a user based on four
    weighted dimensions over the last 30 days:
        * login_consistency (30 %): days active / 30
        * completion_rate   (25 %): completed tasks / total tasks
        * session_depth     (25 %): avg session duration / 15 min target
        * streak_bonus      (20 %): current streak / 30
    """
    user = await db.get(User, user_id)
    if user is None:
        return {
            "score": 0,
            "login_consistency": 0.0,
            "completion_rate": 0.0,
            "session_depth": 0.0,
            "streak_bonus": 0.0,
            "label": "Casual",
        }

    today = date.today()
    thirty_days_ago = today - timedelta(days=30)

    # 1. Login consistency — distinct active days in the last 30
    active_days_q = select(func.count(func.distinct(StreakRecord.date))).where(
        StreakRecord.user_id == user_id,
        StreakRecord.date >= thirty_days_ago,
        StreakRecord.minutes_practiced > 0,
    )
    active_days: int = (await db.execute(active_days_q)).scalar_one()
    login_consistency = min(active_days / 30.0, 1.0)

    # 2. Completion rate — completed daily plans / total daily plans
    total_plans_q = select(func.count()).where(
        DailyPlan.user_id == user_id,
        DailyPlan.date >= thirty_days_ago,
    )
    completed_plans_q = select(func.count()).where(
        DailyPlan.user_id == user_id,
        DailyPlan.date >= thirty_days_ago,
        DailyPlan.completed.is_(True),
    )
    total_plans: int = (await db.execute(total_plans_q)).scalar_one()
    completed_plans: int = (await db.execute(completed_plans_q)).scalar_one()
    completion_rate = (completed_plans / total_plans) if total_plans > 0 else 0.0

    # 3. Session depth — avg session duration / 15-minute target
    avg_dur_q = select(
        func.coalesce(func.avg(SessionLog.duration_minutes), 0.0)
    ).where(
        SessionLog.user_id == user_id,
        SessionLog.created_at >= datetime(
            thirty_days_ago.year, thirty_days_ago.month, thirty_days_ago.day,
            tzinfo=timezone.utc,
        ),
    )
    avg_duration: float = (await db.execute(avg_dur_q)).scalar_one()
    session_depth = min(avg_duration / 15.0, 1.0)

    # 4. Streak bonus
    streak_bonus = min(user.streak_days / 30.0, 1.0)

    # Weighted total
    raw_score = (
        login_consistency * 30
        + completion_rate * 25
        + session_depth * 25
        + streak_bonus * 20
    )
    score = min(round(raw_score), 100)

    return {
        "score": score,
        "login_consistency": round(login_consistency, 2),
        "completion_rate": round(completion_rate, 2),
        "session_depth": round(session_depth, 2),
        "streak_bonus": round(streak_bonus, 2),
        "label": _seriousness_label(score),
    }


# ── Activity Heatmap ────────────────────────────────────────────────


def _intensity(minutes: int) -> int:
    """Map practice minutes to a 0-4 intensity band."""
    if minutes <= 0:
        return 0
    if minutes < 15:
        return 1
    if minutes < 30:
        return 2
    if minutes < 60:
        return 3
    return 4


async def get_activity_heatmap(
    db: AsyncSession, user_id: str, days: int = 90,
) -> list[dict[str, Any]]:
    """
    Return the last *days* days of activity as a list of
    ``{date, minutes, intensity}`` dicts suitable for a heatmap widget.
    """
    today = date.today()
    start = today - timedelta(days=days - 1)

    # Bulk-fetch all streak records in the window
    q = select(StreakRecord).where(
        StreakRecord.user_id == user_id,
        StreakRecord.date >= start,
        StreakRecord.date <= today,
    )
    rows = (await db.execute(q)).scalars().all()
    records_by_date: dict[date, int] = {
        r.date: r.minutes_practiced for r in rows
    }

    heatmap: list[dict[str, Any]] = []
    for offset in range(days):
        d = start + timedelta(days=offset)
        mins = records_by_date.get(d, 0)
        heatmap.append({
            "date": d.isoformat(),
            "minutes": mins,
            "intensity": _intensity(mins),
        })

    return heatmap


# ── Content Recommendation ──────────────────────────────────────────


async def recommend_content(db: AsyncSession, user_id: str) -> str:
    """
    Return a dynamic "hero" message based on recent performance.
    The message is chosen from a priority list so the most relevant
    insight is always shown first.
    """
    user = await db.get(User, user_id)
    if user is None:
        return "Welcome to Fluent! Start your first lesson today."

    today = date.today()

    # ── Streak message ──────────────────────────────────────────
    if user.streak_days >= 7:
        streak_msg = f"Incredible consistency! {user.streak_days} days and counting!"
    else:
        streak_msg = None

    # ── Grammar accuracy trend (last 7 vs previous 7 days) ─────
    week_ago = today - timedelta(days=7)
    two_weeks_ago = today - timedelta(days=14)

    async def _avg_grammar_score(since: date, until: date) -> float | None:
        q = select(func.avg(SessionLog.score)).where(
            SessionLog.user_id == user_id,
            SessionLog.session_type == SessionType.grammar,
            SessionLog.score.is_not(None),
            SessionLog.created_at >= datetime(since.year, since.month, since.day, tzinfo=timezone.utc),
            SessionLog.created_at < datetime(until.year, until.month, until.day, tzinfo=timezone.utc),
        )
        return (await db.execute(q)).scalar_one()

    current_grammar = await _avg_grammar_score(week_ago, today)
    prev_grammar = await _avg_grammar_score(two_weeks_ago, week_ago)

    grammar_msg = None
    if current_grammar is not None and prev_grammar is not None and prev_grammar > 0:
        improvement = round(current_grammar - prev_grammar, 1)
        if improvement > 0:
            grammar_msg = f"Your grammar accuracy improved {improvement}% this week!"

    # ── Weakest grammar topic ──────────────────────────────────
    weak_topic_q = (
        select(GrammarProgress.topic, GrammarProgress.score)
        .where(
            GrammarProgress.user_id == user_id,
            GrammarProgress.completed.is_(False),
        )
        .order_by(GrammarProgress.score.asc())
        .limit(1)
    )
    weak_row = (await db.execute(weak_topic_q)).first()
    weak_msg = None
    if weak_row is not None:
        topic, score = weak_row
        pct = round(score)
        weak_msg = (
            f"Focus area: {topic} ({pct}% accuracy) "
            f"— let's work on that today!"
        )

    # ── SRS cards due ──────────────────────────────────────────
    due_q = select(func.count()).where(
        SRSCard.user_id == user_id,
        SRSCard.next_review <= today,
    )
    due_count: int = (await db.execute(due_q)).scalar_one()
    srs_msg = None
    if due_count >= 5:
        srs_msg = f"You have {due_count} SRS cards due — a quick review will lock them in!"

    # ── Words mastered ─────────────────────────────────────────
    mastered_q = select(func.count()).where(
        VocabProgress.user_id == user_id,
        VocabProgress.mastered.is_(True),
    )
    mastered: int = (await db.execute(mastered_q)).scalar_one()
    vocab_msg = None
    if mastered > 0 and mastered % 25 == 0:
        vocab_msg = f"Milestone: you've mastered {mastered} words! Keep building your lexicon."

    # Priority order
    for msg in (grammar_msg, weak_msg, streak_msg, srs_msg, vocab_msg):
        if msg is not None:
            return msg

    # Fallback
    return "Keep up the great work — every session counts!"


async def evaluate_and_update_user_level(db: AsyncSession, user_id: str) -> str | None:
    """
    Evaluate the user's recent performance and adjust their CEFR level if needed.
    Fetches the last 3 completed SessionLog entries with scores for the user.
    If the average score is >= 85%, promote their level:
      "beginner" -> "intermediate" -> "advanced".
    If the average score is < 65%, demote their level:
      "advanced" -> "intermediate" -> "beginner".
    
    Returns the new level if changed, else None.
    """
    # Fetch the user
    user = await db.get(User, user_id)
    if user is None:
        return None

    # Fetch the last 3 completed SessionLog entries with scores for this user
    q = (
        select(SessionLog)
        .where(
            SessionLog.user_id == user_id,
            SessionLog.score.is_not(None),
        )
        .order_by(SessionLog.created_at.desc())
        .limit(3)
    )
    result = await db.execute(q)
    logs = result.scalars().all()

    # We need at least 3 completed scored sessions to evaluate level changes
    if len(logs) < 3:
        return None

    # Calculate average score
    avg_score = sum(log.score for log in logs) / len(logs)

    # Level hierarchy
    levels = ["beginner", "intermediate", "advanced"]
    current_level = user.level
    if current_level not in levels:
        current_level = "intermediate"  # fallback default
    
    current_index = levels.index(current_level)
    new_index = current_index

    if avg_score >= 85.0:
        if current_index < 2:
            new_index = current_index + 1
    elif avg_score < 65.0:
        if current_index > 0:
            new_index = current_index - 1

    if new_index != current_index:
        new_level = levels[new_index]
        user.level = new_level
        db.add(user)
        await db.flush()
        return new_level

    return None


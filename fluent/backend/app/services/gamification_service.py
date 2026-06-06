"""
Fluent API — Gamification service: XP system, achievements, and daily challenges.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    Achievement,
    AchievementCategory,
    DailyPlan,
    GrammarProgress,
    SessionLog,
    SessionType,
    SRSCard,
    StreakRecord,
    User,
    UserAchievement,
    UserCurriculumProgress,
    VocabProgress,
    XPSource,
    XPTransaction,
)

# ── Level System ────────────────────────────────────────────────────

LEVEL_THRESHOLDS: list[int] = [
    0, 100, 250, 500, 850, 1300, 1900, 2700, 3800, 5200, 7000, 9500,
]

LEVEL_TITLES: list[str] = [
    "Novice", "Beginner", "Learner", "Student", "Intermediate", "Skilled",
    "Advanced", "Expert", "Master", "Scholar", "Virtuoso", "Pro",
]

# ── Achievement Definitions ─────────────────────────────────────────

ACHIEVEMENT_DEFS: list[dict[str, Any]] = [
    {"code": "first_steps",    "title": "First Steps",      "description": "Complete your first day",             "emoji": "👶", "category": "milestone",    "threshold": 1},
    {"code": "week_warrior",   "title": "Week Warrior",     "description": "Maintain a 7-day streak",             "emoji": "⚔️", "category": "streak",       "threshold": 7},
    {"code": "fortnight_fire", "title": "Fortnight Fire",   "description": "Maintain a 14-day streak",            "emoji": "🔥", "category": "streak",       "threshold": 14},
    {"code": "month_master",   "title": "Month Master",     "description": "Maintain a 30-day streak",            "emoji": "🏆", "category": "streak",       "threshold": 30},
    {"code": "iron_streak",    "title": "Iron Streak",      "description": "Maintain a 60-day streak",            "emoji": "💎", "category": "streak",       "threshold": 60},
    {"code": "century_club",   "title": "Century Club",     "description": "Maintain a 90-day streak",            "emoji": "💯", "category": "streak",       "threshold": 90},
    {"code": "word_collector",  "title": "Word Collector",   "description": "Master 50 words",                     "emoji": "📚", "category": "mastery",      "threshold": 50},
    {"code": "lexicon_lord",   "title": "Lexicon Lord",     "description": "Master 200 words",                    "emoji": "👑", "category": "mastery",      "threshold": 200},
    {"code": "grammar_guru",   "title": "Grammar Guru",     "description": "Complete 10 grammar lessons",         "emoji": "🧩", "category": "mastery",      "threshold": 10},
    {"code": "sharp_tongue",   "title": "Sharp Tongue",     "description": "Achieve 90%+ pronunciation accuracy", "emoji": "🎯", "category": "mastery",      "threshold": 90},
    {"code": "speed_learner",  "title": "Speed Learner",    "description": "Complete 5 drills in one day",        "emoji": "⚡", "category": "consistency",  "threshold": 5},
    {"code": "night_owl",      "title": "Night Owl",        "description": "Evening review for 7 days",           "emoji": "🦉", "category": "consistency",  "threshold": 7},
    {"code": "early_bird",     "title": "Early Bird",       "description": "Morning session for 7 days",          "emoji": "🐦", "category": "consistency",  "threshold": 7},
    {"code": "dedication",     "title": "Dedication",       "description": "Complete 100+ sessions",              "emoji": "💪", "category": "consistency",  "threshold": 100},
    {"code": "level_5",        "title": "Rising Star",      "description": "Reach level 5",                       "emoji": "🌟", "category": "milestone",    "threshold": 5},
    {"code": "level_10",       "title": "Shining Star",     "description": "Reach level 10",                      "emoji": "⭐", "category": "milestone",    "threshold": 10},
    {"code": "phase_2",        "title": "Building Phase",   "description": "Enter the Building phase",            "emoji": "🚀", "category": "milestone",    "threshold": 31},
    {"code": "phase_3",        "title": "Mastery Phase",    "description": "Enter the Mastery phase",             "emoji": "🎓", "category": "milestone",    "threshold": 61},
    {"code": "fluent_pro",     "title": "Fluent Pro",       "description": "Complete the full 90-day programme",   "emoji": "🏅", "category": "milestone",    "threshold": 90},
    {"code": "perfectionist",  "title": "Perfectionist",    "description": "Score 10 perfect quizzes",            "emoji": "💎", "category": "mastery",      "threshold": 10},
]


# ── XP helpers ──────────────────────────────────────────────────────


def calculate_level(xp: int) -> tuple[int, str]:
    """Return ``(level_number, title)`` derived from total XP."""
    level = 1
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if xp >= threshold:
            level = i + 1
        else:
            break
    # Clamp to max level
    level = min(level, len(LEVEL_TITLES))
    return level, LEVEL_TITLES[level - 1]


async def award_xp(
    db: AsyncSession,
    user_id: str,
    amount: int,
    source: str,
    description: str,
) -> dict[str, Any]:
    """
    Award XP to a user, record the transaction, and update the user's
    persisted ``xp`` / ``xp_level``.  Returns the new XP state dict.
    """
    user = await db.get(User, user_id)
    if user is None:
        return {}

    # Record transaction
    txn = XPTransaction(
        user_id=user_id,
        amount=amount,
        source=XPSource(source),
        description=description,
    )
    db.add(txn)

    # Update user totals
    user.xp += amount
    new_level, title = calculate_level(user.xp)
    leveled_up = new_level > user.xp_level
    user.xp_level = new_level
    db.add(user)
    await db.flush()

    state = await get_xp_state(db, user_id)
    state["leveled_up"] = leveled_up
    state["awarded"] = amount
    return state


async def get_xp_state(db: AsyncSession, user_id: str) -> dict[str, Any]:
    """
    Return the full XP state for a user including progress towards
    the next level.
    """
    user = await db.get(User, user_id)
    if user is None:
        return {}

    level, title = calculate_level(user.xp)
    current_threshold = LEVEL_THRESHOLDS[level - 1] if level <= len(LEVEL_THRESHOLDS) else LEVEL_THRESHOLDS[-1]

    if level < len(LEVEL_THRESHOLDS):
        next_threshold = LEVEL_THRESHOLDS[level]
    else:
        next_threshold = current_threshold  # max level

    xp_into_level = user.xp - current_threshold
    xp_needed = max(next_threshold - current_threshold, 1)
    progress = min(round(xp_into_level / xp_needed, 2), 1.0)

    return {
        "xp": user.xp,
        "level": level,
        "xp_for_current_level": current_threshold,
        "xp_for_next_level": next_threshold,
        "progress_to_next": progress,
        "title": title,
    }


# ── Achievements ────────────────────────────────────────────────────


async def _ensure_achievements_seeded(db: AsyncSession) -> None:
    """Insert any missing achievement rows into the DB."""
    existing_q = select(Achievement.code)
    result = await db.execute(existing_q)
    existing_codes: set[str] = {row[0] for row in result.all()}

    for defn in ACHIEVEMENT_DEFS:
        if defn["code"] not in existing_codes:
            db.add(Achievement(
                code=defn["code"],
                title=defn["title"],
                description=defn["description"],
                emoji=defn["emoji"],
                category=AchievementCategory(defn["category"]),
                threshold=defn["threshold"],
            ))
    await db.flush()


async def _get_user_metric(db: AsyncSession, user_id: str, code: str) -> int:
    """
    Resolve the current metric value for a given achievement code.
    """
    user = await db.get(User, user_id)
    if user is None:
        return 0

    if code in ("week_warrior", "fortnight_fire", "month_master", "iron_streak", "century_club"):
        return user.streak_days

    if code == "first_steps":
        q = select(func.count()).where(
            StreakRecord.user_id == user_id,
            StreakRecord.minutes_practiced > 0,
        )
        return (await db.execute(q)).scalar_one()

    if code == "word_collector" or code == "lexicon_lord":
        q = select(func.count()).where(
            VocabProgress.user_id == user_id,
            VocabProgress.mastered.is_(True),
        )
        return (await db.execute(q)).scalar_one()

    if code == "grammar_guru":
        q = select(func.count()).where(
            GrammarProgress.user_id == user_id,
            GrammarProgress.completed.is_(True),
        )
        return (await db.execute(q)).scalar_one()

    if code == "sharp_tongue":
        # Best pronunciation score achieved
        q = select(func.coalesce(func.max(SessionLog.score), 0.0)).where(
            SessionLog.user_id == user_id,
            SessionLog.session_type == SessionType.pronunciation,
        )
        val = (await db.execute(q)).scalar_one()
        return int(val) if val else 0

    if code == "speed_learner":
        # Max drills in a single day
        q = select(func.coalesce(func.max(StreakRecord.drills_completed), 0)).where(
            StreakRecord.user_id == user_id,
        )
        return (await db.execute(q)).scalar_one()

    if code in ("night_owl", "early_bird"):
        # Count days with sessions in the relevant time window
        # Night owl: sessions created after 18:00, Early bird: before 10:00
        if code == "night_owl":
            hour_check = func.cast(func.strftime("%H", SessionLog.created_at), type_=func.integer if False else None)
            # Use a simpler approach: count distinct dates with evening sessions
            q = select(func.count(func.distinct(func.date(SessionLog.created_at)))).where(
                SessionLog.user_id == user_id,
                func.strftime("%H", SessionLog.created_at) >= "18",
            )
        else:
            q = select(func.count(func.distinct(func.date(SessionLog.created_at)))).where(
                SessionLog.user_id == user_id,
                func.strftime("%H", SessionLog.created_at) < "10",
            )
        return (await db.execute(q)).scalar_one()

    if code == "dedication":
        q = select(func.count()).where(SessionLog.user_id == user_id)
        return (await db.execute(q)).scalar_one()

    if code == "level_5" or code == "level_10":
        return user.xp_level

    if code == "phase_2" or code == "phase_3":
        progress = await db.execute(
            select(UserCurriculumProgress.current_day).where(
                UserCurriculumProgress.user_id == user_id,
            )
        )
        row = progress.scalar_one_or_none()
        return row if row else 0

    if code == "fluent_pro":
        progress = await db.execute(
            select(UserCurriculumProgress.current_day).where(
                UserCurriculumProgress.user_id == user_id,
            )
        )
        row = progress.scalar_one_or_none()
        return row if row else 0

    if code == "perfectionist":
        q = select(func.count()).where(
            SessionLog.user_id == user_id,
            SessionLog.score == 100.0,
        )
        return (await db.execute(q)).scalar_one()

    return 0


async def check_achievements(db: AsyncSession, user_id: str) -> list[dict[str, Any]]:
    """
    Evaluate every achievement; unlock any newly earned ones and return
    a list of newly-unlocked achievement dicts.
    """
    await _ensure_achievements_seeded(db)

    # Fetch all achievements
    all_q = select(Achievement)
    all_achievements = (await db.execute(all_q)).scalars().all()

    # Fetch already-unlocked achievement IDs
    unlocked_q = select(UserAchievement.achievement_id).where(
        UserAchievement.user_id == user_id,
    )
    unlocked_ids: set[int] = {
        row[0] for row in (await db.execute(unlocked_q)).all()
    }

    newly_unlocked: list[dict[str, Any]] = []

    for ach in all_achievements:
        if ach.id in unlocked_ids:
            continue

        metric = await _get_user_metric(db, user_id, ach.code)
        if metric >= ach.threshold:
            now = datetime.now(timezone.utc)
            ua = UserAchievement(
                user_id=user_id,
                achievement_id=ach.id,
                unlocked_at=now,
            )
            db.add(ua)
            newly_unlocked.append({
                "code": ach.code,
                "title": ach.title,
                "description": ach.description,
                "emoji": ach.emoji,
                "category": ach.category.value,
                "threshold": ach.threshold,
                "unlocked_at": now.isoformat(),
            })

    if newly_unlocked:
        await db.flush()

    return newly_unlocked


async def get_achievements(db: AsyncSession, user_id: str) -> dict[str, Any]:
    """
    Return every achievement along with its unlocked status for the user.
    """
    await _ensure_achievements_seeded(db)

    all_q = select(Achievement)
    all_achievements = (await db.execute(all_q)).scalars().all()

    unlocked_q = select(UserAchievement).where(
        UserAchievement.user_id == user_id,
    )
    unlocked_rows = (await db.execute(unlocked_q)).scalars().all()
    unlocked_map: dict[int, datetime] = {
        ua.achievement_id: ua.unlocked_at for ua in unlocked_rows
    }

    achievements_out: list[dict[str, Any]] = []
    for ach in all_achievements:
        unlocked_at = unlocked_map.get(ach.id)
        achievements_out.append({
            "code": ach.code,
            "title": ach.title,
            "description": ach.description,
            "emoji": ach.emoji,
            "category": ach.category.value,
            "threshold": ach.threshold,
            "unlocked": unlocked_at is not None,
            "unlocked_at": unlocked_at.isoformat() if unlocked_at else None,
        })

    return {
        "achievements": achievements_out,
        "unlocked_count": len(unlocked_map),
        "total_count": len(all_achievements),
    }


# ── Daily Challenges ────────────────────────────────────────────────


async def get_daily_challenges(db: AsyncSession, user_id: str) -> list[dict[str, Any]]:
    """
    Generate three daily challenges with real-time progress:
      1. Complete 4 vocab cards
      2. Practice for 15 minutes
      3. Review 10 SRS cards
    """
    today = date.today()

    # Challenge 1: Vocab sessions today
    vocab_q = select(func.count()).where(
        SessionLog.user_id == user_id,
        SessionLog.session_type == SessionType.vocab,
        func.date(SessionLog.created_at) == today,
    )
    vocab_count: int = (await db.execute(vocab_q)).scalar_one()
    vocab_target = 4
    vocab_progress = min(vocab_count / vocab_target, 1.0)

    # Challenge 2: Practice minutes today
    streak_q = select(StreakRecord.minutes_practiced).where(
        StreakRecord.user_id == user_id,
        StreakRecord.date == today,
    )
    today_minutes: int = (await db.execute(streak_q)).scalar_one_or_none() or 0
    minutes_target = 15
    minutes_progress = min(today_minutes / minutes_target, 1.0)

    # Challenge 3: SRS reviews today
    srs_q = select(func.count()).where(
        SRSCard.user_id == user_id,
        SRSCard.next_review > today,
        func.date(SRSCard.updated_at) == today,
        SRSCard.repetitions > 0,
    )
    srs_reviewed: int = (await db.execute(srs_q)).scalar_one()
    srs_target = 10
    srs_progress = min(srs_reviewed / srs_target, 1.0)

    return [
        {
            "id": "daily_vocab",
            "title": "Vocabulary Sprint",
            "description": f"Complete {vocab_target} vocab cards",
            "emoji": "📖",
            "xp_reward": 30,
            "progress": round(vocab_progress, 2),
            "completed": vocab_progress >= 1.0,
        },
        {
            "id": "daily_practice",
            "title": "Dedicated Learner",
            "description": f"Practice for {minutes_target} minutes",
            "emoji": "⏱️",
            "xp_reward": 25,
            "progress": round(minutes_progress, 2),
            "completed": minutes_progress >= 1.0,
        },
        {
            "id": "daily_srs",
            "title": "Memory Master",
            "description": f"Review {srs_target} SRS cards",
            "emoji": "🧠",
            "xp_reward": 35,
            "progress": round(srs_progress, 2),
            "completed": srs_progress >= 1.0,
        },
    ]

"""
Fluent API — 90-Day Curriculum Service.

Manages a structured 90-day English learning syllabus split into three
phases: Foundation (days 1-30), Building (days 31-60), Mastery (days 61-90).
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import CurriculumPhase, UserCurriculumProgress


# ── Weekly activity pattern (0 = Monday … 6 = Sunday) ───────────────

_WEEKDAY_LABELS: dict[int, dict] = {
    0: {  # Monday
        "focus": "New vocab + Grammar",
        "activities": ["vocab_new", "grammar_lesson"],
        "speaking_exercise": "Introduce yourself using new vocabulary",
    },
    1: {  # Tuesday
        "focus": "Review + Quiz + Reading",
        "activities": ["vocab_review", "quiz", "reading"],
        "speaking_exercise": "Read aloud and summarise the passage",
    },
    2: {  # Wednesday
        "focus": "New vocab + Pronunciation",
        "activities": ["vocab_new", "pronunciation"],
        "speaking_exercise": "Practise minimal pairs and intonation",
    },
    3: {  # Thursday
        "focus": "SRS review + Grammar deep-dive",
        "activities": ["srs_review", "grammar_deep_dive"],
        "speaking_exercise": "Explain a grammar rule in your own words",
    },
    4: {  # Friday
        "focus": "New vocab + Speaking + Weekly quiz",
        "activities": ["vocab_new", "speaking", "weekly_quiz"],
        "speaking_exercise": "Give a 2-minute talk on this week's theme",
    },
    5: {  # Saturday
        "focus": "Comprehensive review",
        "activities": ["comprehensive_review"],
        "speaking_exercise": "Role-play a real-world scenario",
    },
    6: {  # Sunday
        "focus": "Free practice / catch-up",
        "activities": ["free_practice"],
        "speaking_exercise": "Free conversation or catch-up on missed lessons",
    },
}


# ── Vocab themes and grammar topics ─────────────────────────────────

_VOCAB_THEMES: list[str] = [
    "daily_life",
    "travel",
    "technology",
    "corporate",
    "academic",
    "medical",
    "legal",
    "finance",
    "science",
    "arts",
]

_GRAMMAR_TOPICS: list[str] = [
    "Present Perfect",
    "Conditionals",
    "Passive Voice",
    "Modals",
    "Relative Clauses",
    "Reported Speech",
    "Articles",
    "Gerunds vs Infinitives",
    "Subjunctive",
    "Phrasal Verbs",
    "Inversion",
    "Cleft Sentences",
]

_READING_LEVELS: dict[str, str] = {
    "foundation": "beginner",
    "building": "intermediate",
    "mastery": "advanced",
}


# ── Curriculum data generation ──────────────────────────────────────


def _build_curriculum() -> list[dict]:
    """Build the full 90-day curriculum data inline.

    Each entry contains:
        day_number, week_number, phase, vocab_theme, grammar_topic,
        reading_level, speaking_exercise, difficulty_level, xp_reward,
        focus, activities.
    """
    data: list[dict] = []
    
    try:
        from app.services.curriculum_data import DAYS
    except ImportError:
        DAYS = {}

    for day in range(1, 91):
        day_data = DAYS.get(day)
        
        # Phase and difficulty defaults
        if day <= 30:
            phase = "foundation"
            difficulty = 1 + int((day - 1) * 3 / 29)
        elif day <= 60:
            phase = "building"
            difficulty = 4 + int((day - 31) * 3 / 29)
        else:
            phase = "mastery"
            difficulty = 7 + int((day - 61) * 3 / 29)

        week_number = (day - 1) // 7 + 1
        weekday = (day - 1) % 7  # 0=Mon in our pattern
        weekday_info = _WEEKDAY_LABELS[weekday]

        if day_data:
            vocab_theme = day_data.get("theme", "daily_life")
            grammar_topic = day_data.get("grammar", {}).get("topic", "Grammar")
            speaking_exercise = day_data.get("speaking_passage", {}).get("title", weekday_info["speaking_exercise"])
            difficulty = day_data.get("difficulty_level", difficulty)
        else:
            vocab_theme = _VOCAB_THEMES[(day - 1) % len(_VOCAB_THEMES)]
            grammar_topic = _GRAMMAR_TOPICS[(day - 1) % len(_GRAMMAR_TOPICS)]
            speaking_exercise = weekday_info["speaking_exercise"]

        reading_level = _READING_LEVELS[phase]
        xp_reward = 80 + difficulty * 10  # 90-180 range

        data.append(
            {
                "day_number": day,
                "week_number": week_number,
                "phase": phase,
                "vocab_theme": vocab_theme,
                "grammar_topic": grammar_topic,
                "reading_level": reading_level,
                "speaking_exercise": speaking_exercise,
                "difficulty_level": difficulty,
                "xp_reward": xp_reward,
                "focus": weekday_info["focus"],
                "activities": weekday_info["activities"],
            }
        )

    return data


CURRICULUM_DATA: list[dict] = _build_curriculum()

# Quick lookup by day_number (1-indexed)
_CURRICULUM_BY_DAY: dict[int, dict] = {d["day_number"]: d for d in CURRICULUM_DATA}


# ── Public API ──────────────────────────────────────────────────────


def get_curriculum_day(day_number: int) -> dict:
    """Return the curriculum specification for a given day (1-90).

    Raises:
        ValueError: If *day_number* is outside the 1-90 range.
    """
    if day_number < 1 or day_number > 90:
        raise ValueError(f"day_number must be 1-90, got {day_number}")
    return _CURRICULUM_BY_DAY[day_number]


async def get_user_today(db: AsyncSession, user_id: str) -> dict:
    """Return the curriculum content the user should work on today.

    Combines the user's current progress with the static curriculum
    data for that day.

    Raises:
        LookupError: If no curriculum progress record exists for the user.
    """
    progress = await _get_progress(db, user_id)

    day_spec = get_curriculum_day(progress.current_day)

    return {
        "current_day": progress.current_day,
        "phase": progress.phase.value if isinstance(progress.phase, CurriculumPhase) else progress.phase,
        "daily_goal_minutes": progress.daily_goal_minutes,
        **day_spec,
    }


async def advance_user(db: AsyncSession, user_id: str) -> dict:
    """Move the user to the next curriculum day.

    Automatically transitions the phase boundary when day crosses 30 or
    60.  If the user is already on day 90, returns the day-90 spec with a
    ``completed`` flag.
    """
    progress = await _get_progress(db, user_id)

    if progress.current_day >= 90:
        day_spec = get_curriculum_day(90)
        return {
            "current_day": 90,
            "phase": progress.phase.value if isinstance(progress.phase, CurriculumPhase) else progress.phase,
            "completed": True,
            **day_spec,
        }

    next_day = progress.current_day + 1
    progress.current_day = next_day

    # Phase transitions
    if next_day <= 30:
        progress.phase = CurriculumPhase.foundation
    elif next_day <= 60:
        progress.phase = CurriculumPhase.building
    else:
        progress.phase = CurriculumPhase.mastery

    await db.flush()

    day_spec = get_curriculum_day(next_day)

    return {
        "current_day": next_day,
        "phase": progress.phase.value,
        "completed": False,
        **day_spec,
    }


async def get_phase_progress(db: AsyncSession, user_id: str) -> dict:
    """Return the user's overall and per-phase progress.

    Keys:
        overall_progress — 0.0 … 1.0 ratio of days completed vs 90.
        phase_progress   — 0.0 … 1.0 ratio within the current 30-day phase.
        current_day      — the day the user is on.
        phase            — current phase name.
        days_remaining   — how many days are left.
    """
    progress = await _get_progress(db, user_id)

    current_day = progress.current_day
    overall = (current_day - 1) / 90  # day 1 = 0% done

    # Per-phase progress (each phase is 30 days)
    if current_day <= 30:
        phase_start = 1
    elif current_day <= 60:
        phase_start = 31
    else:
        phase_start = 61
    phase_progress = (current_day - phase_start) / 30

    return {
        "overall_progress": round(overall, 4),
        "phase_progress": round(phase_progress, 4),
        "current_day": current_day,
        "phase": progress.phase.value if isinstance(progress.phase, CurriculumPhase) else progress.phase,
        "days_remaining": 90 - current_day,
    }


async def initialize_curriculum(db: AsyncSession, user_id: str) -> None:
    """Create a ``UserCurriculumProgress`` record for a new user.

    If the user already has a progress record, this is a silent no-op.
    """
    stmt = select(UserCurriculumProgress).where(
        UserCurriculumProgress.user_id == user_id
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none() is not None:
        return  # already initialised

    now = datetime.now(timezone.utc)
    progress = UserCurriculumProgress(
        user_id=user_id,
        current_day=1,
        phase=CurriculumPhase.foundation,
        started_at=now,
        expected_completion=now + timedelta(days=90),
        daily_goal_minutes=30,
    )
    db.add(progress)
    await db.flush()


# ── Internal helpers ────────────────────────────────────────────────


async def _get_progress(db: AsyncSession, user_id: str) -> UserCurriculumProgress:
    """Fetch the user's curriculum progress or raise ``LookupError``."""
    stmt = select(UserCurriculumProgress).where(
        UserCurriculumProgress.user_id == user_id
    )
    result = await db.execute(stmt)
    progress: UserCurriculumProgress | None = result.scalar_one_or_none()

    if progress is None:
        raise LookupError(
            f"No curriculum progress found for user={user_id}. "
            "Call initialize_curriculum first."
        )
    return progress

"""
Fluent API — Daily Planner Service.

Generates personalised daily learning plans that blend the structured
curriculum with SRS review cards.  Plans are split into morning and
evening sessions to encourage distributed practice.
"""

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import DailyPlan, User, XPSource, XPTransaction
from app.services import curriculum_service, srs_engine


# ── Public API ──────────────────────────────────────────────────────


async def generate_daily_plan(db: AsyncSession, user_id: str) -> dict:
    """Create — or return an existing — daily plan for today.

    The plan is composed of two blocks:

    **Morning tasks** (curriculum-driven):
      1. Pronunciation warm-up (5 min)
      2. Vocabulary lesson on the day's theme (10 min)
      3. Grammar lesson on the day's topic (10 min)

    **Evening tasks** (review-driven):
      1. Morning vocabulary review (5 min)
      2. SRS due-card review (10 min)
      3. Reading practice at the day's level (10 min)

    Each task carries an ``id``, ``type``, ``title``, ``subtitle``,
    ``duration_minutes``, ``xp_reward``, ``completed``, and ``screen``
    field.  The ``screen`` value tells the front-end which screen to
    navigate to: ``'Vocab'``, ``'Grammar'``, ``'Teleprompter'``, or
    ``'Review'``.

    Returns the full plan dict.
    """
    today = date.today()

    # ── Return existing plan if already generated ────────────────────
    existing = await _get_existing_plan(db, user_id, today)
    if existing is not None:
        return _plan_to_dict(existing)

    # ── Gather context ───────────────────────────────────────────────
    try:
        curriculum = await curriculum_service.get_user_today(db, user_id)
    except LookupError:
        # Auto-initialise curriculum on first call
        await curriculum_service.initialize_curriculum(db, user_id)
        curriculum = await curriculum_service.get_user_today(db, user_id)

    due_count = await srs_engine.get_due_count(db, user_id)

    vocab_theme: str = curriculum.get("vocab_theme", "daily_life")
    grammar_topic: str = curriculum.get("grammar_topic", "Present Perfect")
    reading_level: str = curriculum.get("reading_level", "intermediate")
    day_xp: int = curriculum.get("xp_reward", 100)

    # Scale individual task XP so the total roughly equals the day reward
    base_xp = max(10, day_xp // 6)

    # ── Build morning tasks ──────────────────────────────────────────
    morning_tasks: list[dict] = [
        {
            "id": _task_id(),
            "type": "pronunciation",
            "title": "Pronunciation Warm-up",
            "subtitle": "Practise today's sounds and intonation patterns",
            "duration_minutes": 5,
            "xp_reward": base_xp,
            "completed": False,
            "screen": "Teleprompter",
        },
        {
            "id": _task_id(),
            "type": "vocab",
            "title": f"Vocabulary: {_pretty(vocab_theme)}",
            "subtitle": f"Learn new {_pretty(vocab_theme)} words and phrases",
            "duration_minutes": 10,
            "xp_reward": base_xp,
            "completed": False,
            "screen": "Vocab",
            "theme": vocab_theme,
        },
        {
            "id": _task_id(),
            "type": "grammar",
            "title": f"Grammar: {grammar_topic}",
            "subtitle": f"Interactive lesson on {grammar_topic}",
            "duration_minutes": 10,
            "xp_reward": base_xp,
            "completed": False,
            "screen": "Grammar",
            "topic": grammar_topic,
        },
    ]

    # ── Build evening tasks ──────────────────────────────────────────
    srs_subtitle = (
        f"Review {due_count} due card{'s' if due_count != 1 else ''}"
        if due_count > 0
        else "No cards due — great job keeping up!"
    )

    evening_tasks: list[dict] = [
        {
            "id": _task_id(),
            "type": "vocab_review",
            "title": f"Review: {_pretty(vocab_theme)} Vocabulary",
            "subtitle": "Reinforce this morning's new words",
            "duration_minutes": 5,
            "xp_reward": base_xp,
            "completed": False,
            "screen": "Review",
            "theme": vocab_theme,
        },
        {
            "id": _task_id(),
            "type": "srs_review",
            "title": "Spaced Repetition Review",
            "subtitle": srs_subtitle,
            "duration_minutes": 10,
            "xp_reward": base_xp,
            "completed": False,
            "screen": "Review",
        },
        {
            "id": _task_id(),
            "type": "reading",
            "title": "Reading Practice",
            "subtitle": f"Read and comprehend a {reading_level}-level passage",
            "duration_minutes": 10,
            "xp_reward": base_xp,
            "completed": False,
            "screen": "Teleprompter",
            "level": reading_level,
        },
    ]

    total_xp = sum(t["xp_reward"] for t in morning_tasks + evening_tasks)

    plan = DailyPlan(
        user_id=user_id,
        date=today,
        morning_tasks=morning_tasks,
        evening_tasks=evening_tasks,
        total_xp=total_xp,
        completed=False,
    )
    db.add(plan)
    await db.flush()

    return _plan_to_dict(plan)


async def complete_task(
    db: AsyncSession,
    user_id: str,
    task_id: str,
) -> dict:
    """Mark a single task as completed and award its XP.

    Returns a dict with ``task_id``, ``xp_awarded``, ``plan_completed``,
    and ``plan_progress``.

    Raises:
        LookupError: If no plan exists for today or the task_id is invalid.
    """
    today = date.today()
    plan = await _get_existing_plan(db, user_id, today)
    if plan is None:
        raise LookupError("No daily plan found for today. Generate one first.")

    morning: list[dict] = plan.morning_tasks or []
    evening: list[dict] = plan.evening_tasks or []

    task, found_in = _find_task(task_id, morning, evening)
    if task is None:
        raise LookupError(f"Task '{task_id}' not found in today's plan.")

    if task["completed"]:
        # Already completed — return current state without double-awarding
        progress = _calc_progress(morning, evening)
        return {
            "task_id": task_id,
            "xp_awarded": 0,
            "plan_completed": plan.completed,
            "plan_progress": progress,
        }

    # Mark complete
    task["completed"] = True
    xp_awarded: int = task.get("xp_reward", 0)

    # Persist mutated JSON
    if found_in == "morning":
        plan.morning_tasks = morning
    else:
        plan.evening_tasks = evening

    # Check if all tasks are done
    progress = _calc_progress(morning, evening)
    if progress >= 1.0:
        plan.completed = True

    # Award XP to user
    await _award_xp(db, user_id, xp_awarded)

    await db.flush()

    return {
        "task_id": task_id,
        "xp_awarded": xp_awarded,
        "plan_completed": plan.completed,
        "plan_progress": round(progress, 4),
    }


async def get_plan_progress(db: AsyncSession, user_id: str) -> float:
    """Return a 0-1 completion ratio for today's plan.

    Returns 0.0 if no plan has been generated yet.
    """
    today = date.today()
    plan = await _get_existing_plan(db, user_id, today)
    if plan is None:
        return 0.0

    morning: list[dict] = plan.morning_tasks or []
    evening: list[dict] = plan.evening_tasks or []

    return round(_calc_progress(morning, evening), 4)


# ── Internal helpers ────────────────────────────────────────────────


def _task_id() -> str:
    """Generate a short unique task identifier."""
    return uuid.uuid4().hex[:12]


def _pretty(theme: str) -> str:
    """Convert snake_case theme to Title Case."""
    return theme.replace("_", " ").title()


async def _get_existing_plan(
    db: AsyncSession,
    user_id: str,
    target_date: date,
) -> DailyPlan | None:
    """Fetch the daily plan for a specific date, if it exists."""
    stmt = select(DailyPlan).where(
        DailyPlan.user_id == user_id,
        DailyPlan.date == target_date,
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


def _find_task(
    task_id: str,
    morning: list[dict],
    evening: list[dict],
) -> tuple[dict | None, str]:
    """Locate a task by its id across morning and evening lists."""
    for task in morning:
        if task.get("id") == task_id:
            return task, "morning"
    for task in evening:
        if task.get("id") == task_id:
            return task, "evening"
    return None, ""


def _calc_progress(morning: list[dict], evening: list[dict]) -> float:
    """Calculate the fraction of completed tasks."""
    all_tasks = morning + evening
    if not all_tasks:
        return 0.0
    done = sum(1 for t in all_tasks if t.get("completed"))
    return done / len(all_tasks)


def _plan_to_dict(plan: DailyPlan) -> dict:
    """Serialise a DailyPlan ORM instance to a plain dict."""
    morning: list[dict] = plan.morning_tasks or []
    evening: list[dict] = plan.evening_tasks or []
    progress = _calc_progress(morning, evening)

    return {
        "id": plan.id,
        "date": plan.date.isoformat(),
        "morning_tasks": morning,
        "evening_tasks": evening,
        "total_xp": plan.total_xp,
        "completed": plan.completed,
        "progress": round(progress, 4),
    }


async def _award_xp(db: AsyncSession, user_id: str, amount: int) -> None:
    """Credit XP to the user and log the transaction.

    Also handles level-up: each level requires ``level * 500`` XP.
    """
    if amount <= 0:
        return

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user: User | None = result.scalar_one_or_none()
    if user is None:
        return  # silently skip — the caller already validated user_id

    user.xp += amount

    # Level-up check: each level costs level * 500 XP
    while user.xp >= user.xp_level * 500:
        user.xp_level += 1

    # Record the transaction
    tx = XPTransaction(
        user_id=user_id,
        amount=amount,
        source=XPSource.daily_plan,
        description="Daily plan task completed",
    )
    db.add(tx)

"""
Fluent API — Curriculum routes: daily plan, progress, and task completion.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import (
    CurriculumDay,
    CurriculumPhase,
    DailyPlan,
    User,
    UserCurriculumProgress,
)
from app.schemas.learning import (
    CurriculumCompleteRequest,
    CurriculumProgressResponse,
    CurriculumTaskOut,
    CurriculumTodayResponse,
)
from app.services.gamification_service import award_xp

router = APIRouter(prefix="/curriculum", tags=["curriculum"])


# ── Helpers ─────────────────────────────────────────────────────────


def _build_tasks(
    raw: dict | list | None,
    prefix: str,
    curriculum_day: CurriculumDay,
    completed_ids: set[str],
) -> list[CurriculumTaskOut]:
    """
    Convert a JSON task list stored in ``DailyPlan.morning_tasks`` or
    ``evening_tasks`` into typed ``CurriculumTaskOut`` objects.
    """
    if raw is None:
        return _generate_default_tasks(prefix, curriculum_day, completed_ids)

    if isinstance(raw, dict):
        items: list[dict] = raw.get("tasks", [])
    else:
        items = raw  # already a list

    tasks: list[CurriculumTaskOut] = []
    for i, item in enumerate(items):
        task_id = item.get("id", f"{prefix}_{i}")
        tasks.append(CurriculumTaskOut(
            id=task_id,
            type=item.get("type", "general"),
            title=item.get("title", "Task"),
            subtitle=item.get("subtitle", ""),
            duration_minutes=item.get("duration_minutes", 5),
            xp_reward=item.get("xp_reward", curriculum_day.xp_reward // 4),
            completed=task_id in completed_ids,
            screen=item.get("screen", ""),
        ))
    return tasks


_TASK_TEMPLATES = {
    "morning": [
        {"type": "vocab", "title": "Vocabulary Drill", "subtitle": "Learn new words from today's theme", "duration_minutes": 10, "screen": "VocabScreen"},
        {"type": "grammar", "title": "Grammar Lesson", "subtitle": "Study today's grammar topic", "duration_minutes": 10, "screen": "GrammarScreen"},
    ],
    "evening": [
        {"type": "pronunciation", "title": "Pronunciation Practice", "subtitle": "Speak and get feedback", "duration_minutes": 5, "screen": "PronunciationScreen"},
        {"type": "srs", "title": "SRS Review", "subtitle": "Review your spaced-repetition cards", "duration_minutes": 10, "screen": "SRSScreen"},
    ],
}


def _generate_default_tasks(
    prefix: str,
    curriculum_day: CurriculumDay,
    completed_ids: set[str],
) -> list[CurriculumTaskOut]:
    """Generate sensible default tasks when the daily plan has no stored tasks."""
    slot = "morning" if prefix == "morning" else "evening"
    templates = _TASK_TEMPLATES[slot]
    tasks: list[CurriculumTaskOut] = []
    for i, tpl in enumerate(templates):
        task_id = f"{prefix}_{i}"
        subtitle = tpl["subtitle"]
        if slot == "morning" and tpl["type"] == "vocab":
            subtitle = f"{curriculum_day.vocab_theme} — {subtitle}"
        elif slot == "morning" and tpl["type"] == "grammar":
            subtitle = f"{curriculum_day.grammar_topic} — {subtitle}"
        tasks.append(CurriculumTaskOut(
            id=task_id,
            type=tpl["type"],
            title=tpl["title"],
            subtitle=subtitle,
            duration_minutes=tpl["duration_minutes"],
            xp_reward=curriculum_day.xp_reward // len(templates),
            completed=task_id in completed_ids,
            screen=tpl["screen"],
        ))
    return tasks


async def _get_or_create_progress(
    db: AsyncSession, user_id: str,
) -> UserCurriculumProgress:
    """Fetch or initialise curriculum progress for a user."""
    q = select(UserCurriculumProgress).where(
        UserCurriculumProgress.user_id == user_id,
    )
    progress = (await db.execute(q)).scalar_one_or_none()
    if progress is not None:
        return progress

    now = datetime.now(timezone.utc)
    progress = UserCurriculumProgress(
        user_id=user_id,
        current_day=1,
        phase=CurriculumPhase.foundation,
        started_at=now,
        expected_completion=now + timedelta(days=90),
    )
    db.add(progress)
    await db.flush()
    return progress


async def _get_daily_plan(
    db: AsyncSession, user_id: str, plan_date: date,
) -> DailyPlan | None:
    q = select(DailyPlan).where(
        DailyPlan.user_id == user_id,
        DailyPlan.date == plan_date,
    )
    return (await db.execute(q)).scalar_one_or_none()


def _phase_for_day(day: int) -> CurriculumPhase:
    """Determine the curriculum phase from the day number."""
    if day <= 30:
        return CurriculumPhase.foundation
    if day <= 60:
        return CurriculumPhase.building
    return CurriculumPhase.mastery


# ── Routes ──────────────────────────────────────────────────────────


@router.get("/today", response_model=CurriculumTodayResponse)
async def get_today(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CurriculumTodayResponse:
    """Return today's learning plan with all tasks and completion state."""
    progress = await _get_or_create_progress(db, user.id)

    # Fetch the curriculum template for the current day
    day_q = select(CurriculumDay).where(
        CurriculumDay.day_number == progress.current_day,
    )
    curriculum_day = (await db.execute(day_q)).scalar_one_or_none()

    # Fallback for missing curriculum day (e.g. beyond seeded data)
    if curriculum_day is None:
        curriculum_day = CurriculumDay(
            day_number=progress.current_day,
            week_number=(progress.current_day - 1) // 7 + 1,
            phase=_phase_for_day(progress.current_day),
            vocab_theme="Mixed Review",
            grammar_topic="Free Practice",
            difficulty_level=min(progress.current_day // 10 + 1, 10),
            xp_reward=100,
        )

    today = date.today()
    plan = await _get_daily_plan(db, user.id, today)

    # Determine which tasks are already completed
    completed_ids: set[str] = set()
    if plan and plan.morning_tasks and isinstance(plan.morning_tasks, dict):
        for tid in plan.morning_tasks.get("completed", []):
            completed_ids.add(tid)
    if plan and plan.evening_tasks and isinstance(plan.evening_tasks, dict):
        for tid in plan.evening_tasks.get("completed", []):
            completed_ids.add(tid)

    morning = _build_tasks(
        plan.morning_tasks if plan else None,
        "morning",
        curriculum_day,
        completed_ids,
    )
    evening = _build_tasks(
        plan.evening_tasks if plan else None,
        "evening",
        curriculum_day,
        completed_ids,
    )

    all_tasks = morning + evening
    total_xp = sum(t.xp_reward for t in all_tasks)
    completed_xp = sum(t.xp_reward for t in all_tasks if t.completed)
    plan_progress = (completed_xp / total_xp) if total_xp > 0 else 0.0

    return CurriculumTodayResponse(
        day_number=curriculum_day.day_number,
        week_number=curriculum_day.week_number,
        phase=curriculum_day.phase.value if isinstance(curriculum_day.phase, CurriculumPhase) else curriculum_day.phase,
        difficulty_level=curriculum_day.difficulty_level,
        morning_tasks=morning,
        evening_tasks=evening,
        total_xp=total_xp,
        completed_xp=completed_xp,
        plan_progress=round(plan_progress, 2),
    )


@router.get("/progress", response_model=CurriculumProgressResponse)
async def get_progress(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CurriculumProgressResponse:
    """Return the user's position in the 90-day journey."""
    progress = await _get_or_create_progress(db, user.id)

    total_days = 90
    overall = round(progress.current_day / total_days, 2)

    # Phase progress
    phase = _phase_for_day(progress.current_day)
    if phase == CurriculumPhase.foundation:
        phase_progress = round(progress.current_day / 30, 2)
    elif phase == CurriculumPhase.building:
        phase_progress = round((progress.current_day - 30) / 30, 2)
    else:
        phase_progress = round((progress.current_day - 60) / 30, 2)

    return CurriculumProgressResponse(
        current_day=progress.current_day,
        total_days=total_days,
        phase=phase.value,
        phase_progress=min(phase_progress, 1.0),
        overall_progress=min(overall, 1.0),
        started_at=progress.started_at.isoformat(),
        expected_completion=progress.expected_completion.isoformat(),
    )


@router.post("/complete")
async def complete_task(
    body: CurriculumCompleteRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """
    Mark a curriculum task as completed.  Awards XP and, if all tasks
    for the day are done, advances the user to the next day.
    """
    progress = await _get_or_create_progress(db, user.id)
    today = date.today()

    # Fetch or create today's plan
    plan = await _get_daily_plan(db, user.id, today)
    if plan is None:
        plan = DailyPlan(
            user_id=user.id,
            date=today,
            morning_tasks={"tasks": [], "completed": []},
            evening_tasks={"tasks": [], "completed": []},
        )
        db.add(plan)
        await db.flush()

    # Record completion in the appropriate slot
    task_id: str = body.task_id
    already_completed = False

    morning_data = plan.morning_tasks if isinstance(plan.morning_tasks, dict) else {"tasks": [], "completed": []}
    evening_data = plan.evening_tasks if isinstance(plan.evening_tasks, dict) else {"tasks": [], "completed": []}

    if task_id in morning_data.get("completed", []) or task_id in evening_data.get("completed", []):
        already_completed = True

    if not already_completed:
        if task_id.startswith("morning"):
            morning_data.setdefault("completed", []).append(task_id)
            plan.morning_tasks = morning_data
        else:
            evening_data.setdefault("completed", []).append(task_id)
            plan.evening_tasks = evening_data

    db.add(plan)
    await db.flush()

    # Award XP for completing the task
    xp_amount = 25  # base XP per task
    xp_state: dict = {}
    if not already_completed:
        xp_state = await award_xp(
            db, user.id, xp_amount, "daily_plan",
            f"Completed curriculum task: {task_id}",
        )

    # Check if all tasks for the day are done → advance day
    all_completed_ids: set[str] = set(
        morning_data.get("completed", []) + evening_data.get("completed", [])
    )

    # Fetch curriculum day to know expected task count
    day_q = select(CurriculumDay).where(
        CurriculumDay.day_number == progress.current_day,
    )
    curriculum_day = (await db.execute(day_q)).scalar_one_or_none()

    # Expected: 2 morning + 2 evening = 4 tasks by default
    expected_count = 4
    if curriculum_day and curriculum_day.xp_reward:
        # If custom task counts are stored we'd use them, otherwise default to 4
        pass

    day_complete = len(all_completed_ids) >= expected_count

    if day_complete and not plan.completed:
        plan.completed = True
        plan.total_xp = xp_amount * expected_count
        db.add(plan)

        # Advance curriculum day
        progress.current_day = min(progress.current_day + 1, 90)
        progress.phase = _phase_for_day(progress.current_day)
        db.add(progress)
        await db.flush()

    return {
        "task_id": task_id,
        "already_completed": already_completed,
        "day_complete": day_complete,
        "current_day": progress.current_day,
        "xp_awarded": xp_amount if not already_completed else 0,
        "xp_state": xp_state,
    }


@router.post("/set-day")
async def set_active_day(
    day_number: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Set the user's active curriculum day to any day from 1 to 90.
    This allows advanced learners to jump directly to any day or phase.
    """
    if day_number < 1 or day_number > 90:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Day number must be between 1 and 90."
        )
    progress = await _get_or_create_progress(db, user.id)
    progress.current_day = day_number
    progress.phase = _phase_for_day(day_number)
    db.add(progress)
    await db.flush()
    return {
        "success": True,
        "current_day": progress.current_day,
        "phase": progress.phase.value if isinstance(progress.phase, CurriculumPhase) else progress.phase,
    }

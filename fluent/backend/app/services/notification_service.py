"""
Fluent API — Notification service.

Manages push notification scheduling with custom time ranges:
- Morning reminders: 6:00 AM - 11:59 AM (default 8:00 AM)
- Evening reminders: 3:00 PM - 11:59 PM (default 8:00 PM)
"""

from __future__ import annotations

from datetime import datetime, time, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User, UserSettings


# ── Time Validation ─────────────────────────────────────────────────

MORNING_MIN = time(6, 0)    # 6:00 AM
MORNING_MAX = time(11, 59)  # 11:59 AM
EVENING_MIN = time(15, 0)   # 3:00 PM
EVENING_MAX = time(23, 59)  # 11:59 PM


def validate_morning_time(time_str: str) -> bool:
    """Validate that morning time is within 6:00 AM - 11:59 AM."""
    try:
        t = _parse_time(time_str)
        return MORNING_MIN <= t <= MORNING_MAX
    except ValueError:
        return False


def validate_evening_time(time_str: str) -> bool:
    """Validate that evening time is within 3:00 PM - 11:59 PM."""
    try:
        t = _parse_time(time_str)
        return EVENING_MIN <= t <= EVENING_MAX
    except ValueError:
        return False


def _parse_time(time_str: str) -> time:
    """Parse 'HH:MM' string to time object."""
    parts = time_str.strip().split(":")
    if len(parts) != 2:
        raise ValueError(f"Invalid time format: {time_str}")
    return time(int(parts[0]), int(parts[1]))


# ── User Settings Management ───────────────────────────────────────


async def get_user_settings(db: AsyncSession, user_id: str) -> dict[str, Any]:
    """Get or create user notification settings."""
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == user_id)
    )
    settings = result.scalar_one_or_none()

    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        await db.flush()

    return {
        "morning_reminder_time": settings.morning_reminder_time,
        "evening_reminder_time": settings.evening_reminder_time,
        "reminders_enabled": settings.reminders_enabled,
        "daily_goal_minutes": settings.daily_goal_minutes,
        "daily_goal_drills": settings.daily_goal_drills,
        "preferred_themes": settings.preferred_themes or [],
        "gemini_api_key": settings.gemini_api_key,
        "openrouter_api_key": settings.openrouter_api_key,
        "groq_api_key": settings.groq_api_key,
    }


async def update_user_settings(
    db: AsyncSession,
    user_id: str,
    updates: dict[str, Any],
) -> dict[str, Any]:
    """Update user notification settings with validation."""
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == user_id)
    )
    settings = result.scalar_one_or_none()

    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
        await db.flush()

    # Validate and apply morning time
    if "morning_reminder_time" in updates and updates["morning_reminder_time"]:
        time_str = updates["morning_reminder_time"]
        if not validate_morning_time(time_str):
            raise ValueError(
                f"Morning reminder must be between 6:00 AM and 11:59 AM. Got: {time_str}"
            )
        settings.morning_reminder_time = time_str

    # Validate and apply evening time
    if "evening_reminder_time" in updates and updates["evening_reminder_time"]:
        time_str = updates["evening_reminder_time"]
        if not validate_evening_time(time_str):
            raise ValueError(
                f"Evening reminder must be between 3:00 PM and 11:59 PM. Got: {time_str}"
            )
        settings.evening_reminder_time = time_str

    # Apply other settings
    if "reminders_enabled" in updates and updates["reminders_enabled"] is not None:
        settings.reminders_enabled = updates["reminders_enabled"]

    if "daily_goal_minutes" in updates and updates["daily_goal_minutes"] is not None:
        settings.daily_goal_minutes = max(5, min(120, updates["daily_goal_minutes"]))

    if "daily_goal_drills" in updates and updates["daily_goal_drills"] is not None:
        settings.daily_goal_drills = max(1, min(20, updates["daily_goal_drills"]))

    if "preferred_themes" in updates and updates["preferred_themes"] is not None:
        settings.preferred_themes = updates["preferred_themes"]

    if "gemini_api_key" in updates:
        settings.gemini_api_key = updates["gemini_api_key"]

    if "openrouter_api_key" in updates:
        settings.openrouter_api_key = updates["openrouter_api_key"]

    if "groq_api_key" in updates:
        settings.groq_api_key = updates["groq_api_key"]

    await db.flush()

    return await get_user_settings(db, user_id)


# ── Notification Generation ────────────────────────────────────────


def generate_morning_notification(
    user_name: str,
    curriculum_day: int,
    vocab_theme: str,
    grammar_topic: str,
) -> dict[str, str]:
    """Generate morning learning notification content."""
    first_name = user_name.split(" ")[0]
    return {
        "title": f"Good morning, {first_name}! 🌅",
        "body": (
            f"Day {curriculum_day} of your journey. "
            f"Today: {vocab_theme.replace('_', ' ').title()} Vocab + {grammar_topic}. "
            f"Let's go!"
        ),
        "type": "morning_learn",
    }


def generate_srs_reminder(due_count: int) -> dict[str, str]:
    """Generate SRS review reminder."""
    return {
        "title": "Quick review time! ☀️",
        "body": (
            f"You have {due_count} words due for review. "
            f"5 minutes keeps the streak alive."
        ),
        "type": "srs_reminder",
    }


def generate_evening_notification(
    user_name: str,
    due_count: int,
) -> dict[str, str]:
    """Generate evening review notification."""
    first_name = user_name.split(" ")[0]
    return {
        "title": f"Evening review time, {first_name}! 🌙",
        "body": (
            f"Let's reinforce what you learned this morning. "
            f"{due_count} cards waiting for review."
        ),
        "type": "evening_review",
    }


def generate_streak_protection(
    streak_days: int,
) -> dict[str, str]:
    """Generate streak protection alert."""
    return {
        "title": f"⚠️ Don't break your {streak_days}-day streak!",
        "body": "Just 3 minutes of practice to keep it going. You've come too far to stop now!",
        "type": "streak_protection",
    }


def generate_weekly_summary(
    user_name: str,
    weekly_minutes: int,
    words_mastered: int,
    streak_days: int,
) -> dict[str, str]:
    """Generate weekly progress summary."""
    first_name = user_name.split(" ")[0]
    return {
        "title": f"Your weekly report, {first_name}! 📊",
        "body": (
            f"This week: {weekly_minutes} minutes practiced, "
            f"{words_mastered} words mastered, "
            f"{streak_days}-day streak. Keep it up! 🔥"
        ),
        "type": "weekly_summary",
    }


# ── Schedule Helpers ───────────────────────────────────────────────


def get_notification_schedule(settings: dict) -> list[dict]:
    """Return the notification schedule for the user as a list of scheduled events."""
    if not settings.get("reminders_enabled", True):
        return []

    schedule = []

    # Morning learning reminder
    schedule.append({
        "time": settings.get("morning_reminder_time", "08:00"),
        "type": "morning_learn",
        "enabled": True,
    })

    # Midday SRS reminder (2 hours after morning)
    morning = _parse_time(settings.get("morning_reminder_time", "08:00"))
    midday_hour = min(morning.hour + 4, 14)
    schedule.append({
        "time": f"{midday_hour:02d}:00",
        "type": "srs_reminder",
        "enabled": True,
    })

    # Evening review reminder
    schedule.append({
        "time": settings.get("evening_reminder_time", "20:00"),
        "type": "evening_review",
        "enabled": True,
    })

    # Streak protection (1.5 hours after evening, if no activity)
    evening = _parse_time(settings.get("evening_reminder_time", "20:00"))
    protection_hour = min(evening.hour + 1, 23)
    protection_minute = 30 if evening.minute < 30 else 0
    schedule.append({
        "time": f"{protection_hour:02d}:{protection_minute:02d}",
        "type": "streak_protection",
        "enabled": True,
        "conditional": True,  # Only send if no activity today
    })

    return schedule

"""
Fluent API — Article / teleprompter endpoints.
"""

from __future__ import annotations

import random

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import User
from app.schemas.learning import ArticleResponse
from app.services.content_service import generate_article

router = APIRouter(prefix="/articles", tags=["articles"])

_TOPICS = [
    "morning routines for peak productivity",
    "staying motivated when learning something new",
    "how to handle daily life stress with mindfulness",
    "expressing gratitude in daily conversations",
    "overcoming fear of speaking in daily life",
    "the power of small positive daily habits",
    "how to stay positive when facing failures",
    "building confidence in daily conversations",
    "handling difficult conversations at work or home",
    "setting and achieving daily goals with focus",
    "the art of active listening in relationships",
    "finding balance between screen time and real life",
    "motivational strategies to beat procrastination",
    "the importance of daily physical activity and mindset",
    "nurturing self-compassion and mental strength daily"
]


@router.get("/random", response_model=ArticleResponse)
async def random_article(
    level: str = Query("advanced", pattern="^(beginner|intermediate|advanced)$"),
    day: int | None = None,
    type: str = Query("pronunciation", pattern="^(pronunciation|reading)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a teleprompter article or pronunciation passage based on the daily plan and task type."""
    from app.services.daily_planner import _get_existing_plan
    from app.db.models import ContentItem
    from zoneinfo import ZoneInfo
    from sqlalchemy import select
    from datetime import datetime, timezone
    
    # Resolve user local today date
    tz_str = current_user.timezone or "UTC"
    try:
        user_tz = ZoneInfo(tz_str)
    except Exception:
        user_tz = timezone.utc
    now_local = datetime.now(timezone.utc).astimezone(user_tz)
    today = now_local.date()
    
    plan = await _get_existing_plan(db, current_user.id, today)
    
    item = None
    if plan and day is not None and day > 0:
        if type == "pronunciation":
            target_task = None
            for t in (plan.morning_tasks or []):
                if t.get("type") == "pronunciation":
                    target_task = t
                    break
            if target_task and target_task.get("content_ids"):
                item_id = target_task.get("content_ids")[0]
                stmt = select(ContentItem).where(ContentItem.id == item_id)
                res = await db.execute(stmt)
                item = res.scalar_one_or_none()
        elif type == "reading":
            target_task = None
            for t in (plan.evening_tasks or []):
                if t.get("type") == "reading":
                    target_task = t
                    break
            if target_task and target_task.get("content_ids"):
                item_id = target_task.get("content_ids")[0]
                stmt = select(ContentItem).where(ContentItem.id == item_id)
                res = await db.execute(stmt)
                item = res.scalar_one_or_none()

    if item:
        payload = item.payload
        if item.type == "pronunciation":
            return ArticleResponse(
                title="Pronunciation Warm-up",
                content=payload.get("sentence"),
                word_count=len(payload.get("sentence", "").split()),
                explanation=payload.get("tip", "Focus phonemes: " + ", ".join(payload.get("focus_phonemes", [])))
            )
        else:  # reading
            return ArticleResponse(
                title=payload.get("title"),
                content=payload.get("body"),
                word_count=len(payload.get("body", "").split()),
                explanation=payload.get("explanation", "Read the text carefully and practice your pacing.")
            )

    # Fallback to random/sequential generation if not found or if day <= 0 (new text refresh)
    if type == "pronunciation":
        # Select a random pronunciation item from the database
        from sqlalchemy import func
        stmt = select(ContentItem).where(ContentItem.type == "pronunciation").order_by(func.random()).limit(1)
        res = await db.execute(stmt)
        rand_item = res.scalar_one_or_none()
        if rand_item:
            payload = rand_item.payload
            return ArticleResponse(
                title="Pronunciation Practice",
                content=payload.get("sentence"),
                word_count=len(payload.get("sentence", "").split()),
                explanation=payload.get("tip", "Focus phonemes: " + ", ".join(payload.get("focus_phonemes", [])))
            )

    if day is None:
        from app.services.curriculum_service import _get_progress
        try:
            progress = await _get_progress(db, current_user.id)
            day = progress.current_day
        except Exception:
            day = 1

    if day <= 0:
        topic = random.choice(_TOPICS)
        data = await generate_article(topic, level, day=None)
    else:
        topic_index = (day - 1) % len(_TOPICS)
        topic = _TOPICS[topic_index]
        data = await generate_article(topic, level, day=day)
        
    return ArticleResponse(**data)

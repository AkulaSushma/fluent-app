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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a teleprompter article sequentially based on day to avoid repetitions.
    
    If day is not specified, defaults to the user's current curriculum day.
    If day <= 0 is passed, returns a random choice (used for manual 'New Text' refreshes).
    """
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

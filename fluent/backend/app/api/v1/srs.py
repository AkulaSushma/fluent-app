"""
Fluent API — SRS (Spaced Repetition System) routes.
"""

from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import SRSCard, User
from app.schemas.learning import SRSDueResponse, SRSCardOut, SRSReviewRequest, SRSStatsResponse

router = APIRouter(prefix="/srs", tags=["srs"])


# ── SM-2 Algorithm ──────────────────────────────────────────────────


def _sm2_update(
    quality: int,
    repetitions: int,
    ease_factor: float,
    interval_days: int,
) -> tuple[int, float, int]:
    """
    Apply the SM-2 spaced-repetition algorithm.

    Returns ``(new_repetitions, new_ease_factor, new_interval_days)``.
    """
    if quality < 3:
        # Failed — reset to learning phase
        return 0, max(ease_factor - 0.2, 1.3), 1

    # Successful recall
    if repetitions == 0:
        new_interval = 1
    elif repetitions == 1:
        new_interval = 6
    else:
        new_interval = round(interval_days * ease_factor)

    new_ef = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ef = max(new_ef, 1.3)

    return repetitions + 1, round(new_ef, 2), new_interval


# ── Routes ──────────────────────────────────────────────────────────


@router.get("/due", response_model=SRSDueResponse)
async def get_due(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SRSDueResponse:
    """Return SRS cards that are due for review today (or overdue)."""
    today = date.today()

    q = (
        select(SRSCard)
        .where(
            SRSCard.user_id == user.id,
            SRSCard.next_review <= today,
        )
        .order_by(SRSCard.next_review.asc())
        .limit(limit)
    )
    cards = (await db.execute(q)).scalars().all()

    count_q = select(func.count()).where(
        SRSCard.user_id == user.id,
        SRSCard.next_review <= today,
    )
    total_due: int = (await db.execute(count_q)).scalar_one()

    return SRSDueResponse(
        cards=[
            SRSCardOut(
                id=c.id,
                word=c.word,
                card_type=c.card_type.value,
                ease_factor=c.ease_factor,
                interval_days=c.interval_days,
                repetitions=c.repetitions,
                next_review=c.next_review.isoformat(),
                last_quality=c.last_quality,
            )
            for c in cards
        ],
        total_due=total_due,
    )


@router.post("/review")
async def review(
    body: SRSReviewRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """
    Submit a review result for a card.  ``quality`` is 0-5 (SM-2 scale:
    0 = complete blank, 5 = perfect recall).
    """
    q = select(SRSCard).where(
        SRSCard.user_id == user.id,
        SRSCard.word == body.word,
    )
    card = (await db.execute(q)).scalar_one_or_none()
    if card is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"SRS card not found for word: {body.word}",
        )

    new_reps, new_ef, new_interval = _sm2_update(
        quality=body.quality,
        repetitions=card.repetitions,
        ease_factor=card.ease_factor,
        interval_days=card.interval_days,
    )

    card.repetitions = new_reps
    card.ease_factor = new_ef
    card.interval_days = new_interval
    card.last_quality = body.quality
    card.next_review = date.today() + timedelta(days=new_interval)
    db.add(card)
    await db.flush()

    return {
        "word": card.word,
        "ease_factor": card.ease_factor,
        "interval_days": card.interval_days,
        "repetitions": card.repetitions,
        "next_review": card.next_review.isoformat(),
    }


@router.get("/stats", response_model=SRSStatsResponse)
async def stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SRSStatsResponse:
    """Return aggregate SRS statistics for the current user."""
    today = date.today()

    total_q = select(func.count()).where(SRSCard.user_id == user.id)
    total_cards: int = (await db.execute(total_q)).scalar_one()

    due_q = select(func.count()).where(
        SRSCard.user_id == user.id,
        SRSCard.next_review <= today,
    )
    due_today: int = (await db.execute(due_q)).scalar_one()

    # "Mastered" = interval ≥ 21 days (graduated)
    mastered_q = select(func.count()).where(
        SRSCard.user_id == user.id,
        SRSCard.interval_days >= 21,
    )
    mastered: int = (await db.execute(mastered_q)).scalar_one()

    # "Learning" = at least 1 repetition but not yet mastered
    learning_q = select(func.count()).where(
        SRSCard.user_id == user.id,
        SRSCard.repetitions > 0,
        SRSCard.interval_days < 21,
    )
    learning: int = (await db.execute(learning_q)).scalar_one()

    new_cards = total_cards - mastered - learning

    return SRSStatsResponse(
        total_cards=total_cards,
        due_today=due_today,
        mastered=mastered,
        learning=learning,
        new=new_cards,
    )

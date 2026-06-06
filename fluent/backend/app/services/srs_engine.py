"""
Fluent API — SM-2 Spaced Repetition Engine.

Implements the SuperMemo SM-2 algorithm for scheduling vocabulary,
grammar, and phrase review cards.
"""

from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import SRSCard, CardType


async def review_card(
    db: AsyncSession,
    user_id: str,
    word: str,
    quality: int,
) -> dict:
    """Update a card based on the user's self-reported review quality (0-5).

    SM-2 algorithm:
      • quality >= 3 → successful recall: repetitions++, interval grows by EF.
      • quality <  3 → lapse: repetitions reset to 0, interval reset to 1.
      • EF = max(1.3, EF + 0.1 − (5−q)×(0.08 + (5−q)×0.02))

    Returns the updated card state dict.

    Raises:
        ValueError: If quality is not in the 0-5 range.
        LookupError: If no card exists for the given user/word.
    """
    if not 0 <= quality <= 5:
        raise ValueError(f"Quality must be 0-5, got {quality}")

    stmt = select(SRSCard).where(
        SRSCard.user_id == user_id,
        SRSCard.word == word,
    )
    result = await db.execute(stmt)
    card: SRSCard | None = result.scalar_one_or_none()

    if card is None:
        raise LookupError(f"No SRS card found for user={user_id}, word='{word}'")

    # ── SM-2 ease-factor adjustment ──────────────────────────────────
    ef = card.ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    ef = max(1.3, ef)

    if quality >= 3:
        # Successful recall
        if card.repetitions == 0:
            interval = 1
        elif card.repetitions == 1:
            interval = 6
        else:
            interval = round(card.interval_days * ef)
        card.repetitions += 1
    else:
        # Lapse — restart learning
        card.repetitions = 0
        interval = 1

    card.ease_factor = ef
    card.interval_days = interval
    card.next_review = date.today() + timedelta(days=interval)
    card.last_quality = quality

    await db.flush()

    return {
        "word": card.word,
        "card_type": card.card_type.value if isinstance(card.card_type, CardType) else card.card_type,
        "ease_factor": round(card.ease_factor, 4),
        "interval_days": card.interval_days,
        "repetitions": card.repetitions,
        "next_review": card.next_review.isoformat(),
        "last_quality": card.last_quality,
    }


async def get_due_cards(
    db: AsyncSession,
    user_id: str,
    limit: int = 20,
) -> list[dict]:
    """Return cards whose next_review date is today or earlier.

    Results are ordered by next_review ASC (oldest overdue first), capped
    at *limit*.
    """
    stmt = (
        select(SRSCard)
        .where(
            SRSCard.user_id == user_id,
            SRSCard.next_review <= date.today(),
        )
        .order_by(SRSCard.next_review.asc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    cards: list[SRSCard] = list(result.scalars().all())

    return [
        {
            "id": card.id,
            "word": card.word,
            "card_type": card.card_type.value if isinstance(card.card_type, CardType) else card.card_type,
            "ease_factor": round(card.ease_factor, 4),
            "interval_days": card.interval_days,
            "repetitions": card.repetitions,
            "next_review": card.next_review.isoformat(),
            "last_quality": card.last_quality,
        }
        for card in cards
    ]


async def get_due_count(db: AsyncSession, user_id: str) -> int:
    """Return the number of cards due for review today or earlier."""
    stmt = (
        select(func.count())
        .select_from(SRSCard)
        .where(
            SRSCard.user_id == user_id,
            SRSCard.next_review <= date.today(),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one()


async def add_card(
    db: AsyncSession,
    user_id: str,
    word: str,
    card_type: str = "vocab",
) -> None:
    """Create a new SRS card for the user.

    If a card with the same user_id + word already exists the call is a
    silent no-op so callers don't need to guard against duplicates.

    Raises:
        ValueError: If *card_type* is not a valid CardType value.
    """
    try:
        ct = CardType(card_type)
    except ValueError:
        raise ValueError(
            f"Invalid card_type '{card_type}'. "
            f"Must be one of: {', '.join(t.value for t in CardType)}"
        )

    # Check for existing card
    stmt = select(SRSCard.id).where(
        SRSCard.user_id == user_id,
        SRSCard.word == word,
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none() is not None:
        return  # card already exists — nothing to do

    card = SRSCard(
        user_id=user_id,
        word=word,
        card_type=ct,
        ease_factor=2.5,
        interval_days=0,
        repetitions=0,
        next_review=date.today(),
        last_quality=0,
    )
    db.add(card)
    await db.flush()


async def get_srs_stats(db: AsyncSession, user_id: str) -> dict:
    """Return aggregate SRS statistics for the user.

    Keys:
        total_cards  — total number of SRS cards.
        due_today    — cards due for review today or earlier.
        mastered     — cards with interval_days > 21.
        learning     — cards with interval_days between 1 and 21 inclusive.
        new          — cards with interval_days == 0 (never reviewed).
    """
    base = select(SRSCard).where(SRSCard.user_id == user_id)

    total_stmt = select(func.count()).select_from(base.subquery())
    due_stmt = (
        select(func.count())
        .select_from(SRSCard)
        .where(
            SRSCard.user_id == user_id,
            SRSCard.next_review <= date.today(),
        )
    )
    mastered_stmt = (
        select(func.count())
        .select_from(SRSCard)
        .where(SRSCard.user_id == user_id, SRSCard.interval_days > 21)
    )
    learning_stmt = (
        select(func.count())
        .select_from(SRSCard)
        .where(
            SRSCard.user_id == user_id,
            SRSCard.interval_days >= 1,
            SRSCard.interval_days <= 21,
        )
    )
    new_stmt = (
        select(func.count())
        .select_from(SRSCard)
        .where(SRSCard.user_id == user_id, SRSCard.interval_days == 0)
    )

    total = (await db.execute(total_stmt)).scalar_one()
    due_today = (await db.execute(due_stmt)).scalar_one()
    mastered = (await db.execute(mastered_stmt)).scalar_one()
    learning = (await db.execute(learning_stmt)).scalar_one()
    new = (await db.execute(new_stmt)).scalar_one()

    return {
        "total_cards": total,
        "due_today": due_today,
        "mastered": mastered,
        "learning": learning,
        "new": new,
    }

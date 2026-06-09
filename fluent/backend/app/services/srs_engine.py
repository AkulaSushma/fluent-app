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
    """Update a card utilizing the FSRS Spaced Repetition algorithm based on rating quality (0-5)."""
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

    from app.services.fsrs import calculate_next_review
    from datetime import datetime, timezone

    # Map quality (0-5) to FSRS grade (0-3)
    fsrs_grade = 0
    if quality == 3:
        fsrs_grade = 1
    elif quality == 4:
        fsrs_grade = 2
    elif quality >= 5:
        fsrs_grade = 3

    # Calculate last reviewed datetime
    last_reviewed = None
    if card.repetitions > 0:
        last_reviewed = datetime.combine(
            card.next_review - timedelta(days=card.interval_days),
            datetime.min.time()
        ).replace(tzinfo=timezone.utc)

    current_time = datetime.now(timezone.utc)

    # Load existing difficulty & stability
    stability = card.fsrs_stability if card.fsrs_stability is not None else 2.5
    difficulty = card.fsrs_difficulty if card.fsrs_difficulty is not None else 5.0

    new_stability, new_difficulty, due_at = calculate_next_review(
        stability=stability,
        difficulty=difficulty,
        grade=fsrs_grade,
        last_reviewed=last_reviewed,
        current_time=current_time
    )

    interval = max(1, round(new_stability))

    # Update card state
    card.fsrs_state = 2 if quality >= 3 else 3 # 2: review, 3: relearning
    card.fsrs_stability = new_stability
    card.fsrs_difficulty = new_difficulty
    card.interval_days = interval
    card.repetitions = card.repetitions + 1 if quality >= 3 else 0
    card.next_review = date.today() + timedelta(days=interval)
    card.last_quality = quality

    # Update ease_factor for SM-2 fallback visibility
    card.ease_factor = new_stability / max(1, card.repetitions)

    await db.flush()

    return {
        "word": card.word,
        "card_type": card.card_type.value if isinstance(card.card_type, CardType) else card.card_type,
        "ease_factor": round(card.ease_factor, 4),
        "interval_days": card.interval_days,
        "repetitions": card.repetitions,
        "next_review": card.next_review.isoformat(),
        "last_quality": card.last_quality,
        "fsrs_state": card.fsrs_state,
        "fsrs_stability": round(card.fsrs_stability, 4),
        "fsrs_difficulty": round(card.fsrs_difficulty, 4),
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
        fsrs_state=0,
        fsrs_stability=2.5,
        fsrs_difficulty=5.0,
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

"""
Fluent API — Spaced Repetition Scheduler.

Implements the Ebbinghaus forgetting curve strategy for curriculum review.
When a topic is learned on Day N, it is scheduled for review at:
  - Day N+2  (Review #1 — Day 3 check-in)
  - Day N+6  (Review #2 — Day 7 check-in)
  - Day N+13 (Review #3 — Day 14 check-in)
  - Day N+29 (Review #4 — Day 30 check-in)

Spaced repetition applies ONLY to Vocabulary, Grammar, and Corporate Phrases.
Pronunciation, Speaking Passages, and Reading Articles always get fresh content.
"""

from __future__ import annotations

from dataclasses import dataclass

# The intervals (in days after learning) at which reviews are triggered.
SRS_INTERVALS: list[int] = [2, 6, 13, 29]

# Human-readable labels and motivational messages for each review stage.
SRS_LABELS: dict[int, dict[str, str | int]] = {
    2: {
        "review_number": 1,
        "label": "Day 3 check-in",
        "emoji": "🔄",
        "message": "You learned this 2 days ago. Quick refresh to lock it in!",
    },
    6: {
        "review_number": 2,
        "label": "Day 7 check-in",
        "emoji": "🧠",
        "message": "It's been 6 days. How much do you still remember?",
    },
    13: {
        "review_number": 3,
        "label": "Day 14 check-in",
        "emoji": "💪",
        "message": "13 days since you learned this. Strengthen the memory!",
    },
    29: {
        "review_number": 4,
        "label": "Day 30 check-in",
        "emoji": "🔒",
        "message": "Final review! 29 days ago. Lock this knowledge in forever!",
    },
}


@dataclass
class ReviewItem:
    """A single spaced-repetition review entry for the daily plan."""

    learned_on_day: int
    review_number: int
    label: str
    emoji: str
    message: str
    interval_days: int


def get_reviews_for_day(current_day: int, max_day: int = 90) -> list[ReviewItem]:
    """Return all spaced-repetition reviews due on *current_day*.

    Parameters
    ----------
    current_day:
        The user's current curriculum day (1-based).
    max_day:
        The total number of curriculum days (default 90).

    Returns
    -------
    A list of :class:`ReviewItem` objects sorted by review_number (most
    recent learning first).  Returns an empty list for Day 1 and Day 2
    (nothing to review yet).
    """
    reviews: list[ReviewItem] = []

    for interval in SRS_INTERVALS:
        learned_day = current_day - interval
        if 1 <= learned_day <= max_day:
            meta = SRS_LABELS[interval]
            reviews.append(
                ReviewItem(
                    learned_on_day=learned_day,
                    review_number=int(meta["review_number"]),
                    label=str(meta["label"]),
                    emoji=str(meta["emoji"]),
                    message=str(meta["message"]),
                    interval_days=interval,
                )
            )

    # Sort by review number ascending (Review #1 first)
    reviews.sort(key=lambda r: r.review_number)
    return reviews


def get_review_content(current_day: int) -> list[dict]:
    """Return review items enriched with content from the curriculum data.

    Each returned dict includes:
      - learned_on_day, review_number, label, emoji, message
      - theme (from the learned day)
      - vocab_review (condensed vocab quiz)
      - grammar_review (condensed grammar exercise)
      - corporate_review (weak→strong phrase pairs)
      - key_takeaway
    """
    from app.services.curriculum_data import DAYS

    reviews = get_reviews_for_day(current_day)
    enriched: list[dict] = []

    for r in reviews:
        day_data = DAYS.get(r.learned_on_day)
        if day_data is None:
            continue

        review_block = day_data.get("review", {})
        enriched.append({
            "learned_on_day": r.learned_on_day,
            "review_number": r.review_number,
            "label": r.label,
            "emoji": r.emoji,
            "message": r.message,
            "interval_days": r.interval_days,
            "theme": day_data.get("theme", f"Day {r.learned_on_day}"),
            "vocab_review": review_block.get("vocab_quiz", []),
            "grammar_review": review_block.get("grammar_fill", []),
            "corporate_review": review_block.get("corporate_review", []),
            "key_takeaway": review_block.get("key_takeaway", ""),
        })

    return enriched

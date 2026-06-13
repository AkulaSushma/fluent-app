"""
Fluent API — Grammar endpoints.

Premium Grammar Engine with topic browsing, rich lessons,
quiz submission with progress tracking, and XP integration.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models import User, GrammarProgress
from app.schemas.learning import (
    GrammarLessonRequest,
    GrammarLessonResponse,
    GrammarTopicsResponse,
    GrammarCategoryOut,
    GrammarTopicOut,
    GrammarQuizSubmission,
    GrammarQuizResult,
)
from app.services.content_service import generate_grammar_lesson
from app.services.cache import cache_get, cache_set, make_key

router = APIRouter(prefix="/grammar", tags=["grammar"])


# ── Topic curriculum structure ───────────────────────────────────────

_LEVEL_LABELS = {1: "Foundation", 2: "Intermediate", 3: "Advanced", 4: "Pro"}

_CATEGORIES = [
    {"id": "tenses", "label": "Tenses & Time", "emoji": "⏳"},
    {"id": "structure", "label": "Sentence Structure", "emoji": "🧩"},
    {"id": "word_classes", "label": "Word Classes", "emoji": "📦"},
    {"id": "complex", "label": "Complex Constructions", "emoji": "🏗️"},
    {"id": "connectors", "label": "Connectors & Flow", "emoji": "🔗"},
    {"id": "style", "label": "Style & Register", "emoji": "🎭"},
]

_TOPICS = [
    # ── Tenses & Time ─────────────────────────────────────────
    {"id": "present_simple_vs_continuous", "title": "Present Simple vs Continuous", "level": 1, "category": "tenses", "prerequisites": []},
    {"id": "past_simple_vs_continuous", "title": "Past Simple vs Continuous", "level": 1, "category": "tenses", "prerequisites": []},
    {"id": "present_perfect_vs_past_simple", "title": "Present Perfect vs Past Simple", "level": 2, "category": "tenses", "prerequisites": ["present_simple_vs_continuous", "past_simple_vs_continuous"]},
    {"id": "past_perfect", "title": "Past Perfect", "level": 2, "category": "tenses", "prerequisites": ["past_simple_vs_continuous"]},
    {"id": "future_perfect", "title": "Future Perfect", "level": 3, "category": "tenses", "prerequisites": ["present_perfect_vs_past_simple"]},
    {"id": "mixed_tenses", "title": "Mixed Tenses in Context", "level": 3, "category": "tenses", "prerequisites": ["present_perfect_vs_past_simple", "past_perfect"]},
    {"id": "future_perfect_continuous", "title": "Future Perfect Continuous", "level": 4, "category": "tenses", "prerequisites": ["future_perfect"]},
    {"id": "narrative_tenses", "title": "Narrative Tenses", "level": 4, "category": "tenses", "prerequisites": ["mixed_tenses"]},

    # ── Sentence Structure ────────────────────────────────────
    {"id": "svo_order", "title": "Subject-Verb-Object Order", "level": 1, "category": "structure", "prerequisites": []},
    {"id": "there_is_are", "title": "There is / There are", "level": 1, "category": "structure", "prerequisites": []},
    {"id": "passive_voice", "title": "Passive Voice", "level": 2, "category": "structure", "prerequisites": ["svo_order"]},
    {"id": "question_tags", "title": "Question Tags", "level": 2, "category": "structure", "prerequisites": ["svo_order"]},
    {"id": "relative_clauses", "title": "Relative Clauses", "level": 3, "category": "structure", "prerequisites": ["passive_voice"]},
    {"id": "cleft_sentences", "title": "Cleft Sentences", "level": 3, "category": "structure", "prerequisites": ["relative_clauses"]},
    {"id": "inversion", "title": "Inversion for Emphasis", "level": 4, "category": "structure", "prerequisites": ["cleft_sentences"]},

    # ── Word Classes ──────────────────────────────────────────
    {"id": "articles", "title": "Articles (a / an / the)", "level": 1, "category": "word_classes", "prerequisites": []},
    {"id": "prepositions_time_place", "title": "Prepositions of Time & Place", "level": 1, "category": "word_classes", "prerequisites": []},
    {"id": "modal_verbs", "title": "Modal Verbs", "level": 2, "category": "word_classes", "prerequisites": ["articles"]},
    {"id": "adjective_order", "title": "Adjective Order", "level": 2, "category": "word_classes", "prerequisites": ["articles"]},
    {"id": "gerunds_vs_infinitives", "title": "Gerunds vs Infinitives", "level": 3, "category": "word_classes", "prerequisites": ["modal_verbs"]},
    {"id": "comparative_superlative", "title": "Comparative & Superlative", "level": 3, "category": "word_classes", "prerequisites": ["adjective_order"]},
    {"id": "advanced_determiners", "title": "Advanced Determiners", "level": 4, "category": "word_classes", "prerequisites": ["gerunds_vs_infinitives"]},

    # ── Complex Constructions ─────────────────────────────────
    {"id": "conditionals_0_1", "title": "Basic Conditionals (Zero & First)", "level": 1, "category": "complex", "prerequisites": []},
    {"id": "imperative_mood", "title": "Imperative Mood", "level": 1, "category": "complex", "prerequisites": []},
    {"id": "conditional_type_2", "title": "Conditional Type 2", "level": 2, "category": "complex", "prerequisites": ["conditionals_0_1"]},
    {"id": "reported_speech_basics", "title": "Reported Speech Basics", "level": 2, "category": "complex", "prerequisites": ["svo_order"]},
    {"id": "mixed_conditionals", "title": "Mixed Conditionals", "level": 3, "category": "complex", "prerequisites": ["conditional_type_2"]},
    {"id": "subjunctive_mood", "title": "Subjunctive Mood", "level": 3, "category": "complex", "prerequisites": ["conditional_type_2"]},
    {"id": "advanced_reported_speech", "title": "Advanced Reported Speech", "level": 4, "category": "complex", "prerequisites": ["reported_speech_basics", "mixed_conditionals"]},

    # ── Connectors & Flow ─────────────────────────────────────
    {"id": "basic_conjunctions", "title": "Basic Conjunctions (and, but, or, so)", "level": 1, "category": "connectors", "prerequisites": []},
    {"id": "subordinating_conjunctions", "title": "Subordinating Conjunctions", "level": 2, "category": "connectors", "prerequisites": ["basic_conjunctions"]},
    {"id": "purpose_reason", "title": "Purpose & Reason Clauses", "level": 2, "category": "connectors", "prerequisites": ["basic_conjunctions"]},
    {"id": "discourse_markers", "title": "Discourse Markers", "level": 3, "category": "connectors", "prerequisites": ["subordinating_conjunctions"]},
    {"id": "concession_contrast", "title": "Concession & Contrast", "level": 3, "category": "connectors", "prerequisites": ["subordinating_conjunctions"]},
    {"id": "advanced_cohesion", "title": "Advanced Cohesion", "level": 4, "category": "connectors", "prerequisites": ["discourse_markers", "concession_contrast"]},

    # ── Style & Register ──────────────────────────────────────
    {"id": "formal_vs_informal", "title": "Formal vs Informal Basics", "level": 1, "category": "style", "prerequisites": []},
    {"id": "phrasal_verbs", "title": "Phrasal Verbs", "level": 2, "category": "style", "prerequisites": ["formal_vs_informal"]},
    {"id": "hedging_softening", "title": "Hedging & Softening", "level": 2, "category": "style", "prerequisites": ["formal_vs_informal"]},
    {"id": "nominalisation", "title": "Nominalisation", "level": 3, "category": "style", "prerequisites": ["hedging_softening"]},
    {"id": "emphasis_techniques", "title": "Emphasis Techniques", "level": 3, "category": "style", "prerequisites": ["phrasal_verbs"]},
    {"id": "academic_register", "title": "Academic Register", "level": 4, "category": "style", "prerequisites": ["nominalisation", "emphasis_techniques"]},
]

# Build lookup maps
_TOPIC_BY_ID = {t["id"]: t for t in _TOPICS}


# ── Endpoints ────────────────────────────────────────────────────────


@router.get("/topics", response_model=GrammarTopicsResponse)
async def get_grammar_topics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all grammar topics organized by category with user progress."""
    # Fetch user's grammar progress
    result = await db.execute(
        select(GrammarProgress).where(GrammarProgress.user_id == current_user.id)
    )
    progress_records = {p.topic: p for p in result.scalars().all()}

    # Determine completed topic IDs for prerequisite checking
    completed_ids = {
        topic_id for topic_id, p in progress_records.items() if p.completed
    }

    categories_out: list[GrammarCategoryOut] = []
    total_topics = 0
    topics_completed = 0
    mastery_sum = 0.0

    for cat_def in _CATEGORIES:
        cat_topics = [t for t in _TOPICS if t["category"] == cat_def["id"]]
        topic_outs: list[GrammarTopicOut] = []

        for t in cat_topics:
            total_topics += 1
            progress = progress_records.get(t["id"])
            mastery = progress.score / 100.0 if progress else 0.0
            completed = progress.completed if progress else False
            best_score = int(progress.score) if progress else 0

            if completed:
                topics_completed += 1

            mastery_sum += mastery

            # Check prerequisites
            locked = False
            for prereq_id in t.get("prerequisites", []):
                if prereq_id not in completed_ids:
                    locked = True
                    break

            topic_outs.append(GrammarTopicOut(
                id=t["id"],
                title=t["title"],
                level=t["level"],
                levelLabel=_LEVEL_LABELS.get(t["level"], "Foundation"),
                category=t["category"],
                mastery=round(mastery, 2),
                completed=completed,
                bestScore=best_score,
                locked=locked,
            ))

        categories_out.append(GrammarCategoryOut(
            id=cat_def["id"],
            label=cat_def["label"],
            emoji=cat_def["emoji"],
            topics=topic_outs,
        ))

    overall_mastery = round(mastery_sum / max(total_topics, 1), 2)

    return GrammarTopicsResponse(
        categories=categories_out,
        overallMastery=overall_mastery,
        topicsCompleted=topics_completed,
        totalTopics=total_topics,
    )


@router.post("/lesson", response_model=GrammarLessonResponse)
async def create_lesson(
    body: GrammarLessonRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Load grammar lesson directly from the local library (grammar_data.py)
    # The local library is static and the in-memory cache inside generate_grammar_lesson() is sufficient.
    data = await generate_grammar_lesson(body.topic, body.level)

    return GrammarLessonResponse(**data)


@router.post("/quiz/submit", response_model=GrammarQuizResult)
async def submit_grammar_quiz(
    body: GrammarQuizSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit quiz answers, record progress, and award XP."""
    score_pct = int((body.correct_count / max(body.total_questions, 1)) * 100)

    # Determine XP award
    if score_pct == 100:
        xp_award = 50
    elif score_pct >= 80:
        xp_award = 25
    elif score_pct >= 60:
        xp_award = 15
    else:
        xp_award = 5

    # Look up or create grammar progress record
    result = await db.execute(
        select(GrammarProgress).where(
            GrammarProgress.user_id == current_user.id,
            GrammarProgress.topic == body.topic_id,
        )
    )
    progress = result.scalar_one_or_none()

    topic_completed = score_pct >= 60

    if progress:
        # Update only if new score is higher
        if score_pct > progress.score:
            progress.score = float(score_pct)
        if topic_completed and not progress.completed:
            progress.completed = True
            progress.completed_at = datetime.now(timezone.utc)
    else:
        progress = GrammarProgress(
            user_id=current_user.id,
            topic=body.topic_id,
            score=float(score_pct),
            completed=topic_completed,
            completed_at=datetime.now(timezone.utc) if topic_completed else None,
        )
        db.add(progress)

    # Award XP
    try:
        from app.services.gamification_service import award_xp
        await award_xp(db, current_user.id, xp_award, "grammar", f"Grammar quiz: {body.topic_id}")
    except Exception:
        pass  # XP is supplementary

    # Log practice session
    try:
        from app.services.progress_service import log_session
        duration = max(1, body.time_spent_seconds // 60)
        await log_session(db, current_user.id, "grammar", duration, score_pct)
    except Exception:
        pass  # Session logging is supplementary

    await db.flush()

    return GrammarQuizResult(
        score=score_pct,
        xp_awarded=xp_award,
        mastery_updated=progress.score,
        topic_completed=progress.completed,
        new_mastery=progress.score / 100.0,
    )


@router.get("/progress")
async def get_grammar_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return overall grammar mastery statistics."""
    result = await db.execute(
        select(GrammarProgress).where(GrammarProgress.user_id == current_user.id)
    )
    records = result.scalars().all()

    total_topics = len(_TOPICS)
    completed = sum(1 for r in records if r.completed)
    avg_score = sum(r.score for r in records) / max(len(records), 1) if records else 0.0

    return {
        "totalTopics": total_topics,
        "topicsAttempted": len(records),
        "topicsCompleted": completed,
        "averageScore": round(avg_score, 1),
        "overallMastery": round(completed / max(total_topics, 1), 2),
    }


@router.get("/progress/{topic_id}")
async def get_topic_progress(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return detailed progress for a single grammar topic."""
    if topic_id not in _TOPIC_BY_ID:
        raise HTTPException(status_code=404, detail="Topic not found")

    result = await db.execute(
        select(GrammarProgress).where(
            GrammarProgress.user_id == current_user.id,
            GrammarProgress.topic == topic_id,
        )
    )
    progress = result.scalar_one_or_none()

    topic_info = _TOPIC_BY_ID[topic_id]

    return {
        "topicId": topic_id,
        "title": topic_info["title"],
        "level": topic_info["level"],
        "levelLabel": _LEVEL_LABELS.get(topic_info["level"], "Foundation"),
        "score": progress.score if progress else 0,
        "completed": progress.completed if progress else False,
        "completedAt": progress.completed_at.isoformat() if progress and progress.completed_at else None,
        "attempts": 1 if progress else 0,
    }

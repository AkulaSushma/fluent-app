"""
Fluent API — Seed script.

Creates a demo user with 30 days of rich practice history,
SRS cards, curriculum progress, achievements, and XP transactions.

Usage:
    python -m app.seed.seed_data
"""

from __future__ import annotations

import asyncio
import random
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select

from app.core.security import hash_password
from app.db.base import Base
from app.db.models import (
    Achievement,
    AchievementCategory,
    CardType,
    CurriculumPhase,
    GrammarProgress,
    SessionLog,
    SessionType,
    SRSCard,
    StreakRecord,
    User,
    UserAchievement,
    UserCurriculumProgress,
    UserSettings,
    VocabProgress,
    XPSource,
    XPTransaction,
    DailyPlan,
)
from app.db.session import async_session_factory, engine
from app.seed.seed_cognitive import seed_cognitive
from app.seed.seed_content import seed_content

DEMO_EMAIL = "demo@fluent.app"
DEMO_NAME = "Aarav Kapoor"
DEMO_PASSWORD = "demo123"

# ── Achievement Definitions ─────────────────────────────────────────

ACHIEVEMENT_DEFS = [
    ("first_steps", "First Steps", "Complete your first day", "👶", AchievementCategory.milestone, 1),
    ("week_warrior", "Week Warrior", "Maintain a 7-day streak", "⚔️", AchievementCategory.streak, 7),
    ("fortnight_fire", "Fortnight Fire", "Maintain a 14-day streak", "🔥", AchievementCategory.streak, 14),
    ("month_master", "Month Master", "Maintain a 30-day streak", "🏆", AchievementCategory.streak, 30),
    ("iron_streak", "Iron Streak", "Maintain a 60-day streak", "💎", AchievementCategory.streak, 60),
    ("century_club", "Century Club", "Maintain a 90-day streak", "💯", AchievementCategory.streak, 90),
    ("word_collector", "Word Collector", "Master 50 words", "📚", AchievementCategory.mastery, 50),
    ("lexicon_lord", "Lexicon Lord", "Master 200 words", "👑", AchievementCategory.mastery, 200),
    ("grammar_guru", "Grammar Guru", "Complete 10 grammar lessons", "🧩", AchievementCategory.mastery, 10),
    ("sharp_tongue", "Sharp Tongue", "Achieve 90%+ pronunciation accuracy", "🎯", AchievementCategory.mastery, 90),
    ("speed_learner", "Speed Learner", "Complete 5 drills in one day", "⚡", AchievementCategory.consistency, 5),
    ("night_owl", "Night Owl", "Complete evening review 7 days straight", "🦉", AchievementCategory.consistency, 7),
    ("early_bird", "Early Bird", "Complete morning session 7 days straight", "🐦", AchievementCategory.consistency, 7),
    ("dedication", "Dedication", "Log 100+ practice sessions", "💪", AchievementCategory.consistency, 100),
    ("level_5", "Level 5", "Reach level 5", "🌟", AchievementCategory.milestone, 5),
    ("level_10", "Level 10", "Reach level 10", "⭐", AchievementCategory.milestone, 10),
    ("phase_2", "Phase 2", "Enter Building phase (day 31)", "🚀", AchievementCategory.milestone, 31),
    ("phase_3", "Phase 3", "Enter Mastery phase (day 61)", "🎓", AchievementCategory.milestone, 61),
    ("fluent_pro", "Fluent Pro", "Complete the 90-day program", "🏅", AchievementCategory.milestone, 90),
    ("perfectionist", "Perfectionist", "Get 100% on 10 quizzes", "💎", AchievementCategory.mastery, 10),
]

# ── Vocab Words ─────────────────────────────────────────────────────

_MASTERED_WORDS = [
    "synergy", "leverage", "streamline", "stakeholder", "bandwidth",
    "pivot", "scalable", "onboard", "algorithm", "latency",
    "encryption", "deploy", "iterate", "refactor", "cache",
    "hypothesis", "empirical", "paradigm", "discourse", "methodology",
    "itinerary", "concierge", "diagnosis", "equity", "catalyst",
]

_LEARNING_WORDS = [
    "ubiquitous", "eloquent", "pragmatic", "resilient", "meticulous",
    "tenacious", "volatile", "benevolent", "concise", "exquisite",
]

_GRAMMAR_TOPICS = [
    "Present Perfect vs Past Simple",
    "Conditional Sentences (Type 2)",
    "Passive Voice",
    "Relative Clauses",
    "Reported Speech",
    "Modal Verbs",
    "Articles (a/an/the)",
    "Gerunds vs Infinitives",
]

_SESSION_TYPES = list(SessionType)


async def seed() -> None:
    """Populate the database with a demo user and rich 30-day learning history."""
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        # ── Seed Achievement Definitions ────────────────────────────
        for code, title, desc, emoji, category, threshold in ACHIEVEMENT_DEFS:
            result = await db.execute(
                select(Achievement).where(Achievement.code == code)
            )
            if not result.scalar_one_or_none():
                db.add(Achievement(
                    code=code,
                    title=title,
                    description=desc,
                    emoji=emoji,
                    category=category,
                    threshold=threshold,
                ))
        await db.flush()
        print("[SUCCESS] Seeded 20 achievement definitions")

        # ── Check if demo user already exists ───────────────────────
        result = await db.execute(select(User).where(User.email == DEMO_EMAIL))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"[SUCCESS] Demo user already exists (id={existing.id})")
            await seed_cognitive(db)
            await db.commit()
            return

        # ── Create demo user ────────────────────────────────────────
        user = User(
            email=DEMO_EMAIL,
            name=DEMO_NAME,
            hashed_password=hash_password(DEMO_PASSWORD),
            level="intermediate",
            streak_days=24,
            fluency_score=84.2,
            total_words=len(_MASTERED_WORDS),
            xp=2700,
            xp_level=8,
        )
        db.add(user)
        await db.flush()
        print(f"[SUCCESS] Created demo user: {user.email} (id={user.id})")

        # ── User Settings ───────────────────────────────────────────
        settings = UserSettings(
            user_id=user.id,
            morning_reminder_time="08:00",
            evening_reminder_time="20:00",
            reminders_enabled=True,
            daily_goal_minutes=30,
            daily_goal_drills=4,
            preferred_themes=["corporate", "technology", "academic"],
        )
        db.add(settings)
        print("  [SUCCESS] Created user settings")

        # ── Curriculum Progress ─────────────────────────────────────
        today = date.today()
        started = today - timedelta(days=23)  # Started 24 days ago
        curriculum = UserCurriculumProgress(
            user_id=user.id,
            current_day=24,
            phase=CurriculumPhase.foundation,
            started_at=datetime(started.year, started.month, started.day, tzinfo=timezone.utc),
            expected_completion=datetime(
                (started + timedelta(days=90)).year,
                (started + timedelta(days=90)).month,
                (started + timedelta(days=90)).day,
                tzinfo=timezone.utc,
            ),
            daily_goal_minutes=30,
        )
        db.add(curriculum)
        print("  [SUCCESS] Created curriculum progress (Day 24, Foundation phase)")

        # ── Mastered Vocab (SRS cards with varied intervals) ────────
        for i, word in enumerate(_MASTERED_WORDS):
            vp = VocabProgress(
                user_id=user.id,
                word=word,
                mastered=True,
                reviewed_count=random.randint(3, 12),
                last_reviewed=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 10)),
            )
            db.add(vp)

            # SRS card with varied intervals (mastered words have longer intervals)
            interval = random.choice([7, 14, 21, 30, 45])
            srs_card = SRSCard(
                user_id=user.id,
                word=word,
                card_type=CardType.vocab,
                ease_factor=round(random.uniform(2.2, 3.0), 2),
                interval_days=interval,
                repetitions=random.randint(3, 8),
                next_review=today + timedelta(days=random.randint(-3, interval)),
                last_quality=random.choice([3, 4, 5]),
            )
            db.add(srs_card)
        print(f"  [SUCCESS] Added {len(_MASTERED_WORDS)} mastered words with SRS cards")

        # ── Learning Vocab (SRS cards due soon) ─────────────────────
        for word in _LEARNING_WORDS:
            vp = VocabProgress(
                user_id=user.id,
                word=word,
                mastered=False,
                reviewed_count=random.randint(1, 3),
                last_reviewed=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 3)),
            )
            db.add(vp)

            # SRS cards due today or tomorrow (for review demo)
            srs_card = SRSCard(
                user_id=user.id,
                word=word,
                card_type=CardType.vocab,
                ease_factor=round(random.uniform(1.8, 2.5), 2),
                interval_days=random.choice([1, 2, 3]),
                repetitions=random.randint(0, 2),
                next_review=today - timedelta(days=random.randint(0, 1)),  # Due today or yesterday
                last_quality=random.choice([2, 3]),
            )
            db.add(srs_card)
        print(f"  [SUCCESS] Added {len(_LEARNING_WORDS)} learning words with due SRS cards")

        # ── Grammar Progress ────────────────────────────────────────
        for i, topic in enumerate(_GRAMMAR_TOPICS):
            gp = GrammarProgress(
                user_id=user.id,
                topic=topic,
                score=round(random.uniform(65, 100), 1),
                completed=i < 5,  # First 5 completed
                completed_at=(
                    datetime.now(timezone.utc) - timedelta(days=random.randint(1, 20))
                    if i < 5
                    else None
                ),
            )
            db.add(gp)
        print(f"  [SUCCESS] Added {len(_GRAMMAR_TOPICS)} grammar progress records")

        # ── Session Logs & Streak Records (30 days) ─────────────────
        session_count = 0
        for days_ago in range(29, -1, -1):
            d = today - timedelta(days=days_ago)

            # Realistic patterns: more practice on weekends, less mid-week
            weekday = d.weekday()
            if weekday in (5, 6):  # Weekend
                num_sessions = random.randint(2, 4)
                base_minutes = random.randint(20, 35)
            elif weekday in (0, 4):  # Mon, Fri
                num_sessions = random.randint(2, 3)
                base_minutes = random.randint(15, 25)
            else:  # Tue-Thu
                num_sessions = random.randint(1, 3)
                base_minutes = random.randint(10, 20)

            daily_minutes = 0
            for _ in range(num_sessions):
                duration = base_minutes + random.randint(-5, 10)
                duration = max(5, duration)
                daily_minutes += duration
                sl = SessionLog(
                    user_id=user.id,
                    session_type=random.choice(_SESSION_TYPES),
                    duration_minutes=duration,
                    score=round(random.uniform(55, 100), 1),
                )
                sl.created_at = datetime(
                    d.year, d.month, d.day, random.randint(7, 21), 0, 0,
                    tzinfo=timezone.utc,
                )
                db.add(sl)
                session_count += 1

            sr = StreakRecord(
                user_id=user.id,
                date=d,
                minutes_practiced=daily_minutes,
                drills_completed=num_sessions,
            )
            db.add(sr)

        print(f"  [SUCCESS] Added {session_count} session logs and 30 streak records")

        # ── XP Transactions ─────────────────────────────────────────
        xp_sources = [
            (XPSource.vocab, "Vocabulary practice"),
            (XPSource.grammar, "Grammar lesson"),
            (XPSource.pronunciation, "Pronunciation drill"),
            (XPSource.streak, "Daily streak bonus"),
            (XPSource.daily_plan, "Completed daily plan"),
        ]
        for days_ago in range(23, -1, -1):
            d = today - timedelta(days=days_ago)
            # 2-4 XP transactions per day
            for _ in range(random.randint(2, 4)):
                source, desc = random.choice(xp_sources)
                amount = random.randint(10, 50)
                xp_tx = XPTransaction(
                    user_id=user.id,
                    amount=amount,
                    source=source,
                    description=desc,
                )
                xp_tx.created_at = datetime(
                    d.year, d.month, d.day, random.randint(7, 21), 0, 0,
                    tzinfo=timezone.utc,
                )
                db.add(xp_tx)
        print("  [SUCCESS] Added XP transaction history")

        # ── Unlocked Achievements ───────────────────────────────────
        unlocked_codes = [
            "first_steps", "week_warrior", "fortnight_fire",
            "word_collector", "speed_learner", "early_bird",
            "level_5", "grammar_guru",
        ]
        all_achievements = (await db.execute(select(Achievement))).scalars().all()
        achievement_map = {a.code: a for a in all_achievements}

        for code in unlocked_codes:
            if code in achievement_map:
                ua = UserAchievement(
                    user_id=user.id,
                    achievement_id=achievement_map[code].id,
                    unlocked_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 20)),
                )
                db.add(ua)
        print(f"  [SUCCESS] Unlocked {len(unlocked_codes)} achievements")

        # ── Today's Daily Plan ──────────────────────────────────────
        daily_plan = DailyPlan(
            user_id=user.id,
            date=today,
            morning_tasks=[
                {"id": "m1", "type": "vocab", "title": "Corporate Vocabulary", "subtitle": "8 new flashcards", "duration_minutes": 10, "xp_reward": 40, "completed": True, "screen": "Vocab"},
                {"id": "m2", "type": "grammar", "title": "Present Perfect Review", "subtitle": "Tenses checkpoint", "duration_minutes": 8, "xp_reward": 30, "completed": True, "screen": "Grammar"},
                {"id": "m3", "type": "pronunciation", "title": "Pronunciation Warm-up", "subtitle": "3-minute read-aloud", "duration_minutes": 5, "xp_reward": 20, "completed": False, "screen": "Teleprompter"},
            ],
            evening_tasks=[
                {"id": "e1", "type": "review", "title": "Morning Vocab Review", "subtitle": "Review today's 8 cards", "duration_minutes": 8, "xp_reward": 30, "completed": False, "screen": "Review"},
                {"id": "e2", "type": "review", "title": "SRS Due Cards", "subtitle": f"{len(_LEARNING_WORDS)} cards overdue", "duration_minutes": 10, "xp_reward": 25, "completed": False, "screen": "Review"},
                {"id": "e3", "type": "grammar", "title": "Grammar Reinforcement", "subtitle": "Quick quiz on today's topic", "duration_minutes": 5, "xp_reward": 20, "completed": False, "screen": "Grammar"},
            ],
            total_xp=165,
            completed=False,
        )
        db.add(daily_plan)
        print("  [SUCCESS] Created today's daily plan (2/6 tasks completed)")

        # Call cognitive pattern engine seeder
        await seed_cognitive(db)

        # Call content library seeder
        await seed_content(db)

        await db.commit()
        print("\n[SUCCESS] Seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed())

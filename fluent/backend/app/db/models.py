"""
Fluent API — SQLAlchemy ORM models.
"""

import enum
from datetime import date, datetime

from sqlalchemy import Boolean, Date, Enum, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


# ── Enums ────────────────────────────────────────────────────────────


class SessionType(str, enum.Enum):
    vocab = "vocab"
    grammar = "grammar"
    pronunciation = "pronunciation"
    tutor = "tutor"


class CurriculumPhase(str, enum.Enum):
    foundation = "foundation"
    building = "building"
    mastery = "mastery"


class CardType(str, enum.Enum):
    vocab = "vocab"
    grammar = "grammar"
    phrase = "phrase"


class XPSource(str, enum.Enum):
    vocab = "vocab"
    grammar = "grammar"
    pronunciation = "pronunciation"
    streak = "streak"
    challenge = "challenge"
    bonus = "bonus"
    daily_plan = "daily_plan"


class AchievementCategory(str, enum.Enum):
    streak = "streak"
    mastery = "mastery"
    consistency = "consistency"
    milestone = "milestone"


# ── User ─────────────────────────────────────────────────────────────


class User(TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(256), nullable=False)
    level: Mapped[str] = mapped_column(String(32), default="intermediate")
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    fluency_score: Mapped[float] = mapped_column(Float, default=0.0)
    total_words: Mapped[int] = mapped_column(Integer, default=0)

    # Gamification
    xp: Mapped[int] = mapped_column(Integer, default=0)
    xp_level: Mapped[int] = mapped_column(Integer, default=1)

    # Relationships
    vocab_progress: Mapped[list["VocabProgress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    grammar_progress: Mapped[list["GrammarProgress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    session_logs: Mapped[list["SessionLog"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    streak_records: Mapped[list["StreakRecord"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    srs_cards: Mapped[list["SRSCard"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    curriculum_progress: Mapped["UserCurriculumProgress | None"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )
    daily_plans: Mapped[list["DailyPlan"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    xp_transactions: Mapped[list["XPTransaction"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    achievements: Mapped[list["UserAchievement"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    settings: Mapped["UserSettings | None"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )


# ── Vocab Progress ──────────────────────────────────────────────────


class VocabProgress(TimestampMixin, Base):
    __tablename__ = "vocab_progress"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    word: Mapped[str] = mapped_column(String(128), nullable=False)
    mastered: Mapped[bool] = mapped_column(Boolean, default=False)
    reviewed_count: Mapped[int] = mapped_column(Integer, default=0)
    last_reviewed: Mapped[datetime | None] = mapped_column(default=None)

    user: Mapped["User"] = relationship(back_populates="vocab_progress")


# ── Grammar Progress ────────────────────────────────────────────────


class GrammarProgress(TimestampMixin, Base):
    __tablename__ = "grammar_progress"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    topic: Mapped[str] = mapped_column(String(128), nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(default=None)

    user: Mapped["User"] = relationship(back_populates="grammar_progress")


# ── Session Log ─────────────────────────────────────────────────────


class SessionLog(TimestampMixin, Base):
    __tablename__ = "session_logs"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    session_type: Mapped[SessionType] = mapped_column(
        Enum(SessionType), nullable=False
    )
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0)
    score: Mapped[float | None] = mapped_column(Float, default=None)

    user: Mapped["User"] = relationship(back_populates="session_logs")


# ── Streak Record ───────────────────────────────────────────────────


class StreakRecord(TimestampMixin, Base):
    __tablename__ = "streak_records"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    minutes_practiced: Mapped[int] = mapped_column(Integer, default=0)
    drills_completed: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship(back_populates="streak_records")


# ── SRS Card (Spaced Repetition) ────────────────────────────────────


class SRSCard(TimestampMixin, Base):
    __tablename__ = "srs_cards"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    word: Mapped[str] = mapped_column(String(128), nullable=False)
    card_type: Mapped[CardType] = mapped_column(Enum(CardType), default=CardType.vocab)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)
    interval_days: Mapped[int] = mapped_column(Integer, default=0)
    repetitions: Mapped[int] = mapped_column(Integer, default=0)
    next_review: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    last_quality: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship(back_populates="srs_cards")


# ── Curriculum Day ──────────────────────────────────────────────────


class CurriculumDay(Base):
    __tablename__ = "curriculum_days"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    day_number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False, index=True)
    week_number: Mapped[int] = mapped_column(Integer, nullable=False)
    phase: Mapped[CurriculumPhase] = mapped_column(Enum(CurriculumPhase), nullable=False)
    vocab_theme: Mapped[str] = mapped_column(String(64), nullable=False)
    grammar_topic: Mapped[str] = mapped_column(String(128), nullable=False)
    reading_level: Mapped[str] = mapped_column(String(32), default="intermediate")
    speaking_exercise: Mapped[str] = mapped_column(String(256), default="")
    difficulty_level: Mapped[int] = mapped_column(Integer, default=1)
    xp_reward: Mapped[int] = mapped_column(Integer, default=100)


# ── User Curriculum Progress ────────────────────────────────────────


class UserCurriculumProgress(TimestampMixin, Base):
    __tablename__ = "user_curriculum_progress"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False, index=True)
    current_day: Mapped[int] = mapped_column(Integer, default=1)
    phase: Mapped[CurriculumPhase] = mapped_column(Enum(CurriculumPhase), default=CurriculumPhase.foundation)
    started_at: Mapped[datetime] = mapped_column(nullable=False)
    expected_completion: Mapped[datetime] = mapped_column(nullable=False)
    daily_goal_minutes: Mapped[int] = mapped_column(Integer, default=30)

    user: Mapped["User"] = relationship(back_populates="curriculum_progress")


# ── Daily Plan ──────────────────────────────────────────────────────


class DailyPlan(TimestampMixin, Base):
    __tablename__ = "daily_plans"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    morning_tasks: Mapped[dict | None] = mapped_column(JSON, default=None)
    evening_tasks: Mapped[dict | None] = mapped_column(JSON, default=None)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="daily_plans")


# ── XP Transaction ──────────────────────────────────────────────────


class XPTransaction(TimestampMixin, Base):
    __tablename__ = "xp_transactions"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    source: Mapped[XPSource] = mapped_column(Enum(XPSource), nullable=False)
    description: Mapped[str] = mapped_column(String(256), default="")

    user: Mapped["User"] = relationship(back_populates="xp_transactions")


# ── Achievement ─────────────────────────────────────────────────────


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str] = mapped_column(String(256), nullable=False)
    emoji: Mapped[str] = mapped_column(String(8), nullable=False)
    category: Mapped[AchievementCategory] = mapped_column(Enum(AchievementCategory), nullable=False)
    threshold: Mapped[int] = mapped_column(Integer, default=0)

    user_achievements: Mapped[list["UserAchievement"]] = relationship(
        back_populates="achievement"
    )


# ── User Achievement ────────────────────────────────────────────────


class UserAchievement(TimestampMixin, Base):
    __tablename__ = "user_achievements"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id"), nullable=False)
    unlocked_at: Mapped[datetime] = mapped_column(nullable=False)

    user: Mapped["User"] = relationship(back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship(back_populates="user_achievements")


# ── User Settings ───────────────────────────────────────────────────


class UserSettings(TimestampMixin, Base):
    __tablename__ = "user_settings"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False, index=True)
    morning_reminder_time: Mapped[str] = mapped_column(String(5), default="08:00")
    evening_reminder_time: Mapped[str] = mapped_column(String(5), default="20:00")
    reminders_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    daily_goal_minutes: Mapped[int] = mapped_column(Integer, default=30)
    daily_goal_drills: Mapped[int] = mapped_column(Integer, default=4)
    preferred_themes: Mapped[dict | None] = mapped_column(JSON, default=None)
    notification_token: Mapped[str] = mapped_column(String(256), default="")
    gemini_api_key: Mapped[str | None] = mapped_column(String(256), nullable=True, default=None)
    openrouter_api_key: Mapped[str | None] = mapped_column(String(256), nullable=True, default=None)
    groq_api_key: Mapped[str | None] = mapped_column(String(256), nullable=True, default=None)

    user: Mapped["User"] = relationship(back_populates="settings")

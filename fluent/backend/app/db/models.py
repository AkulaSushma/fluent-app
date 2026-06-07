"""
Fluent API — SQLAlchemy ORM models.
"""

import enum
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text, JSON, UniqueConstraint
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


class PartType(str, enum.Enum):
    prefix = "prefix"
    root = "root"
    suffix = "suffix"


class FluencyTier(str, enum.Enum):
    basic = "basic"
    comfort = "comfort"
    strong = "strong"


class BookTrack(str, enum.Enum):
    mastery = "mastery"
    storytelling = "storytelling"


class JournalSource(str, enum.Enum):
    manual = "manual"
    library_highlight = "library_highlight"
    quiz = "quiz"


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
    journal_entries: Mapped[list["UserJournal"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    cognitive_srs_queue: Mapped[list["CognitiveSrsQueue"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    favorite_lists: Mapped[list["FavoriteList"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    challenge_progress: Mapped[list["UserChallengeProgress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    story_mnemonics: Mapped[list["StoryMnemonic"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
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


# ── Etymology Part ──────────────────────────────────────────────────


class EtymologyPart(TimestampMixin, Base):
    __tablename__ = "etymology_parts"
    __table_args__ = (
        UniqueConstraint("part_type", "morpheme", name="uq_etymology_type_morpheme"),
    )

    part_type: Mapped[PartType] = mapped_column(Enum(PartType), nullable=False)
    morpheme: Mapped[str] = mapped_column(String(128), nullable=False)
    meaning: Mapped[str] = mapped_column(String(256), nullable=False)
    domain: Mapped[str | None] = mapped_column(String(64), nullable=True)
    example_word: Mapped[str | None] = mapped_column(String(128), nullable=True)


# ── Theme ────────────────────────────────────────────────────────────


class Theme(TimestampMixin, Base):
    __tablename__ = "themes"

    name: Mapped[str] = mapped_column(String(80), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon: Mapped[str | None] = mapped_column(String(40), nullable=True)
    accent_color: Mapped[str | None] = mapped_column(String(9), nullable=True)

    families: Mapped[list["WordFamily"]] = relationship(back_populates="theme_rel", cascade="all, delete-orphan")
    words: Mapped[list["VocabularyNode"]] = relationship(back_populates="theme", cascade="all, delete-orphan")


# ── Word Family ─────────────────────────────────────────────────────


class WordFamily(TimestampMixin, Base):
    __tablename__ = "word_families"

    name: Mapped[str] = mapped_column(String(128), nullable=False)
    theme: Mapped[str | None] = mapped_column(String(128), nullable=True)
    theme_id: Mapped[str | None] = mapped_column(ForeignKey("themes.id"), nullable=True)
    base_meaning: Mapped[str | None] = mapped_column(Text, nullable=True)
    fluency_tier: Mapped[FluencyTier | None] = mapped_column(Enum(FluencyTier), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    words: Mapped[list["VocabularyNode"]] = relationship(
        back_populates="word_family", cascade="all, delete-orphan"
    )
    theme_rel: Mapped["Theme | None"] = relationship(back_populates="families")


# ── Vocabulary Node ─────────────────────────────────────────────────


class VocabularyNode(TimestampMixin, Base):
    __tablename__ = "vocabulary_nodes"

    word: Mapped[str] = mapped_column(String(128), nullable=False)
    definition: Mapped[str | None] = mapped_column(Text, nullable=True)
    root_link: Mapped[str | None] = mapped_column(ForeignKey("etymology_parts.id"), nullable=True)
    prefix_link: Mapped[str | None] = mapped_column(ForeignKey("etymology_parts.id"), nullable=True)
    suffix_link: Mapped[str | None] = mapped_column(ForeignKey("etymology_parts.id"), nullable=True)
    word_family_id: Mapped[str | None] = mapped_column(ForeignKey("word_families.id"), nullable=True)
    visual_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    context_sentence: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[int] = mapped_column(Integer, default=1)

    # anchoring and dictionary features
    mnemonic_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    mnemonic_image_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    intensity: Mapped[float | None] = mapped_column(Float, nullable=True)
    theme_id: Mapped[str | None] = mapped_column(ForeignKey("themes.id"), nullable=True)
    synonyms: Mapped[str | None] = mapped_column(Text, nullable=True)
    antonyms: Mapped[str | None] = mapped_column(Text, nullable=True)

    root: Mapped["EtymologyPart | None"] = relationship(foreign_keys=[root_link])
    prefix: Mapped["EtymologyPart | None"] = relationship(foreign_keys=[prefix_link])
    suffix: Mapped["EtymologyPart | None"] = relationship(foreign_keys=[suffix_link])
    word_family: Mapped["WordFamily | None"] = relationship(back_populates="words")
    theme: Mapped["Theme | None"] = relationship(back_populates="words")


# ── User Journal ────────────────────────────────────────────────────


class UserJournal(TimestampMixin, Base):
    __tablename__ = "user_journal"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    vocabulary_node_id: Mapped[str | None] = mapped_column(ForeignKey("vocabulary_nodes.id"), nullable=True)
    personal_sentence: Mapped[str] = mapped_column(Text, nullable=False)
    emotion_tag: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source: Mapped[JournalSource] = mapped_column(Enum(JournalSource), default=JournalSource.manual)
    spoken_aloud: Mapped[bool] = mapped_column(Boolean, default=False)
    spoken_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="journal_entries")
    word: Mapped["VocabularyNode | None"] = relationship()


# ── Library Book ────────────────────────────────────────────────────


class LibraryBook(TimestampMixin, Base):
    __tablename__ = "library_books"

    title: Mapped[str] = mapped_column(String(256), nullable=False)
    author: Mapped[str | None] = mapped_column(String(128), nullable=True)
    track: Mapped[BookTrack] = mapped_column(Enum(BookTrack), nullable=False)
    cover_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    content_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_public_domain: Mapped[bool] = mapped_column(Boolean, default=False)
    accent_color: Mapped[str] = mapped_column(String(16), default="#1A1A2E")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    chapter_count: Mapped[int] = mapped_column(Integer, default=0)


# ── Cognitive SRS Queue ─────────────────────────────────────────────


class CognitiveSrsQueue(TimestampMixin, Base):
    __tablename__ = "cognitive_srs_queue"
    __table_args__ = (
        UniqueConstraint("user_id", "vocabulary_node_id", name="uq_srs_user_node"),
    )

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    vocabulary_node_id: Mapped[str] = mapped_column(ForeignKey("vocabulary_nodes.id"), nullable=False)
    stage: Mapped[int] = mapped_column(Integer, default=0)
    next_review_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0)
    total_lapses: Mapped[int] = mapped_column(Integer, default=0)
    is_buried: Mapped[bool] = mapped_column(Boolean, default=False)

    # SM-2 columns
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)
    repetitions: Mapped[int] = mapped_column(Integer, default=0)
    interval_days: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship(back_populates="cognitive_srs_queue")
    word: Mapped["VocabularyNode"] = relationship()


# ── Story Mnemonic ──────────────────────────────────────────────────


class StoryMnemonic(TimestampMixin, Base):
    __tablename__ = "story_mnemonics"

    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User | None"] = relationship(back_populates="story_mnemonics")
    links: Mapped[list["StoryWordLink"]] = relationship(
        back_populates="story", cascade="all, delete-orphan"
    )


class StoryWordLink(Base):
    __tablename__ = "story_word_links"

    story_id: Mapped[str] = mapped_column(ForeignKey("story_mnemonics.id"), primary_key=True)
    node_id: Mapped[str] = mapped_column(ForeignKey("vocabulary_nodes.id"), primary_key=True)
    highlighted_phrase: Mapped[str | None] = mapped_column(String(160), nullable=True)

    story: Mapped["StoryMnemonic"] = relationship(back_populates="links")
    node: Mapped["VocabularyNode"] = relationship()


# ── Favorite Lists ──────────────────────────────────────────────────


class FavoriteList(TimestampMixin, Base):
    __tablename__ = "favorite_lists"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(120), default="My 100 Words")
    target_count: Mapped[int] = mapped_column(Integer, default=100)

    user: Mapped["User"] = relationship(back_populates="favorite_lists")
    entries: Mapped[list["FavoriteEntry"]] = relationship(
        back_populates="list", cascade="all, delete-orphan"
    )


class FavoriteEntry(TimestampMixin, Base):
    __tablename__ = "favorite_entries"

    list_id: Mapped[str] = mapped_column(ForeignKey("favorite_lists.id"), nullable=False, index=True)
    node_id: Mapped[str | None] = mapped_column(ForeignKey("vocabulary_nodes.id"), nullable=True)
    word: Mapped[str] = mapped_column(String(128), nullable=False)
    letter: Mapped[str] = mapped_column(String(1), index=True)
    mastered: Mapped[bool] = mapped_column(Boolean, default=False)

    list: Mapped["FavoriteList"] = relationship(back_populates="entries")
    node: Mapped["VocabularyNode | None"] = relationship()


# ── Challenges ──────────────────────────────────────────────────────


class Challenge(TimestampMixin, Base):
    __tablename__ = "challenges"

    title: Mapped[str] = mapped_column(String(120), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(String(200), nullable=True)
    total_days: Mapped[int] = mapped_column(Integer, default=30)
    daily_minutes: Mapped[int] = mapped_column(Integer, default=25)
    theme_id: Mapped[str | None] = mapped_column(ForeignKey("themes.id"), nullable=True)

    days: Mapped[list["ChallengeDay"]] = relationship(
        back_populates="challenge", cascade="all, delete-orphan", order_by="ChallengeDay.day_number"
    )


class ChallengeDay(TimestampMixin, Base):
    __tablename__ = "challenge_days"

    challenge_id: Mapped[str] = mapped_column(ForeignKey("challenges.id"), nullable=False, index=True)
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    root_part_ids: Mapped[str] = mapped_column(Text, nullable=False)

    challenge: Mapped["Challenge"] = relationship(back_populates="days")


class UserChallengeProgress(TimestampMixin, Base):
    __tablename__ = "user_challenge_progress"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    challenge_id: Mapped[str] = mapped_column(ForeignKey("challenges.id"), nullable=False, index=True)
    current_day: Mapped[int] = mapped_column(Integer, default=1)
    completed_days: Mapped[str] = mapped_column(Text, default="[]")
    started_at: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    last_active: Mapped[date | None] = mapped_column(Date, nullable=True)

    user: Mapped["User"] = relationship(back_populates="challenge_progress")
    challenge: Mapped["Challenge"] = relationship()


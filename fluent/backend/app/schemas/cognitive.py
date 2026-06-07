import json
from datetime import date, datetime
from pydantic import BaseModel, field_validator


class EtymologyPartOut(BaseModel):
    id: str
    part_type: str
    morpheme: str
    meaning: str
    domain: str | None = None
    example_word: str | None = None

    class Config:
        from_attributes = True


class ThemeOut(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None = None
    icon: str | None = None
    accent_color: str | None = None

    class Config:
        from_attributes = True


class VocabularyNodeOut(BaseModel):
    id: str
    word: str
    definition: str | None = None
    difficulty: int = 1
    visual_url: str | None = None
    context_sentence: str | None = None
    root: EtymologyPartOut | None = None
    prefix: EtymologyPartOut | None = None
    suffix: EtymologyPartOut | None = None
    word_family_name: str | None = None
    
    # Anchoring and dictionary fields
    mnemonic_text: str | None = None
    mnemonic_image_url: str | None = None
    intensity: float | None = None
    theme_id: str | None = None
    synonyms: list[str] = []
    antonyms: list[str] = []

    @field_validator("synonyms", "antonyms", mode="before")
    @classmethod
    def parse_json_list(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        if isinstance(v, list):
            return v
        return []

    class Config:
        from_attributes = True


class WordFamilyOut(BaseModel):
    id: str
    name: str
    theme: str | None = None
    theme_id: str | None = None
    base_meaning: str | None = None
    fluency_tier: str | None = None
    words: list[VocabularyNodeOut] = []

    class Config:
        from_attributes = True


class LibraryBookOut(BaseModel):
    id: str
    title: str
    author: str | None = None
    track: str
    cover_url: str | None = None
    content_url: str | None = None
    is_public_domain: bool = False
    accent_color: str = "#1A1A2E"
    sort_order: int = 0
    description: str | None = None
    chapter_count: int = 0

    class Config:
        from_attributes = True


class CognitiveSrsOut(BaseModel):
    id: str
    vocabulary_node_id: str
    stage: int
    next_review_at: datetime
    last_reviewed_at: datetime | None = None
    total_reviews: int = 0
    total_lapses: int = 0
    
    # SM-2 details
    ease_factor: float
    repetitions: int
    interval_days: int

    word: VocabularyNodeOut | None = None

    class Config:
        from_attributes = True


class SrsReviewRequest(BaseModel):
    node_id: str
    quality: int  # 1 (Forgot), 3 (Hard), 4 (Good), 5 (Easy)


class EnqueueRequest(BaseModel):
    node_id: str


class JournalEntryOut(BaseModel):
    id: str
    vocabulary_node_id: str | None = None
    personal_sentence: str
    emotion_tag: str | None = None
    source: str = "manual"
    created_at: datetime
    spoken_aloud: bool = False
    spoken_at: datetime | None = None
    word: VocabularyNodeOut | None = None

    class Config:
        from_attributes = True


class JournalCreateRequest(BaseModel):
    vocabulary_node_id: str | None = None
    personal_sentence: str
    emotion_tag: str | None = None
    source: str = "manual"


# ── Story Mnemonic Schemas ──────────────────────────────────────────


class StoryWordLinkOut(BaseModel):
    node_id: str
    highlighted_phrase: str | None = None
    node: VocabularyNodeOut | None = None

    class Config:
        from_attributes = True


class StoryMnemonicOut(BaseModel):
    id: str
    title: str
    body: str
    is_system: bool
    links: list[StoryWordLinkOut] = []

    class Config:
        from_attributes = True


# ── Favorite Lists Schemas ──────────────────────────────────────────


class FavoriteEntryOut(BaseModel):
    id: str
    list_id: str
    node_id: str | None = None
    word: str
    letter: str
    mastered: bool = False
    node: VocabularyNodeOut | None = None

    class Config:
        from_attributes = True


class FavoriteListOut(BaseModel):
    id: str
    title: str
    target_count: int
    entries: list[FavoriteEntryOut] = []

    class Config:
        from_attributes = True


class FavoriteCreateRequest(BaseModel):
    word: str
    letter: str
    node_id: str | None = None


# ── Challenge Schemas ───────────────────────────────────────────────


class ChallengeDayOut(BaseModel):
    id: str
    day_number: int
    root_part_ids: list[str] = []

    @field_validator("root_part_ids", mode="before")
    @classmethod
    def parse_roots(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        if isinstance(v, list):
            return v
        return []

    class Config:
        from_attributes = True


class ChallengeOut(BaseModel):
    id: str
    title: str
    subtitle: str | None = None
    total_days: int
    daily_minutes: int
    theme_id: str | None = None
    days: list[ChallengeDayOut] = []

    class Config:
        from_attributes = True


class UserChallengeProgressOut(BaseModel):
    id: str
    challenge_id: str
    current_day: int
    completed_days: list[int] = []
    started_at: date
    last_active: date | None = None

    @field_validator("completed_days", mode="before")
    @classmethod
    def parse_completed(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        if isinstance(v, list):
            return v
        return []

    class Config:
        from_attributes = True

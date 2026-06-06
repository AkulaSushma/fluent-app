"""
Fluent API — Pydantic schemas for learning features.
"""

from pydantic import BaseModel, Field


# ── Vocabulary ───────────────────────────────────────────────────────


class VocabCard(BaseModel):
    word: str
    ipa: str
    definition: str
    example: str
    hindi: str = ""
    telugu: str = ""


class VocabDeckResponse(BaseModel):
    cards: list[VocabCard]


class VocabMasterRequest(BaseModel):
    word: str


class VocabThemesResponse(BaseModel):
    themes: list[str]


# ── Grammar ──────────────────────────────────────────────────────────


class GrammarToken(BaseModel):
    text: str
    role: str


class GrammarTimeline(BaseModel):
    label_left: str
    label_right: str
    marker: str


class GrammarExample(BaseModel):
    sentence: str
    tokens: list[GrammarToken]
    translation_hint: str = ""
    note: str = ""


class GrammarMistake(BaseModel):
    wrong: str
    right: str
    explanation: str


class GrammarTipCard(BaseModel):
    emoji: str
    title: str
    body: str


class GrammarQuiz(BaseModel):
    q: str
    options: list[str]
    answer: int
    explanation: str = ""


class GrammarLessonRequest(BaseModel):
    topic: str
    level: str = "intermediate"


class GrammarLessonResponse(BaseModel):
    topic: str
    level: int = 1
    levelLabel: str = "Foundation"
    rule: str
    explanation: str = ""
    formula: str = ""
    timeline: GrammarTimeline | None = None
    examples: list[GrammarExample] = []
    commonMistakes: list[GrammarMistake] = []
    tipCards: list[GrammarTipCard] = []
    # Legacy fields for backward compatibility
    tokens: list[GrammarToken] = []
    example: str = ""
    quiz: list[GrammarQuiz] = []


# ── Grammar Hub (Topic Browser) ─────────────────────────────────────


class GrammarTopicOut(BaseModel):
    id: str
    title: str
    level: int
    levelLabel: str
    category: str
    mastery: float = 0.0
    completed: bool = False
    bestScore: int = 0
    locked: bool = False


class GrammarCategoryOut(BaseModel):
    id: str
    label: str
    emoji: str
    topics: list[GrammarTopicOut]


class GrammarTopicsResponse(BaseModel):
    categories: list[GrammarCategoryOut]
    overallMastery: float = 0.0
    topicsCompleted: int = 0
    totalTopics: int = 0


class GrammarQuizSubmission(BaseModel):
    topic_id: str
    answers: list[int]
    total_questions: int
    correct_count: int
    time_spent_seconds: int = 0


class GrammarQuizResult(BaseModel):
    score: int
    xp_awarded: int
    mastery_updated: float
    topic_completed: bool
    new_mastery: float




# ── Pronunciation ────────────────────────────────────────────────────


class PronunciationResult(BaseModel):
    accuracy: int = Field(ge=0, le=100)
    matched_words: list[str]
    problem_words: list[str]
    tip: str


# ── Articles / Teleprompter ──────────────────────────────────────────


class ArticleResponse(BaseModel):
    title: str
    content: str
    word_count: int
    explanation: str = ""


# ── SRS (Spaced Repetition) ─────────────────────────────────────────


class SRSCardOut(BaseModel):
    id: str
    word: str
    card_type: str
    ease_factor: float
    interval_days: int
    repetitions: int
    next_review: str
    last_quality: int

    model_config = {"from_attributes": True}


class SRSReviewRequest(BaseModel):
    word: str
    quality: int = Field(ge=0, le=5)


class SRSStatsResponse(BaseModel):
    total_cards: int
    due_today: int
    mastered: int
    learning: int
    new: int


class SRSDueResponse(BaseModel):
    cards: list[SRSCardOut]
    total_due: int


# ── Curriculum ───────────────────────────────────────────────────────


class CurriculumTaskOut(BaseModel):
    id: str
    type: str
    title: str
    subtitle: str
    duration_minutes: int
    xp_reward: int
    completed: bool = False
    screen: str = ""
    theme: str | None = None
    topic: str | None = None
    level: str | None = None


class CurriculumTodayResponse(BaseModel):
    day_number: int
    week_number: int
    phase: str
    difficulty_level: int
    morning_tasks: list[CurriculumTaskOut]
    evening_tasks: list[CurriculumTaskOut]
    total_xp: int
    completed_xp: int
    plan_progress: float


class CurriculumProgressResponse(BaseModel):
    current_day: int
    total_days: int = 90
    phase: str
    phase_progress: float
    overall_progress: float
    started_at: str
    expected_completion: str


class CurriculumWeekResponse(BaseModel):
    week_number: int
    days: list[dict]


class CurriculumCompleteRequest(BaseModel):
    task_id: str


# ── Gamification ─────────────────────────────────────────────────────


class XPResponse(BaseModel):
    xp: int
    level: int
    xp_for_current_level: int
    xp_for_next_level: int
    progress_to_next: float
    title: str


class AchievementOut(BaseModel):
    code: str
    title: str
    description: str
    emoji: str
    category: str
    threshold: int
    unlocked: bool = False
    unlocked_at: str | None = None


class AchievementsResponse(BaseModel):
    achievements: list[AchievementOut]
    unlocked_count: int
    total_count: int


class ChallengeOut(BaseModel):
    id: str
    title: str
    description: str
    emoji: str
    xp_reward: int
    progress: float
    completed: bool


class ChallengesResponse(BaseModel):
    challenges: list[ChallengeOut]


# ── Enhanced Progress ────────────────────────────────────────────────


class HeatmapDay(BaseModel):
    date: str
    minutes: int
    intensity: int  # 0-4 for color scale


class HeatmapResponse(BaseModel):
    days: list[HeatmapDay]
    total_active_days: int
    longest_streak: int


class SeriousnessResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    login_consistency: float
    completion_rate: float
    session_depth: float
    streak_bonus: float
    label: str  # "Casual", "Committed", "Dedicated", "Obsessed"


class EnhancedProgressResponse(BaseModel):
    streak_days: int
    fluency_score: float
    total_words: int
    words_mastered: int
    weekly_minutes: int
    today_minutes: int
    goal_progress: float
    daily_breakdown: list[dict]
    level: str
    xp: int
    xp_level: int
    srs_due_count: int
    curriculum_day: int
    curriculum_phase: str
    seriousness_score: int


# ── User Settings ────────────────────────────────────────────────────


class UserSettingsOut(BaseModel):
    morning_reminder_time: str
    evening_reminder_time: str
    reminders_enabled: bool
    daily_goal_minutes: int
    daily_goal_drills: int
    preferred_themes: list[str] | None = None
    gemini_api_key: str | None = None
    openrouter_api_key: str | None = None
    groq_api_key: str | None = None

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    morning_reminder_time: str | None = None  # "06:00" - "11:59"
    evening_reminder_time: str | None = None  # "15:00" - "23:59"
    reminders_enabled: bool | None = None
    daily_goal_minutes: int | None = None
    daily_goal_drills: int | None = None
    preferred_themes: list[str] | None = None
    gemini_api_key: str | None = None
    openrouter_api_key: str | None = None
    groq_api_key: str | None = None

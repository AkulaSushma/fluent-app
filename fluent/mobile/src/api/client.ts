import { Platform } from 'react-native';

const FALLBACK = 'http://192.168.1.100:8000/api/v1';
export const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || FALLBACK).replace(/\/+$/, '');

/* ------------------------------------------------------------------ */
/*  Token Storage & Headers                                            */
/* ------------------------------------------------------------------ */

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

let onUnauthorizedCallback: (() => void) | null = null;

export function onUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface UserOut {
  id: string;
  email: string;
  name: string;
  level: string;
  streak_days: number;
  fluency_score: number;
  total_words: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface VocabCard {
  id?: string;
  word: string;
  ipa: string;
  definition: string;
  example: string;
  hindi?: string;
  telugu?: string;
}

export type FlashCard = VocabCard;

export interface VisualVocabCard {
  word: string;
  ipa: string;
  imageUrl: string;
  definition: string;
  category: string;
  categoryLabel: string;
}


export interface VocabDeckResponse {
  cards: VocabCard[];
}

export interface GrammarToken {
  text: string;
  role: string;
}

export interface GrammarTimeline {
  label_left: string;
  label_right: string;
  marker: string;
}

export interface GrammarExample {
  sentence: string;
  tokens: GrammarToken[];
  translation_hint: string;
  note: string;
}

export interface GrammarMistake {
  wrong: string;
  right: string;
  explanation: string;
}

export interface GrammarTipCard {
  emoji: string;
  title: string;
  body: string;
}

export interface GrammarQuiz {
  q: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface GrammarLessonResponse {
  topic: string;
  level: number;
  levelLabel: string;
  rule: string;
  explanation: string;
  formula: string;
  timeline?: GrammarTimeline;
  examples: GrammarExample[];
  commonMistakes: GrammarMistake[];
  tipCards: GrammarTipCard[];
  // Legacy fields
  tokens: GrammarToken[];
  example: string;
  quiz: GrammarQuiz[];
}

export interface GrammarTopicOut {
  id: string;
  title: string;
  level: number;
  levelLabel: string;
  category: string;
  mastery: number;
  completed: boolean;
  bestScore: number;
  locked: boolean;
}

export interface GrammarCategoryOut {
  id: string;
  label: string;
  emoji: string;
  topics: GrammarTopicOut[];
}

export interface GrammarTopicsResponse {
  categories: GrammarCategoryOut[];
  overallMastery: number;
  topicsCompleted: number;
  totalTopics: number;
}

export interface GrammarQuizSubmission {
  topic_id: string;
  correct_count: number;
  total_questions: number;
  time_spent_seconds: number;
}

export interface GrammarQuizResult {
  score: number;
  xp_awarded: number;
  mastery_updated: number;
  topic_completed: boolean;
  new_mastery: number;
}

export interface PronunciationResult {
  accuracy: number;
  matched_words: string[];
  problem_words: string[];
  tip: string;
}

export interface ArticleResponse {
  title: string;
  content: string;
  word_count: number;
  explanation?: string;
}

export interface DailyBreakdownItem {
  date: string;
  minutes: number;
  drills: number;
}

export interface UserProgressResponse {
  streak_days: number;
  fluency_score: number;
  total_words: number;
  words_mastered: number;
  weekly_minutes: number;
  today_minutes: number;
  goal_progress: number;
  daily_breakdown: DailyBreakdownItem[];
  level: string;
  srs_due_count?: number;
  curriculum_day?: number;
  curriculum_phase?: string;
  seriousness_score?: number;
  xp?: number;
  xp_level?: number;
}

export interface TrendStats {
  total_minutes: number;
  total_drills: number;
  total_sessions: number;
  avg_score: number | null;
}

export interface TrendsResponse {
  current_period: TrendStats;
  previous_period: TrendStats;
  deltas: {
    minutes: number | null;
    drills: number | null;
    sessions: number | null;
    avg_score: number | null;
  };
}

export interface SRSCardOut {
  id: string;
  word: string;
  card_type: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  last_quality: number;
}

export interface SRSDueResponse {
  cards: SRSCardOut[];
  total_due: number;
}

export interface SRSStatsResponse {
  total_cards: number;
  due_today: number;
  mastered: number;
  learning: number;
  new: number;
}

export interface CurriculumTaskOut {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  duration_minutes: number;
  xp_reward: number;
  completed: boolean;
  screen: string;
  theme?: string;
  topic?: string;
  level?: string;
}

export interface CurriculumTodayResponse {
  day_number: number;
  week_number: number;
  phase: string;
  difficulty_level: number;
  morning_tasks: CurriculumTaskOut[];
  evening_tasks: CurriculumTaskOut[];
  total_xp: number;
  completed_xp: number;
  plan_progress: number;
}

export interface CurriculumProgressResponse {
  current_day: number;
  total_days: number;
  phase: string;
  phase_progress: number;
  overall_progress: number;
  started_at: string;
  expected_completion: string;
}

export interface XPResponse {
  xp: number;
  level: number;
  xp_for_current_level: number;
  xp_for_next_level: number;
  progress_to_next: number;
  title: string;
}

export interface AchievementOut {
  id: string;
  code: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  threshold: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface AchievementsResponse {
  achievements: AchievementOut[];
  unlocked_count: number;
  total_count: number;
}

export interface ChallengeOut {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xp_reward: number;
  progress: number;
  completed: boolean;
}

export interface ChallengesResponse {
  challenges: ChallengeOut[];
}

export interface UserSettingsOut {
  morning_reminder_time: string;
  evening_reminder_time: string;
  reminders_enabled: boolean;
  daily_goal_minutes: number;
  daily_goal_drills: number;
  preferred_themes: string[];
  gemini_api_key?: string | null;
  openrouter_api_key?: string | null;
  groq_api_key?: string | null;
}

export interface UserSettingsUpdate {
  morning_reminder_time?: string;
  evening_reminder_time?: string;
  reminders_enabled?: boolean;
  daily_goal_minutes?: number;
  daily_goal_drills?: number;
  preferred_themes?: string[];
  gemini_api_key?: string | null;
  openrouter_api_key?: string | null;
  groq_api_key?: string | null;
}

export interface HeatmapDay {
  date: string;
  minutes: number;
  intensity: number; // 0 to 4
}

export interface SeriousnessResponse {
  score: number;
  login_consistency: number;
  completion_rate: number;
  session_depth: number;
  streak_bonus: number;
  label: string;
}

/* ------------------------------------------------------------------ */
/*  Coach Module Types                                                 */
/* ------------------------------------------------------------------ */

export interface TechArticleResponse {
  title: string;
  content: string;
  key_tradeoffs: string[];
  executive_summary: string;
  discussion_prompt: string;
  vocabulary_highlights: string[];
}

export interface TongueTwisterItem {
  text: string;
  focus_sounds: string[];
  tip: string;
  audio_url?: string;
}

export interface TongueTwisterResponse {
  level: string;
  warm_up: string;
  warm_up_audio?: string;
  twisters: TongueTwisterItem[];
  challenge: string;
  challenge_audio?: string;
}

export interface CorporatePhrase {
  weak: string;
  strong: string;
  context: string;
  category: string;
}

export interface CorporatePhrasesResponse {
  phrases: CorporatePhrase[];
  scenario: string;
}

/* ------------------------------------------------------------------ */
/*  Cognitive Engine Types                                             */
/* ------------------------------------------------------------------ */

export interface EtymologyPartOut {
  id: string;
  part_type: 'prefix' | 'root' | 'suffix';
  morpheme: string;
  meaning: string;
  domain: string | null;
  example_word: string | null;
}

export interface ThemeOut {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  accent_color: string | null;
}

export interface VocabularyNodeOut {
  id: string;
  word: string;
  definition: string | null;
  difficulty: number;
  visual_url: string | null;
  context_sentence: string | null;
  root: EtymologyPartOut | null;
  prefix: EtymologyPartOut | null;
  suffix: EtymologyPartOut | null;
  word_family_name: string | null;
  mnemonic_text: string | null;
  mnemonic_image_url: string | null;
  intensity: number | null;
  theme_id: string | null;
  synonyms: string[];
  antonyms: string[];
}

export interface WordFamilyOut {
  id: string;
  name: string;
  theme: string | null;
  theme_id: string | null;
  base_meaning: string | null;
  fluency_tier: string | null;
  words: VocabularyNodeOut[];
}

export interface LibraryBookOut {
  id: string;
  title: string;
  author: string | null;
  track: 'mastery' | 'storytelling';
  cover_url: string | null;
  content_url: string | null;
  is_public_domain: boolean;
  accent_color: string;
  sort_order: number;
  description: string | null;
  chapter_count: number;
}

export interface CognitiveSrsOut {
  id: string;
  vocabulary_node_id: string;
  stage: number;
  next_review_at: string;
  last_reviewed_at: string | null;
  total_reviews: number;
  total_lapses: number;
  ease_factor: number;
  repetitions: number;
  interval_days: number;
  word: VocabularyNodeOut | null;
}

export interface JournalEntryOut {
  id: string;
  vocabulary_node_id: string | null;
  personal_sentence: string;
  emotion_tag: string | null;
  source: string;
  created_at: string;
  spoken_aloud: boolean;
  spoken_at: string | null;
  word: VocabularyNodeOut | null;
}

export interface StoryWordLinkOut {
  node_id: string;
  highlighted_phrase: string | null;
  node: VocabularyNodeOut | null;
}

export interface StoryMnemonicOut {
  id: string;
  title: string;
  body: string;
  is_system: boolean;
  links: StoryWordLinkOut[];
}

export interface FavoriteEntryOut {
  id: string;
  list_id: string;
  node_id: string | null;
  word: string;
  letter: string;
  mastered: boolean;
  node: VocabularyNodeOut | null;
}

export interface ChallengeDayOut {
  id: string;
  day_number: number;
  root_part_ids: string[];
}

export interface CognitiveChallengeOut {
  id: string;
  title: string;
  subtitle: string | null;
  total_days: number;
  daily_minutes: number;
  theme_id: string | null;
  days: ChallengeDayOut[];
}

export interface UserChallengeProgressOut {
  id: string;
  challenge_id: string;
  current_day: number;
  completed_days: number[];
  started_at: string;
  last_active: string | null;
}


/* ------------------------------------------------------------------ */
/*  Error                                                              */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(`API Error ${status}: ${body?.detail || body?.message || 'Unknown'}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // Cache GET requests for 60 seconds for instant load

async function request<T>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const method = (opts.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const url = `${BASE_URL}${path}`;

  // State-changing requests invalidate the cache
  if (!isGet) {
    requestCache.clear();
  }

  // Check cache for GET requests
  if (isGet) {
    const cached = requestCache.get(url);
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return Promise.resolve(cached.data as T);
    }
  }

  const headers: Record<string, string> = {
    'Bypass-Tunnel-Reminder': 'true',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(opts.headers as Record<string, string> | undefined),
  };

  if (!(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, { ...opts, headers });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 401) {
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
      }
      throw new ApiError(res.status, json);
    }

    // Save successful GET requests to cache
    if (isGet) {
      requestCache.set(url, { data: json, timestamp: Date.now() });
    }

    return json as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, { message: (err as Error).message });
  }
}

/* ------------------------------------------------------------------ */
/*  Endpoints                                                          */
/* ------------------------------------------------------------------ */

export const api = {
  /* auth */
  register: (email: string, name: string, password: string) =>
    request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    }),

  login: (email: string, password: string) =>
    request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<UserOut>('/auth/me'),

  /* vocab */
  getVocabThemes: () =>
    request<{ themes: string[] }>('/vocab/themes'),

  getVocabDeck: (theme: string = 'corporate', count: number = 8) =>
    request<VocabDeckResponse>(`/vocab/deck?theme=${encodeURIComponent(theme)}&count=${count}`),

  markVocabMastered: (word: string) =>
    request<{ status: string; word: string; mastered: boolean }>('/vocab/mastered', {
      method: 'POST',
      body: JSON.stringify({ word }),
    }),

  getVocabCardDetails: (word: string) =>
    request<any>(`/vocab/card/${encodeURIComponent(word)}`),

  getVisualVocab: () =>
    request<{ cards: VisualVocabCard[] }>('/vocab/visual'),

  /* grammar */
  getGrammarTopics: () =>
    request<GrammarTopicsResponse>('/grammar/topics'),

  generateGrammarLesson: (topic: string, level: string = 'intermediate') =>
    request<GrammarLessonResponse>('/grammar/lesson', {
      method: 'POST',
      body: JSON.stringify({ topic, level }),
    }),

  submitGrammarQuiz: (submission: GrammarQuizSubmission) =>
    request<GrammarQuizResult>('/grammar/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(submission),
    }),

  getGrammarProgress: () =>
    request<{
      totalTopics: number;
      topicsAttempted: number;
      topicsCompleted: number;
      averageScore: number;
      overallMastery: number;
    }>('/grammar/progress'),

  /* pronunciation */
  evaluatePronunciation: async (audioUri: string, target: string) => {
    const formData = new FormData();
    const uriParts = audioUri.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'm4a';

    formData.append('target', target);

    if (Platform.OS === 'web') {
      try {
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append('audio', blob, `audio.${fileType}`);
      } catch (err) {
        console.error('Failed to convert uri to blob on web:', err);
        formData.append('audio', audioUri);
      }

      return request<PronunciationResult>('/pronunciation/evaluate', {
        method: 'POST',
        body: formData,
      });
    } else {
      // Use XMLHttpRequest on iOS and Android native platforms.
      // This bypasses modern React Native 0.85+ WinterCG fetch constraints
      // and natively handles { uri, name, type } multipart uploads without ArrayBuffer conversion errors.
      const fileObj = {
        uri: audioUri,
        name: `audio.${fileType}`,
        type: `audio/${fileType}`,
      };
      formData.append('audio', fileObj as any);

      return new Promise<PronunciationResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/pronunciation/evaluate`);

        xhr.setRequestHeader('Bypass-Tunnel-Reminder', 'true');
        const token = getAuthToken();
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.onload = () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } else {
              let body: any = null;
              try {
                body = JSON.parse(xhr.responseText);
              } catch (e) {}
              reject(new ApiError(xhr.status, body || { detail: 'Upload failed' }));
            }
          } catch (e) {
            reject(e);
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network request failed'));
        };

        xhr.send(formData);
      });
    }
  },

  /* articles / teleprompter */
  getRandomArticle: (level: string = 'advanced', day?: number) =>
    request<ArticleResponse>(`/articles/random?level=${level}${day !== undefined ? `&day=${day}` : ''}`),

  /* progress & session tracking */
  getProgress: () => request<UserProgressResponse>('/progress/me'),

  getTrends: () => request<TrendsResponse>('/progress/trends'),

  getActivityHeatmap: (days: number = 90) =>
    request<HeatmapDay[]>(`/progress/heatmap?days=${days}`),

  getSeriousnessScore: () =>
    request<SeriousnessResponse>('/progress/seriousness'),

  getContentRecommendation: () =>
    request<{ message: string }>('/progress/recommendation'),

  logSession: (sessionType: 'vocab' | 'grammar' | 'pronunciation' | 'tutor', duration: number, score?: number) =>
    request<{ session_id: string; streak_days: number; today_minutes: number }>('/progress/session', {
      method: 'POST',
      body: JSON.stringify({ session_type: sessionType, duration, score }),
    }),

  /* tutor chat */
  tutorChat: (history: { role: 'user' | 'assistant'; content: string }[], message: string) =>
    request<{ reply: string }>('/tutor/chat', {
      method: 'POST',
      body: JSON.stringify({ history, message }),
    }),

  /* srs (spaced repetition) */
  getSrsDue: (limit: number = 20) =>
    request<SRSDueResponse>(`/srs/due?limit=${limit}`),

  reviewSrsCard: (word: string, quality: number) =>
    request<{
      word: string;
      ease_factor: number;
      interval_days: number;
      repetitions: number;
      next_review: string;
    }>('/srs/review', {
      method: 'POST',
      body: JSON.stringify({ word, quality }),
    }),

  getSrsStats: () =>
    request<SRSStatsResponse>('/srs/stats'),

  /* curriculum */
  getCurriculumToday: () =>
    request<CurriculumTodayResponse>('/curriculum/today'),

  getCurriculumProgress: () =>
    request<CurriculumProgressResponse>('/curriculum/progress'),

  completeCurriculumTask: (taskId: string) =>
    request<{
      task_id: string;
      already_completed: boolean;
      day_complete: boolean;
      current_day: number;
      xp_awarded: number;
      xp_state: any;
    }>('/curriculum/complete', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId }),
    }),

  setCurrentDay: (dayNumber: number) =>
    request<{ success: boolean; current_day: number; phase: string }>(
      `/curriculum/set-day?day_number=${dayNumber}`,
      { method: 'POST' }
    ),

  /* gamification */
  getXpState: () =>
    request<XPResponse>('/gamification/xp'),

  getAchievements: () =>
    request<AchievementsResponse>('/gamification/achievements'),

  getChallenges: () =>
    request<ChallengesResponse>('/gamification/challenges'),

  /* settings */
  getSettings: () =>
    request<UserSettingsOut>('/settings/me'),

  updateSettings: (settings: UserSettingsUpdate) =>
    request<UserSettingsOut>('/settings/me', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  getNotificationSchedule: () =>
    request<{ schedule: any[]; reminders_enabled: boolean }>('/settings/schedule'),

  /* coach module */
  getTechArticle: () =>
    request<TechArticleResponse>('/coach/tech-article'),

  getTongueTwister: (level: string = 'intermediate') =>
    request<TongueTwisterResponse>(`/coach/tongue-twister?level=${level}`),

  getCorporatePhrases: () =>
    request<CorporatePhrasesResponse>('/coach/corporate-phrases'),

  /* cognitive engine */
  getCognitiveLibrary: () =>
    request<LibraryBookOut[]>('/cognitive/library'),

  getCognitiveBook: (bookId: string) =>
    request<LibraryBookOut>(`/cognitive/library/${bookId}`),

  getWordEtymology: (word: string) =>
    request<VocabularyNodeOut | null>(`/cognitive/etymology/${encodeURIComponent(word)}`),

  getWordFamilies: () =>
    request<WordFamilyOut[]>('/cognitive/word-families'),

  getCognitiveSrsDue: (limit: number = 20) =>
    request<CognitiveSrsOut[]>(`/cognitive/srs/due?limit=${limit}`),

  reviewCognitiveSrs: (nodeId: string, quality: number) =>
    request<CognitiveSrsOut>('/cognitive/srs/review', {
      method: 'POST',
      body: JSON.stringify({ node_id: nodeId, quality }),
    }),

  enqueueCognitiveWord: (nodeId: string) =>
    request<CognitiveSrsOut>('/cognitive/srs/enqueue', {
      method: 'POST',
      body: JSON.stringify({ node_id: nodeId }),
    }),

  getJournal: () =>
    request<JournalEntryOut[]>('/cognitive/journal'),

  createJournalEntry: (vocabularyNodeId: string | null, personalSentence: string, emotionTag: string | null, source: string = 'manual') =>
    request<JournalEntryOut>('/cognitive/journal', {
      method: 'POST',
      body: JSON.stringify({
        vocabulary_node_id: vocabularyNodeId,
        personal_sentence: personalSentence,
        emotion_tag: emotionTag,
        source,
      }),
    }),

  markJournalEntrySpoken: (journalId: string) =>
    request<JournalEntryOut>(`/cognitive/journal/${journalId}/spoken`, {
      method: 'POST',
    }),

  getThemes: () =>
    request<ThemeOut[]>('/cognitive/themes'),

  getThemeFamilies: (themeId: string) =>
    request<WordFamilyOut[]>(`/cognitive/themes/${themeId}/families`),

  getCognitiveChallenges: () =>
    request<CognitiveChallengeOut[]>('/cognitive/challenges'),

  startChallenge: (challengeId: string) =>
    request<UserChallengeProgressOut>(`/cognitive/challenges/${challengeId}/start`, {
      method: 'POST',
    }),

  completeChallengeDay: (challengeId: string, dayNum: number) =>
    request<UserChallengeProgressOut>(`/cognitive/challenges/${challengeId}/day/${dayNum}/complete`, {
      method: 'POST',
    }),

  getFavorites: () =>
    request<FavoriteEntryOut[]>('/cognitive/favorites'),

  addFavorite: (word: string, letter: string, nodeId: string | null) =>
    request<FavoriteEntryOut>('/cognitive/favorites', {
      method: 'POST',
      body: JSON.stringify({ word, letter, node_id: nodeId }),
    }),

  toggleFavoriteMastered: (entryId: string) =>
    request<FavoriteEntryOut>(`/cognitive/favorites/${entryId}/master`, {
      method: 'POST',
    }),

  getStories: () =>
    request<StoryMnemonicOut[]>('/cognitive/stories'),

  getStory: (storyId: string) =>
    request<StoryMnemonicOut>(`/cognitive/stories/${storyId}`),
} as const;

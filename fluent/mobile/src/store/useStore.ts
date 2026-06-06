import { create } from 'zustand';
import { api, setAuthToken } from '../api/client';
import type {
  FlashCard,
  CurriculumTaskOut,
  AchievementOut,
  ChallengeOut,
  UserSettingsOut,
  UserSettingsUpdate,
  XPResponse,
  SRSCardOut,
  VisualVocabCard,
  GrammarTopicsResponse,
  GrammarQuizSubmission,
  GrammarQuizResult,
} from '../api/client';

/* ------------------------------------------------------------------ */
/*  Fallback flashcard deck                                            */
/* ------------------------------------------------------------------ */

const FALLBACK_CARDS: FlashCard[] = [
  {
    word: 'Synergy',
    ipa: '/ˈsɪn.ər.dʒi/',
    definition:
      'The combined effect of a group that exceeds the sum of individual efforts.',
    example:
      'The synergy between the design and engineering teams led to a breakthrough product.',
  },
  {
    word: 'Leverage',
    ipa: '/ˈlev.ər.ɪdʒ/',
    definition:
      'To use a resource or advantage to its maximum potential.',
    example:
      'We should leverage our existing client relationships to expand into the new market.',
  },
  {
    word: 'Streamline',
    ipa: '/ˈstriːm.laɪn/',
    definition:
      'To make a process or system more efficient by simplifying it.',
    example:
      'The new software will streamline our onboarding process significantly.',
  },
  {
    word: 'Stakeholder',
    ipa: '/ˈsteɪk.hoʊl.dər/',
    definition:
      'A person or group with an interest or concern in a business or project.',
    example:
      'All key stakeholders were invited to review the quarterly results.',
  },
  {
    word: 'Bandwidth',
    ipa: '/ˈbænd.wɪdθ/',
    definition:
      'The capacity to handle tasks or workload at a given time.',
    example:
      "I don't have the bandwidth to take on another project this sprint.",
  },
  {
    word: 'Pivot',
    ipa: '/ˈpɪv.ət/',
    definition:
      'To fundamentally change the direction or strategy of a business.',
    example:
      'After the initial launch failed, the startup decided to pivot to a B2B model.',
  },
  {
    word: 'Scalable',
    ipa: '/ˈskeɪ.lə.bəl/',
    definition:
      'Capable of being expanded or adapted to handle growth.',
    example:
      'We need a scalable infrastructure that can support ten times our current user base.',
  },
  {
    word: 'Onboard',
    ipa: '/ˈɒn.bɔːrd/',
    definition:
      'To integrate a new employee or client into an organisation or system.',
    example:
      'HR will onboard the new hires with a two-week training programme.',
  },
].map((c, idx) => ({ ...c, id: (idx + 1).toString() }));

export interface FlashCardDeck {
  id: string;
  title: string;
  emoji: string;
  cards: FlashCard[];
  progress: number;
}

/* ------------------------------------------------------------------ */
/*  Toast state                                                        */
/* ------------------------------------------------------------------ */

export interface ToastData {
  id: string;
  emoji: string;
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

interface StoreState {
  /* auth state */
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  autoAuthenticate: () => Promise<void>;

  /* general loading state */
  isLoadingData: boolean;

  /* user */
  name: string;
  initials: string;
  level: number;

  /* stats */
  streak: number;
  fluency: number;
  words: number;
  minutesWeek: number;
  goalProgress: number;
  dailyMinutes: number[];
  masteredToday: number;

  /* trends */
  trends: {
    minutesDelta: number | null;
    drillsDelta: number | null;
    sessionsDelta: number | null;
    avgScoreDelta: number | null;
  };

  /* intelligence / curriculum state */
  curriculumDay: number;
  curriculumPhase: string;
  srsDueCount: number;
  xp: number;
  xpLevel: number;
  xpLevelTitle: string;
  xpProgress: number; // 0 to 1
  xpNextThreshold: number;
  seriousnessScore: number;
  seriousnessLabel: string;
  dailyPlanProgress: number;
  morningTasks: CurriculumTaskOut[];
  eveningTasks: CurriculumTaskOut[];
  achievements: AchievementOut[];
  challenges: ChallengeOut[];
  userSettings: UserSettingsOut | null;
  vocabThemes: string[];

  /* vocab */
  deck: FlashCardDeck;
  currentCardIndex: number;
  knownIds: Set<string>;
  visualCards: VisualVocabCard[];
  advanceCard: () => void;
  markKnown: (id: string) => void;
  markAgain: () => void;
  resetDeck: () => void;

  /* grammar */
  grammarTopics: GrammarTopicsResponse | null;
  fetchGrammarTopics: () => Promise<void>;
  submitGrammarQuiz: (submission: GrammarQuizSubmission) => Promise<GrammarQuizResult | null>;

  /* fetch actions */
  fetchProgress: () => Promise<void>;
  fetchVocabDeck: (theme?: string, count?: number) => Promise<void>;
  fetchVisualVocab: () => Promise<void>;
  logPracticeSession: (sessionType: 'vocab' | 'grammar' | 'pronunciation' | 'tutor', duration: number, score?: number) => Promise<void>;
  markCardMastered: (word: string) => Promise<void>;

  /* fetch actions for intelligence */
  fetchCurriculumToday: () => Promise<void>;
  completeCurriculumTask: (taskId: string) => Promise<void>;
  fetchXpState: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchChallenges: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: UserSettingsUpdate) => Promise<void>;
  fetchVocabThemes: () => Promise<void>;
  submitSrsReview: (word: string, quality: number) => Promise<void>;
  setCurrentDay: (dayNumber: number) => Promise<void>;

  /* toast */
  toast: ToastData | null;
  showToast: (emoji: string, message: string) => void;
  clearToast: () => void;

  /* confetti */
  confettiVisible: boolean;
  fireConfetti: () => void;
  clearConfetti: () => void;
}

const scaleFluency = (score: number) => (score > 10 ? Math.round((score / 10) * 10) / 10 : score);

export const useStore = create<StoreState>((set, get) => ({
  /* auth state */
  token: null,
  isAuthenticated: false,
  isLoadingAuth: false,
  isLoadingData: false,

  /* user */
  name: 'Aarav Kapoor',
  initials: 'AK',
  level: 7,

  /* stats */
  streak: 24,
  fluency: 8.4,
  words: 1240,
  minutesWeek: 186,
  goalProgress: 0.78,
  dailyMinutes: [40, 62, 50, 78, 66, 90, 100],
  masteredToday: 0,

  /* trends */
  trends: {
    minutesDelta: 12,
    drillsDelta: 8,
    sessionsDelta: 15,
    avgScoreDelta: 4,
  },

  /* intelligence state */
  curriculumDay: 24,
  curriculumPhase: 'foundation',
  srsDueCount: 10,
  xp: 2700,
  xpLevel: 8,
  xpLevelTitle: 'Expert',
  xpProgress: 0.5,
  xpNextThreshold: 3800,
  seriousnessScore: 82,
  seriousnessLabel: 'Obsessed',
  dailyPlanProgress: 0.33,
  morningTasks: [],
  eveningTasks: [],
  achievements: [],
  challenges: [],
  userSettings: null,
  vocabThemes: [
    'corporate',
    'technology',
    'academic',
    'travel',
    'medical',
    'legal',
    'finance',
    'science',
    'arts',
    'daily_life',
  ],

  /* vocab */
  deck: {
    id: 'corporate-vocab',
    title: 'Corporate Vocab',
    emoji: '💼',
    cards: FALLBACK_CARDS,
    progress: 0,
  },
  currentCardIndex: 0,
  knownIds: new Set<string>(),
  visualCards: [],
  grammarTopics: null,

  advanceCard: () => {
    const { currentCardIndex, deck } = get();
    if (currentCardIndex < deck.cards.length - 1) {
      set({ currentCardIndex: currentCardIndex + 1 });
    }
  },

  markKnown: (id: string) => {
    const s = get();
    const card = s.deck.cards.find((c) => c.id === id);
    if (card) {
      s.markCardMastered(card.word);
    }
    const next = new Set(s.knownIds);
    next.add(id);
    const progress = next.size / s.deck.cards.length;
    set({
      knownIds: next,
      masteredToday: s.masteredToday + 1,
      deck: { ...s.deck, progress },
    });
    s.advanceCard();
  },

  markAgain: () => {
    get().advanceCard();
  },

  resetDeck: () => {
    set({ currentCardIndex: 0, knownIds: new Set() });
  },

  /* auto authenticate workflow */
  autoAuthenticate: async () => {
    set({ isLoadingAuth: true });
    try {
      // 1. Try to login
      const res = await api.login('demo@fluent.app', 'demo123');
      setAuthToken(res.access_token);
      set({ token: res.access_token, isAuthenticated: true, isLoadingAuth: false });
      // Fetch initial data in parallel
      await Promise.all([
        get().fetchProgress(),
        get().fetchVocabDeck(),
        get().fetchCurriculumToday(),
        get().fetchXpState(),
        get().fetchChallenges(),
        get().fetchSettings(),
        get().fetchAchievements(),
        get().fetchVocabThemes(),
        get().fetchGrammarTopics(),
      ]);
    } catch (err: any) {
      // 2. Register if the account doesn't exist
      if (err.status === 401 || err.status === 404 || err.status === 0 || err.status === 422) {
        try {
          const regRes = await api.register('demo@fluent.app', 'Aarav Kapoor', 'demo123');
          setAuthToken(regRes.access_token);
          set({ token: regRes.access_token, isAuthenticated: true, isLoadingAuth: false });
          // Fetch initial data in parallel
          await Promise.all([
            get().fetchProgress(),
            get().fetchVocabDeck(),
            get().fetchCurriculumToday(),
            get().fetchXpState(),
            get().fetchChallenges(),
            get().fetchSettings(),
            get().fetchAchievements(),
            get().fetchVocabThemes(),
            get().fetchGrammarTopics(),
          ]);
        } catch (regErr) {
          console.error('Registration failed:', regErr);
          set({ isLoadingAuth: false });
        }
      } else {
        console.error('Login failed:', err);
        set({ isLoadingAuth: false });
      }
    }
  },

  /* fetch actions */
  fetchProgress: async () => {
    set({ isLoadingData: true });
    try {
      const stats = await api.getProgress();
      const trendsRes = await api.getTrends().catch(() => null);

      const mappedLevel =
        stats.level === 'intermediate' ? 7 : stats.level === 'advanced' ? 9 : 5;

      set({
        streak: stats.streak_days,
        fluency: scaleFluency(stats.fluency_score),
        words: stats.total_words,
        minutesWeek: stats.weekly_minutes,
        goalProgress: stats.goal_progress / 100,
        dailyMinutes: stats.daily_breakdown.map((d) => d.minutes),
        level: mappedLevel,
        srsDueCount: stats.srs_due_count ?? get().srsDueCount,
        curriculumDay: stats.curriculum_day ?? get().curriculumDay,
        curriculumPhase: stats.curriculum_phase ?? get().curriculumPhase,
        seriousnessScore: stats.seriousness_score ?? get().seriousnessScore,
        xp: stats.xp ?? get().xp,
        xpLevel: stats.xp_level ?? get().xpLevel,
        trends: {
          minutesDelta: trendsRes?.deltas?.minutes ?? 12,
          drillsDelta: trendsRes?.deltas?.drills ?? 8,
          sessionsDelta: trendsRes?.deltas?.sessions ?? 15,
          avgScoreDelta: trendsRes?.deltas?.avg_score ?? 4,
        },
        isLoadingData: false,
      });
    } catch (err) {
      console.error('Failed to fetch progress stats:', err);
      set({ isLoadingData: false });
    }
  },

  fetchVocabDeck: async (theme = 'corporate', count = 8) => {
    try {
      const res = await api.getVocabDeck(theme, count);
      const cards = res.cards.map((c, idx) => ({
        ...c,
        id: (idx + 1).toString(),
      }));
      set({
        deck: {
          id: `${theme.toLowerCase()}-vocab`,
          title: theme.charAt(0).toUpperCase() + theme.slice(1) + ' Vocab',
          emoji: theme.toLowerCase() === 'corporate' ? '💼' : '📚',
          cards,
          progress: 0,
        },
        currentCardIndex: 0,
        knownIds: new Set<string>(),
      });
    } catch (err) {
      console.error('Failed to fetch vocab deck:', err);
    }
  },

  fetchVisualVocab: async () => {
    try {
      const res = await api.getVisualVocab();
      set({ visualCards: res.cards });
    } catch (err) {
      console.error('Failed to fetch visual vocab cards:', err);
    }
  },

  markCardMastered: async (word: string) => {
    try {
      await api.markVocabMastered(word);
      // Update statistics after mastering a card
      await get().fetchProgress();
    } catch (err) {
      console.error('Failed to mark card as mastered:', err);
    }
  },

  logPracticeSession: async (sessionType, duration, score) => {
    try {
      await api.logSession(sessionType, duration, score);
      await get().fetchProgress();
    } catch (err) {
      console.error('Failed to log practice session:', err);
    }
  },

  /* intelligence / curriculum / gamification / settings actions */
  fetchCurriculumToday: async () => {
    try {
      const today = await api.getCurriculumToday();
      set({
        curriculumDay: today.day_number,
        curriculumPhase: today.phase,
        morningTasks: today.morning_tasks,
        eveningTasks: today.evening_tasks,
        dailyPlanProgress: today.plan_progress,
      });
    } catch (err) {
      console.error('Failed to fetch curriculum today:', err);
    }
  },

  completeCurriculumTask: async (taskId: string) => {
    try {
      const res = await api.completeCurriculumTask(taskId);
      if (res.xp_awarded > 0) {
        get().showToast('✨', `+${res.xp_awarded} XP Completed!`);
        get().fireConfetti();
      }
      await Promise.all([
        get().fetchCurriculumToday(),
        get().fetchProgress(),
        get().fetchXpState(),
        get().fetchChallenges(),
      ]);
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  },

  fetchXpState: async () => {
    try {
      const xpState = await api.getXpState();
      set({
        xp: xpState.xp,
        xpLevel: xpState.level,
        xpLevelTitle: xpState.title,
        xpProgress: xpState.progress_to_next,
        xpNextThreshold: xpState.xp_for_next_level,
      });
    } catch (err) {
      console.error('Failed to fetch XP state:', err);
    }
  },

  fetchAchievements: async () => {
    try {
      const res = await api.getAchievements();
      set({ achievements: res.achievements });
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    }
  },

  fetchChallenges: async () => {
    try {
      const res = await api.getChallenges();
      set({ challenges: res.challenges });
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    }
  },

  fetchSettings: async () => {
    try {
      const settings = await api.getSettings();
      set({ userSettings: settings });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  },

  updateSettings: async (settings: UserSettingsUpdate) => {
    try {
      const updated = await api.updateSettings(settings);
      set({ userSettings: updated });
      get().showToast('⚙️', 'Settings updated successfully');
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      get().showToast('❌', err.message || 'Failed to update settings');
    }
  },

  fetchGrammarTopics: async () => {
    try {
      const res = await api.getGrammarTopics();
      set({ grammarTopics: res });
    } catch (err) {
      console.error('Failed to fetch grammar topics:', err);
    }
  },

  submitGrammarQuiz: async (submission: GrammarQuizSubmission) => {
    try {
      const res = await api.submitGrammarQuiz(submission);
      if (res.topic_completed || res.score === 100) {
        get().fireConfetti();
      }
      get().showToast('📝', `Quiz completed! Score: ${res.score}%`);
      await Promise.all([
        get().fetchGrammarTopics(),
        get().fetchProgress(),
        get().fetchChallenges(),
      ]);
      return res;
    } catch (err: any) {
      console.error('Failed to submit grammar quiz:', err);
      get().showToast('❌', err.message || 'Failed to submit quiz');
      return null;
    }
  },

  fetchVocabThemes: async () => {
    try {
      const res = await api.getVocabThemes();
      set({ vocabThemes: res.themes });
    } catch (err) {
      console.error('Failed to fetch vocab themes:', err);
    }
  },

  submitSrsReview: async (word: string, quality: number) => {
    try {
      await api.reviewSrsCard(word, quality);
      get().showToast('🧠', `Reviewed "${word}"!`);
      await get().fetchProgress();
      await get().fetchChallenges();
    } catch (err) {
      console.error('Failed to submit SRS review:', err);
    }
  },

  setCurrentDay: async (dayNumber: number) => {
    try {
      const res = await api.setCurrentDay(dayNumber);
      set({
        curriculumDay: res.current_day,
        curriculumPhase: res.phase,
      });
      await Promise.all([
        get().fetchCurriculumToday(),
        get().fetchProgress(),
      ]);
    } catch (err) {
      console.error('Failed to set current day:', err);
    }
  },

  /* toast */
  toast: null,
  showToast: (emoji, message) =>
    set({ toast: { id: Date.now().toString(), emoji, message } }),
  clearToast: () => set({ toast: null }),

  /* confetti */
  confettiVisible: false,
  fireConfetti: () => set({ confettiVisible: true }),
  clearConfetti: () => set({ confettiVisible: false }),
}));

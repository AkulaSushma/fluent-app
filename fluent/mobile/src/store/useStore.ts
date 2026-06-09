import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken, onUnauthorized } from '../api/client';
import { scheduleDailyReminders } from '../utils/notifications';
import { queryClient } from '../api/queryClient';
import { prefetchNextDeck } from '../api/queries';
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
  LibraryBookOut,
  VocabularyNodeOut,
  CognitiveSrsOut,
  JournalEntryOut,
  ThemeOut,
  CognitiveChallengeOut,
  UserChallengeProgressOut,
  FavoriteEntryOut,
  StoryMnemonicOut,
  WordFamilyOut,
} from '../api/client';


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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

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

  /* cognitive engine */
  libraryBooks: LibraryBookOut[];
  activeEtymology: VocabularyNodeOut | null;
  cognitiveSrsDue: CognitiveSrsOut[];
  journalEntries: JournalEntryOut[];
  themes: ThemeOut[];
  cognitiveChallenges: CognitiveChallengeOut[];
  challengeProgress: Record<string, UserChallengeProgressOut>;
  favorites: FavoriteEntryOut[];
  stories: StoryMnemonicOut[];
  wordFamilies: WordFamilyOut[];

  fetchLibrary: () => Promise<void>;
  fetchEtymology: (word: string) => Promise<VocabularyNodeOut | null>;
  enqueueCognitiveWord: (nodeId: string) => Promise<void>;
  fetchCognitiveSrsDue: () => Promise<void>;
  reviewCognitiveSrs: (nodeId: string, quality: number) => Promise<void>;
  fetchJournal: () => Promise<void>;
  createJournalEntry: (nodeId: string | null, sentence: string, emotionTag: string | null) => Promise<void>;
  markJournalEntrySpoken: (journalId: string) => Promise<void>;
  fetchThemes: () => Promise<void>;
  fetchThemeFamilies: (themeId: string) => Promise<WordFamilyOut[]>;
  fetchWordFamilies: () => Promise<void>;
  fetchCognitiveChallenges: () => Promise<void>;
  startChallenge: (challengeId: string) => Promise<UserChallengeProgressOut | null>;
  completeChallengeDay: (challengeId: string, dayNum: number) => Promise<UserChallengeProgressOut | null>;
  fetchFavorites: () => Promise<void>;
  addFavorite: (word: string, letter: string, nodeId: string | null) => Promise<void>;
  toggleFavoriteMastered: (entryId: string) => Promise<void>;
  fetchStories: () => Promise<void>;
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
  curriculumDay: 1,
  curriculumPhase: 'foundation',
  srsDueCount: 0,
  xp: 0,
  xpLevel: 1,
  xpLevelTitle: 'Novice',
  xpProgress: 0.0,
  xpNextThreshold: 100,
  seriousnessScore: 0,
  seriousnessLabel: 'Casual',
  dailyPlanProgress: 0.0,
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
    cards: [],
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
      const savedToken = await SecureStore.getItemAsync('user_token');
      if (!savedToken) {
        set({ token: null, isAuthenticated: false, isLoadingAuth: false });
        return;
      }
      setAuthToken(savedToken);

      // Load cached username for instantaneous UI rendering
      const cachedName = await SecureStore.getItemAsync('user_name').catch(() => null);
      if (cachedName) {
        const initials = cachedName
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'US';
        set({ name: cachedName, initials });
      }

      set({ token: savedToken, isAuthenticated: true, isLoadingAuth: false });
      
      // Fetch fresh initial data in parallel
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
      ]).catch(err => {
        console.error('Failed to pre-fetch user state on autoAuthenticate:', err);
      });
    } catch (err: any) {
      console.error('Auto authentication error:', err);
      set({ token: null, isAuthenticated: false, isLoadingAuth: false });
    }
  },

  login: async (email, password) => {
    set({ isLoadingData: true });
    try {
      const res = await api.login(email, password);
      await SecureStore.setItemAsync('user_token', res.access_token);
      setAuthToken(res.access_token);
      
      // Load user profile details first so we have the correct name before showing the home screen
      await get().fetchProgress();

      set({ token: res.access_token, isAuthenticated: true });
      
      // Load remaining app data in the background
      Promise.all([
        get().fetchVocabDeck(),
        get().fetchCurriculumToday(),
        get().fetchXpState(),
        get().fetchChallenges(),
        get().fetchSettings(),
        get().fetchAchievements(),
        get().fetchVocabThemes(),
        get().fetchGrammarTopics(),
      ]).catch(() => {});

      set({ isLoadingData: false });
    } catch (err) {
      set({ isLoadingData: false });
      throw err;
    }
  },

  register: async (email, name, password) => {
    set({ isLoadingData: true });
    try {
      const res = await api.register(email, name, password);
      await SecureStore.setItemAsync('user_token', res.access_token);
      setAuthToken(res.access_token);

      // Pre-save username to SecureStore
      await SecureStore.setItemAsync('user_name', name).catch(() => {});
      const initials = name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'US';
      set({ name, initials });
      
      // Fetch initial progress metrics
      await get().fetchProgress();

      set({ token: res.access_token, isAuthenticated: true });
      
      // Load remaining app data in the background
      Promise.all([
        get().fetchVocabDeck(),
        get().fetchCurriculumToday(),
        get().fetchXpState(),
        get().fetchChallenges(),
        get().fetchSettings(),
        get().fetchAchievements(),
        get().fetchVocabThemes(),
        get().fetchGrammarTopics(),
      ]).catch(() => {});

      set({ isLoadingData: false });
    } catch (err) {
      set({ isLoadingData: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('user_token');
    } catch (e) {
      console.error('Failed to delete stored token:', e);
    }
    setAuthToken(null);
    set({
      token: null,
      isAuthenticated: false,
      userSettings: null,
    });
  },

  /* fetch actions */
  fetchProgress: async () => {
    set({ isLoadingData: true });
    try {
      const stats = await queryClient.fetchQuery({
        queryKey: ['progress_me'],
        queryFn: () => api.getProgress(),
      });
      const user = await queryClient.fetchQuery({
        queryKey: ['user_me'],
        queryFn: () => api.getMe(),
      }).catch(() => null);
      const trendsRes = await queryClient.fetchQuery({
        queryKey: ['progress_trends'],
        queryFn: () => api.getTrends(),
      }).catch(() => null);

      const mappedLevel =
        stats.level === 'intermediate' ? 7 : stats.level === 'advanced' ? 9 : 5;

      let nameState = get().name;
      let initialsState = get().initials;
      if (user && user.name) {
        nameState = user.name;
        initialsState = user.name
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'US';
        // Cache name for instant loading
        await SecureStore.setItemAsync('user_name', user.name).catch(() => {});
      }

      set({
        streak: stats.streak_days,
        fluency: scaleFluency(stats.fluency_score),
        words: stats.total_words,
        minutesWeek: stats.weekly_minutes,
        goalProgress: stats.goal_progress / 100,
        dailyMinutes: stats.daily_breakdown.map((d: any) => d.minutes),
        level: mappedLevel,
        srsDueCount: stats.srs_due_count ?? get().srsDueCount,
        curriculumDay: stats.curriculum_day ?? get().curriculumDay,
        curriculumPhase: stats.curriculum_phase ?? get().curriculumPhase,
        seriousnessScore: stats.seriousness_score ?? get().seriousnessScore,
        xp: stats.xp ?? get().xp,
        xpLevel: stats.xp_level ?? get().xpLevel,
        name: nameState,
        initials: initialsState,
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
      const res = await queryClient.fetchQuery({
        queryKey: ['vocab_deck', theme, count],
        queryFn: () => api.getVocabDeck(theme, count),
      });
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
      // Prefetch the next vocab deck
      const nextTheme = theme === 'corporate' ? 'technology' : 'corporate';
      prefetchNextDeck(queryClient, nextTheme, count);
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
      await get().fetchChallenges();
    } catch (err) {
      console.error('Failed to mark card as mastered:', err);
    }
  },

  logPracticeSession: async (sessionType, duration, score) => {
    try {
      await api.logSession(sessionType, duration, score);
      await get().fetchProgress();
      await get().fetchChallenges();
    } catch (err) {
      console.error('Failed to log practice session:', err);
    }
  },

  /* intelligence / curriculum / gamification / settings actions */
  fetchCurriculumToday: async () => {
    try {
      const today = await queryClient.fetchQuery({
        queryKey: ['curriculum_today'],
        queryFn: () => api.getCurriculumToday(),
      });
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
      if (settings) {
        scheduleDailyReminders(
          settings.morning_reminder_time,
          settings.evening_reminder_time,
          settings.reminders_enabled
        ).catch((err) => console.warn('Failed to schedule local reminders:', err));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  },

  updateSettings: async (settings: UserSettingsUpdate) => {
    try {
      const updated = await api.updateSettings(settings);
      set({ userSettings: updated });
      get().showToast('⚙️', 'Settings updated successfully');
      if (updated) {
        scheduleDailyReminders(
          updated.morning_reminder_time,
          updated.evening_reminder_time,
          updated.reminders_enabled
        ).catch((err) => console.warn('Failed to schedule local reminders:', err));
      }
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

  /* cognitive engine state & actions */
  libraryBooks: [],
  activeEtymology: null,
  cognitiveSrsDue: [],
  journalEntries: [],
  themes: [],
  cognitiveChallenges: [],
  challengeProgress: {},
  favorites: [],
  stories: [],
  wordFamilies: [],

  fetchLibrary: async () => {
    try {
      const books = await api.getCognitiveLibrary();
      set({ libraryBooks: books });
    } catch (err) {
      console.error('Failed to fetch library:', err);
    }
  },

  fetchEtymology: async (word: string) => {
    try {
      const node = await api.getWordEtymology(word);
      set({ activeEtymology: node });
      return node;
    } catch (err) {
      console.error('Failed to fetch etymology:', err);
      set({ activeEtymology: null });
      return null;
    }
  },

  enqueueCognitiveWord: async (nodeId: string) => {
    try {
      await api.enqueueCognitiveWord(nodeId);
      get().showToast('🧠', 'Word added to Memory Loop!');
    } catch (err) {
      console.error('Failed to enqueue word:', err);
    }
  },

  fetchCognitiveSrsDue: async () => {
    try {
      const due = await api.getCognitiveSrsDue();
      set({ cognitiveSrsDue: due });
    } catch (err) {
      console.error('Failed to fetch cognitive SRS due:', err);
    }
  },

  reviewCognitiveSrs: async (nodeId: string, quality: number) => {
    try {
      await api.reviewCognitiveSrs(nodeId, quality);
      const text = quality >= 3 ? 'Word advancing!' : 'Word reset to Day 1';
      get().showToast(quality >= 3 ? '✅' : '🔄', text);
      await get().fetchCognitiveSrsDue();
    } catch (err) {
      console.error('Failed to review cognitive SRS:', err);
    }
  },

  fetchJournal: async () => {
    try {
      const entries = await api.getJournal();
      set({ journalEntries: entries });
    } catch (err) {
      console.error('Failed to fetch journal:', err);
    }
  },

  createJournalEntry: async (nodeId: string | null, sentence: string, emotionTag: string | null) => {
    try {
      await api.createJournalEntry(nodeId, sentence, emotionTag);
      get().showToast('📝', 'Journal entry saved!');
      await get().fetchJournal();
    } catch (err) {
      console.error('Failed to create journal entry:', err);
    }
  },

  markJournalEntrySpoken: async (journalId: string) => {
    try {
      await api.markJournalEntrySpoken(journalId);
      get().showToast('🗣️', 'Spoken aloud count updated!');
      await get().fetchJournal();
    } catch (err) {
      console.error('Failed to mark journal entry as spoken:', err);
    }
  },

  fetchThemes: async () => {
    try {
      const themes = await api.getThemes();
      set({ themes });
    } catch (err) {
      console.error('Failed to fetch themes:', err);
    }
  },

  fetchThemeFamilies: async (themeId: string) => {
    try {
      return await api.getThemeFamilies(themeId);
    } catch (err) {
      console.error('Failed to fetch theme families:', err);
      return [];
    }
  },

  fetchCognitiveChallenges: async () => {
    try {
      const challenges = await api.getCognitiveChallenges();
      set({ cognitiveChallenges: challenges });
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    }
  },

  startChallenge: async (challengeId: string) => {
    try {
      const prog = await api.startChallenge(challengeId);
      set((state) => ({
        challengeProgress: {
          ...state.challengeProgress,
          [challengeId]: prog,
        },
      }));
      return prog;
    } catch (err) {
      console.error('Failed to start challenge:', err);
      return null;
    }
  },

  completeChallengeDay: async (challengeId: string, dayNum: number) => {
    try {
      const prog = await api.completeChallengeDay(challengeId, dayNum);
      set((state) => ({
        challengeProgress: {
          ...state.challengeProgress,
          [challengeId]: prog,
        },
      }));
      get().showToast('🏆', `Day ${dayNum} completed!`);
      return prog;
    } catch (err) {
      console.error('Failed to complete challenge day:', err);
      return null;
    }
  },

  fetchFavorites: async () => {
    try {
      const favorites = await api.getFavorites();
      set({ favorites });
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    }
  },

  addFavorite: async (word: string, letter: string, nodeId: string | null) => {
    try {
      await api.addFavorite(word, letter, nodeId);
      get().showToast('⭐', `${word} added to Favorites!`);
      await get().fetchFavorites();
    } catch (err) {
      console.error('Failed to add favorite:', err);
    }
  },

  toggleFavoriteMastered: async (entryId: string) => {
    try {
      await api.toggleFavoriteMastered(entryId);
      await get().fetchFavorites();
    } catch (err) {
      console.error('Failed to toggle favorite mastery:', err);
    }
  },

  fetchStories: async () => {
    try {
      const stories = await api.getStories();
      set({ stories });
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    }
  },

  fetchWordFamilies: async () => {
    try {
      const families = await api.getWordFamilies();
      set({ wordFamilies: families });
    } catch (err) {
      console.error('Failed to fetch word families:', err);
    }
  },
}));

onUnauthorized(() => {
  useStore.getState().logout();
});


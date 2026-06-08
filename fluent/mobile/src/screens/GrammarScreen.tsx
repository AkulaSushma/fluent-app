import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInRight,
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Confetti from '@/components/Confetti';
import PressableScale from '@/components/PressableScale';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';
import { api } from '@/api/client';
import type { GrammarLessonResponse } from '@/api/client';

// Signature Components
import RiverOfTime from '@/components/grammar/RiverOfTime';
import CameraFlip from '@/components/grammar/CameraFlip';
import BranchingUniverse from '@/components/grammar/BranchingUniverse';
import SentenceSurgery from '@/components/grammar/SentenceSurgery';
import AskMayaModal from '@/components/grammar/AskMayaModal';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - space.xl * 2;

type ActiveTab = 'learn' | 'practice' | 'quick_ref' | 'challenge';

export default function GrammarScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const topicId = route.params?.topicId || route.params?.params?.topicId || '';
  const topicParam = route.params?.topic || route.params?.params?.topic || 'Present Perfect vs Past Simple';
  const levelParam = route.params?.level || route.params?.params?.level || 'intermediate';

  const {
    showToast,
    fireConfetti,
    submitGrammarQuiz,
    grammarTopics,
    fetchGrammarTopics,
  } = useStore();

  // Primary Lesson Data
  const [lesson, setLesson] = useState<GrammarLessonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lessonStartTime = useRef<number>(0);

  // Tab State
  const [activeTab, setActiveTab] = useState<ActiveTab>('learn');

  // LEARN Tab States
  const learnScrollRef = useRef<ScrollView>(null);
  const [activeLearnCardIdx, setActiveLearnCardIdx] = useState(0);
  const [exampleTranslationVisible, setExampleTranslationVisible] = useState<Record<number, boolean>>({});
  const [mistakeExplanationVisible, setMistakeExplanationVisible] = useState<Record<number, boolean>>({});

  // PRACTICE Tab States
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [practiceCompletedOnce, setPracticeCompletedOnce] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [mayaModalVisible, setMayaModalVisible] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [masteryScore, setMasteryScore] = useState(0);

  // Formula interactive states
  const [selectedFormulaPart, setSelectedFormulaPart] = useState<string | null>(null);
  const [activeHighlightRole, setActiveHighlightRole] = useState<string | null>(null);

  // CHALLENGE Tab States
  // challengeState can be: 'idle' | 'countdown' | 'playing' | 'gameover'
  const [challengeState, setChallengeState] = useState<'idle' | 'countdown' | 'playing' | 'gameover'>('idle');
  const [challengeCountdown, setChallengeCountdown] = useState(3);
  const [challengeTimer, setChallengeTimer] = useState(60);
  const [challengeQuestionIdx, setChallengeQuestionIdx] = useState(0);
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeStreak, setChallengeStreak] = useState(0);
  const [challengeBestStreak, setChallengeBestStreak] = useState(0);
  const [challengeSelectedAnswer, setChallengeSelectedAnswer] = useState<number | null>(null);

  // Fetch lesson details on mount
  useEffect(() => {
    let active = true;
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        const res = await api.generateGrammarLesson(topicId || topicParam, levelParam.toLowerCase());
        if (active) {
          setLesson(res);
          setIsLoading(false);
          lessonStartTime.current = Date.now();
        }
      } catch (err) {
        console.error('Failed to generate grammar lesson:', err);
        if (active) {
          setIsLoading(false);
          showToast('❌', 'Failed to generate grammar lesson. Please try again.');
        }
      }
    };
    fetchLesson();
    return () => {
      active = false;
    };
  }, [topicId, topicParam, levelParam]);

  // Fetch grammar topics for locking status and user states
  useEffect(() => {
    if (!grammarTopics) {
      fetchGrammarTopics();
    }
  }, [grammarTopics, fetchGrammarTopics]);

  // Determine unlock status of Challenge mode
  const isTopicCompleted = useMemo(() => {
    if (!grammarTopics) return false;
    for (const cat of grammarTopics.categories) {
      const topicObj = cat.topics.find((t) => t.id === topicId || t.title === lesson?.topic);
      if (topicObj && topicObj.completed) return true;
    }
    return false;
  }, [grammarTopics, topicId, lesson]);

  const isChallengeUnlocked = isTopicCompleted || practiceCompletedOnce;

  // Challenge Mode Timer Effect
  useEffect(() => {
    let intervalId: any = null;

    if (challengeState === 'countdown') {
      intervalId = setInterval(() => {
        setChallengeCountdown((prev) => {
          if (prev <= 1) {
            setChallengeState('playing');
            setChallengeTimer(60);
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (challengeState === 'playing') {
      intervalId = setInterval(() => {
        setChallengeTimer((prev) => {
          if (prev <= 1) {
            setChallengeState('gameover');
            fireConfetti();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [challengeState]);

  // Token highlighter utility for See It In Action
  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('subject')) return palette.accent;
    if (r.includes('verb') || r.includes('tense')) return palette.amber;
    if (r.includes('object') || r.includes('noun')) return palette.gold;
    if (r.includes('negation') || r.includes('not')) return '#C75450';
    return palette.ink;
  };

  // Formula parser utility
  const parsedFormula = useMemo(() => {
    if (!lesson?.formula) return [];
    // Split by operator '+' and spaces while capturing bracket structure
    const parts = lesson.formula.split(/(\s*\+\s*)/);
    return parts.map((part) => {
      const trimmed = part.trim();
      if (trimmed === '+') {
        return { isOperator: true, text: '+' };
      }
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return { isCapsule: true, text: trimmed.substring(1, trimmed.length - 1) };
      }
      return { isText: true, text: trimmed };
    });
  }, [lesson?.formula]);

  // Tab switching helper
  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'challenge' && !isChallengeUnlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      showToast('🔒', 'Unlock Challenge by completing Practice once!');
      return;
    }
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // LEARN Tab Navigation
  const handleLearnScroll = (event: any) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / SCREEN_W);
    if (index >= 0 && index < 5 && index !== activeLearnCardIdx) {
      setActiveLearnCardIdx(index);
    }
  };

  const jumpToLearnPage = (index: number) => {
    if (index < 0 || index > 4) return;
    learnScrollRef.current?.scrollTo({ x: index * SCREEN_W, animated: true });
    setActiveLearnCardIdx(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // PRACTICE Quiz Helpers
  const handleSelectQuizAnswer = (idx: number) => {
    if (selectedAnswer !== null || !lesson) return;
    setSelectedAnswer(idx);

    const question = lesson.quiz[currentQuizIdx];
    const isCorrect = idx === question.answer;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleQuizNext = async () => {
    if (!lesson) return;
    const isLastQuestion = currentQuizIdx === lesson.quiz.length - 1;

    if (isLastQuestion) {
      setIsLoading(true);
      const elapsed = (Date.now() - lessonStartTime.current) / 1000;

      try {
        const result = await submitGrammarQuiz({
          topic_id: topicId || lesson.topic,
          correct_count: correctCount,
          total_questions: lesson.quiz.length,
          time_spent_seconds: Math.round(elapsed),
        });

        if (result) {
          setXpAwarded(result.xp_awarded);
          setMasteryScore(Math.round(result.new_mastery * 100));
        } else {
          const scorePct = Math.round((correctCount / lesson.quiz.length) * 100);
          setXpAwarded(scorePct >= 80 ? 50 : 25);
          setMasteryScore(scorePct);
        }

        setPracticeCompletedOnce(true);
        setIsQuizFinished(true);
        fireConfetti();
      } catch (err) {
        console.error('Quiz submission error:', err);
        showToast('⚠️', 'Could not save score, displaying estimate.');
        const scorePct = Math.round((correctCount / lesson.quiz.length) * 100);
        setXpAwarded(scorePct >= 80 ? 50 : 25);
        setMasteryScore(scorePct);
        setPracticeCompletedOnce(true);
        setIsQuizFinished(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentQuizIdx((idx) => idx + 1);
      setSelectedAnswer(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setIsQuizFinished(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // CHALLENGE Tab Helpers
  const handleStartChallenge = () => {
    setChallengeState('countdown');
    setChallengeCountdown(3);
    setChallengeScore(0);
    setChallengeStreak(0);
    setChallengeBestStreak(0);
    setChallengeQuestionIdx(0);
    setChallengeSelectedAnswer(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSelectChallengeAnswer = (idx: number) => {
    if (challengeSelectedAnswer !== null || !lesson) return;
    setChallengeSelectedAnswer(idx);

    const question = lesson.quiz[challengeQuestionIdx];
    const isCorrect = idx === question.answer;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const nextStreak = challengeStreak + 1;
      setChallengeStreak(nextStreak);
      if (nextStreak > challengeBestStreak) {
        setChallengeBestStreak(nextStreak);
      }
      const multiplier = nextStreak >= 6 ? 3 : nextStreak >= 3 ? 2 : 1;
      setChallengeScore((s) => s + 10 * multiplier);

      // Snappy auto-advance for correct answers (300ms)
      setTimeout(() => {
        advanceChallengeQuestion();
      }, 300);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setChallengeStreak(0);

      // Slower auto-advance for errors to show correction (800ms)
      setTimeout(() => {
        advanceChallengeQuestion();
      }, 800);
    }
  };

  const advanceChallengeQuestion = () => {
    if (!lesson) return;
    setChallengeSelectedAnswer(null);
    setChallengeQuestionIdx((prev) => (prev + 1) % lesson.quiz.length);
  };

  const getFormulaPartExplanation = (part: string) => {
    const p = part.toLowerCase().trim();
    if (p.includes('subject')) return 'The actor or doer of the sentence (e.g. "I", "She", "The developer", "We").';
    if (p.includes('verb-ing')) return 'Continuous or ongoing action form of the verb (e.g. "working", "deploying", "running").';
    if (p.includes('am/is/are')) return 'Present tense auxiliary verb matching the subject (e.g. "I am", "He/She is", "They are").';
    if (p.includes('have/has')) return 'Auxiliary verb showing completed present action (e.g. "I have worked", "She has deployed").';
    if (p.includes('had')) return 'Past auxiliary showing an action completed before another past event (e.g. "We had backed up").';
    if (p.includes('will')) return 'Future auxiliary indicating a promise, decision, or prediction (e.g. "We will test").';
    if (p.includes('v3') || p.includes('past participle')) return 'Perfect form of the verb (e.g. "written", "deployed", "seen").';
    if (p.includes('v2') || p.includes('past verb')) return 'Simple past action completed in the past (e.g. "wrote", "ran", "crashed").';
    if (p.includes('object') || p.includes('noun')) return 'The recipient of the action or name of an entity (e.g. "the code", "London").';
    if (p.includes('modal')) return 'Expresses permission, ability, or obligation (e.g. "can", "should", "must", "might").';
    if (p.includes('auxiliary')) return 'Helping verb used to form tenses or voices (e.g. "was", "were", "do", "does").';
    if (p.includes('was/were')) return 'Past tense auxiliary verb matching the subject (e.g. "I was", "They were").';
    return `Grammatical structure component: "${part}". Essential building block for this grammar concept.`;
  };

  const renderFormulaLayout = () => {
    if (!lesson?.formula) return null;

    const subFormulas = lesson.formula.split('|');

    return (
      <View style={styles.formulaLinesContainer}>
        {subFormulas.map((sub, subIdx) => {
          const trimmedSub = sub.trim();
          if (!trimmedSub) return null;

          let label = '';
          let restOfFormula = trimmedSub;
          const colonIdx = trimmedSub.indexOf(':');
          if (colonIdx > 0 && colonIdx < 30) {
            label = trimmedSub.substring(0, colonIdx).trim();
            restOfFormula = trimmedSub.substring(colonIdx + 1).trim();
          }

          const parts = restOfFormula.split(/(\s*\+\s*|\s*,\s*|\s*->\s*)/g);

          return (
            <View key={subIdx} style={styles.formulaLine}>
              {label ? (
                <View style={styles.formulaLabelBadge}>
                  <Text style={styles.formulaLabelText}>{label.toUpperCase()}</Text>
                </View>
              ) : null}

              <View style={styles.formulaElementsWrap}>
                {parts.map((part, partIdx) => {
                  const trimmedPart = part.trim();
                  if (!trimmedPart) return null;

                  const isOperator = trimmedPart === '+' || trimmedPart === ',' || trimmedPart === '->';

                  if (isOperator) {
                    return (
                      <Text key={partIdx} style={styles.formulaOperatorText}>
                        {trimmedPart === '->' ? '➔' : trimmedPart}
                      </Text>
                    );
                  }

                  const partLower = trimmedPart.toLowerCase();
                  let bgColor: string = palette.accentSoft;
                  let textColor: string = palette.accent;

                  if (partLower.includes('subject')) {
                    bgColor = '#EBF4F5';
                    textColor = '#2A7A8C';
                  } else if (partLower.includes('verb') || partLower.includes('v2') || partLower.includes('v3') || partLower.includes('gerund') || partLower.includes('infinitive')) {
                    bgColor = palette.amberSoft;
                    textColor = palette.amber;
                  } else if (partLower.includes('object') || partLower.includes('noun')) {
                    bgColor = '#FDF3E0';
                    textColor = palette.gold;
                  } else if (partLower.includes('modal') || partLower.includes('auxiliary') || partLower.includes('pronoun')) {
                    bgColor = '#F0EEFC';
                    textColor = '#6554C0';
                  }

                  const isHighlighted = activeHighlightRole === partLower || partLower.includes(activeHighlightRole || '____');

                  return (
                    <TouchableOpacity
                      key={partIdx}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedFormulaPart(trimmedPart);
                        setActiveHighlightRole(prev => prev === partLower ? null : partLower);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[
                        styles.formulaCapsule,
                        { backgroundColor: bgColor },
                        isHighlighted && {
                          borderWidth: 1.5,
                          borderColor: textColor,
                          shadowColor: textColor,
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 2,
                        }
                      ]}
                    >
                      <Text style={[styles.formulaCapsuleText, { color: textColor }]}>
                        {trimmedPart}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Determine signature visualization component
  const renderSignatureComponent = () => {
    if (!lesson) return null;
    const topicLower = (topicId || lesson.topic).toLowerCase();

    if (
      topicLower.includes('tense') ||
      topicLower.includes('present') ||
      topicLower.includes('past') ||
      topicLower.includes('future') ||
      topicLower.includes('perfect')
    ) {
      let shape = 'pulse';
      if (topicLower.includes('past_simple')) shape = 'dot';
      else if (topicLower.includes('past_continuous')) shape = 'line';
      else if (topicLower.includes('past_perfect')) shape = 'two_dots';
      else if (topicLower.includes('present_perfect')) shape = 'arrow_now';
      else if (topicLower.includes('future_perfect')) shape = 'future_two_dots';
      else if (topicLower.includes('future_perfect_continuous')) shape = 'future_line_to_dot';

      return <RiverOfTime shape={shape} labelLeft="Past" labelRight="Future" marker="Now" />;
    }

    if (topicLower.includes('passive') || topicLower.includes('voice')) {
      return (
        <CameraFlip
          subject="The developer"
          verb="deployed"
          object="the microservice"
        />
      );
    }

    if (topicLower.includes('conditional')) {
      return <BranchingUniverse />;
    }

    const surgeryData =
      lesson.examples?.[0]?.tokens?.map((tok) => ({
        word: tok.text,
        role: (tok.role.charAt(0).toUpperCase() + tok.role.slice(1)) as any,
        explanation: `Grammatical role: ${tok.role} in sentence construction.`,
      })) || [];

    return <SentenceSurgery sentenceData={surgeryData.length > 0 ? surgeryData : undefined} />;
  };

  // Loading Screen
  if (isLoading || !lesson) {
    return (
      <View style={[styles.loadingScreen, { paddingTop: insets.top }]}>
        <Header title="Grammar Engine" showBack={true} />
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Synthesizing cognitive learning system...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Grammar Engine" showBack={true} />
      <Confetti />

      {/* ── Tabs Navigation Pill Bar ─────────────────────────── */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'learn' && styles.tabActiveButton]}
            onPress={() => handleTabChange('learn')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'learn' && styles.tabActiveButtonText]}>Learn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'practice' && styles.tabActiveButton]}
            onPress={() => handleTabChange('practice')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'practice' && styles.tabActiveButtonText]}>Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'quick_ref' && styles.tabActiveButton]}
            onPress={() => handleTabChange('quick_ref')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'quick_ref' && styles.tabActiveButtonText]}>Quick Ref</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'challenge' && styles.tabActiveButton,
              !isChallengeUnlocked && styles.tabLockedButton,
            ]}
            onPress={() => handleTabChange('challenge')}
          >
            {!isChallengeUnlocked && <Ionicons name="lock-closed" size={10} color={palette.ink3} style={{ marginRight: 4 }} />}
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'challenge' && styles.tabActiveButtonText,
                !isChallengeUnlocked && { color: palette.ink3 },
              ]}
            >
              Challenge
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Tab 1: LEARN (Swipeable Concept Cards) ────────────── */}
      {activeTab === 'learn' && (
        <Animated.View entering={FadeIn} style={styles.tabContentContainer}>
          <ScrollView contentContainerStyle={styles.learnScrollContainer} showsVerticalScrollIndicator={false}>
            
            <ScrollView
              ref={learnScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleLearnScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {/* CARD 1: What Is It? */}
              <View style={styles.conceptCardContainer}>
                <View style={[styles.premiumCard, shadow.card]}>
                  <View style={styles.cardIndicatorRow}>
                    <Text style={styles.cardIndicatorText}>CONCEPT BLUEPRINT</Text>
                    <Ionicons name="book-outline" size={16} color={palette.accent} />
                  </View>

                  <Text style={styles.conceptTitle}>{lesson.topic}</Text>
                  <Text style={styles.conceptRule}>{lesson.rule}</Text>
                  
                  <View style={styles.blueprintDivider} />

                  <Text style={styles.sectionLabel}>STRUCTURE FORMULA (TAP COMPONENTS TO HIGHLIGHT)</Text>
                  <View style={styles.formulaBox}>
                    {renderFormulaLayout()}
                  </View>

                  {/* Dynamic Cognitive Explanation Tooltip */}
                  {selectedFormulaPart && (
                    <Animated.View entering={FadeInDown} style={styles.tooltipCard}>
                      <View style={styles.tooltipHeader}>
                        <Ionicons name="bulb" size={14} color={palette.amber} />
                        <Text style={styles.tooltipTitle}>{selectedFormulaPart.toUpperCase()}</Text>
                        <TouchableOpacity
                          style={styles.closeTooltipBtn}
                          onPress={() => {
                            setSelectedFormulaPart(null);
                            setActiveHighlightRole(null);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                        >
                          <Ionicons name="close" size={14} color={palette.ink3} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.tooltipBody}>{getFormulaPartExplanation(selectedFormulaPart)}</Text>
                    </Animated.View>
                  )}

                  <Text style={styles.conceptExplanation}>{lesson.explanation}</Text>
                </View>
              </View>

              {/* CARD 2: See It In Action */}
              <View style={styles.conceptCardContainer}>
                <View style={[styles.premiumCard, shadow.card]}>
                  <View style={styles.cardIndicatorRow}>
                    <Text style={styles.cardIndicatorText}>WORKPLACE CONTEXT</Text>
                    <Ionicons name="chatbox-ellipses-outline" size={16} color={palette.accent} />
                  </View>

                  <Text style={styles.conceptTitle}>Real-World Dialogues</Text>
                  <Text style={styles.conceptRuleSub}>Observe how sentence roles change in practice.</Text>

                  <View style={styles.examplesList}>
                    {lesson.examples.slice(0, 3).map((ex, idx) => {
                      const showTrans = exampleTranslationVisible[idx] || false;
                      return (
                        <View key={idx} style={styles.exampleItem}>
                          <View style={styles.exampleHeaderRow}>
                            <View style={styles.exampleDot} />
                            <Text style={styles.exampleNumLabel}>EXAMPLE {idx + 1}</Text>
                          </View>

                          {ex.tokens && ex.tokens.length > 0 ? (
                            <Text style={styles.exampleText}>
                              {ex.tokens.map((tok, tokIdx) => {
                                const color = getRoleColor(tok.role);
                                const isAccent = color !== palette.ink;

                                // Check if this token matches the active highlighted role from the formula
                                const isRoleHighlighted = activeHighlightRole && (
                                  tok.role.toLowerCase().includes(activeHighlightRole) ||
                                  activeHighlightRole.includes(tok.role.toLowerCase())
                                );

                                let highlightBg = 'transparent';
                                if (isRoleHighlighted) {
                                  const roleLower = tok.role.toLowerCase();
                                  if (roleLower.includes('subject')) highlightBg = '#EBF4F5'; // Soft blue
                                  else if (roleLower.includes('verb')) highlightBg = '#FCE7D0'; // Soft amber
                                  else if (roleLower.includes('object') || roleLower.includes('noun')) highlightBg = '#FDF0D5'; // Soft gold
                                  else highlightBg = '#EAE8FC'; // Soft purple
                                }

                                return (
                                  <Text
                                    key={tokIdx}
                                    style={[
                                      isAccent && { color, fontFamily: font.sansBold },
                                      isRoleHighlighted && {
                                        backgroundColor: highlightBg,
                                        borderRadius: 4,
                                        paddingHorizontal: 2,
                                      }
                                    ]}
                                  >
                                    {tok.text}{' '}
                                  </Text>
                                );
                              })}
                            </Text>
                          ) : (
                            <Text style={styles.exampleText}>{ex.sentence}</Text>
                          )}

                          <TouchableOpacity
                            style={styles.translationToggle}
                            onPress={() => {
                              setExampleTranslationVisible((prev) => ({ ...prev, [idx]: !showTrans }));
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                          >
                            <Ionicons name="language-outline" size={12} color={palette.accent} />
                            <Text style={styles.translationToggleText}>
                              {showTrans ? 'Hide Translation' : 'Show Translation'}
                            </Text>
                          </TouchableOpacity>

                          {showTrans && (
                            <Animated.View entering={FadeInDown} style={styles.translationHintBox}>
                              <Text style={styles.translationHintText}>{ex.translation_hint}</Text>
                            </Animated.View>
                          )}

                          <Text style={styles.exampleNoteText}>
                            <Text style={{ fontFamily: font.sansBold }}>Usage Tip: </Text>
                            {ex.note}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* CARD 3: Common Mistakes */}
              <View style={styles.conceptCardContainer}>
                <View style={[styles.premiumCard, shadow.card]}>
                  <View style={styles.cardIndicatorRow}>
                    <Text style={styles.cardIndicatorText}>COMMON PITFALLS</Text>
                    <Ionicons name="warning-outline" size={16} color="#C75450" />
                  </View>

                  <Text style={styles.conceptTitle}>Wrong vs. Right</Text>
                  <Text style={styles.conceptRuleSub}>Learn to identify and correct standard mistakes.</Text>

                  <View style={styles.mistakesList}>
                    {lesson.commonMistakes.map((mis, idx) => {
                      const expanded = mistakeExplanationVisible[idx] || false;
                      return (
                        <View key={idx} style={styles.mistakeItem}>
                          <View style={styles.wrongBox}>
                            <Text style={styles.mistakeLabelWrong}>❌ INCORRECT</Text>
                            <Text style={styles.mistakeSentenceWrong}>{mis.wrong}</Text>
                          </View>
                          
                          <View style={styles.rightBox}>
                            <Text style={styles.mistakeLabelRight}>✅ STANDARD</Text>
                            <Text style={styles.mistakeSentenceRight}>{mis.right}</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.whyButton}
                            onPress={() => {
                              setMistakeExplanationVisible((prev) => ({ ...prev, [idx]: !expanded }));
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                          >
                            <Text style={styles.whyButtonText}>{expanded ? 'Hide Explanation ▲' : 'Why is this wrong? ▼'}</Text>
                          </TouchableOpacity>

                          {expanded && (
                            <Animated.View entering={FadeInDown} style={styles.mistakeExplanationBox}>
                              <Text style={styles.mistakeExplanationText}>{mis.explanation}</Text>
                            </Animated.View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* CARD 4: Pro Tips */}
              <View style={styles.conceptCardContainer}>
                <View style={[styles.premiumCard, shadow.card]}>
                  <View style={styles.cardIndicatorRow}>
                    <Text style={styles.cardIndicatorText}>EXECUTIVE TIPS</Text>
                    <Ionicons name="ribbon-outline" size={16} color={palette.accent} />
                  </View>

                  <Text style={styles.conceptTitle}>Professional Mastery</Text>
                  <Text style={styles.conceptRuleSub}>Executive speaking tips from world-class communicators.</Text>

                  <ScrollView style={styles.tipsList} showsVerticalScrollIndicator={false}>
                    {lesson.tipCards?.map((tip, idx) => (
                      <View key={idx} style={styles.tipCardItem}>
                        <View style={styles.tipCardHeader}>
                          <View style={styles.tipIconCircle}>
                            <Text style={styles.tipEmoji}>{tip.emoji || '💡'}</Text>
                          </View>
                          <Text style={styles.tipCardTitle}>{tip.title}</Text>
                        </View>
                        <Text style={styles.tipCardBody}>{tip.body}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* CARD 5: Visual Blueprint */}
              <View style={styles.conceptCardContainer}>
                <View style={[styles.premiumCard, shadow.card]}>
                  <View style={styles.cardIndicatorRow}>
                    <Text style={styles.cardIndicatorText}>INTERACTIVE SIMULATOR</Text>
                    <Ionicons name="game-controller-outline" size={16} color={palette.accent} />
                  </View>

                  <Text style={styles.conceptTitle}>Visual Grammar Map</Text>
                  <Text style={styles.conceptRuleSub}>Interact with this physical system to map the rule.</Text>

                  <View style={styles.signatureVisualizationHolder}>
                    {renderSignatureComponent()}
                  </View>
                </View>
              </View>

            </ScrollView>

            {/* Pagination Controls */}
            <View style={styles.paginationRow}>
              <TouchableOpacity
                style={[styles.arrowNavButton, activeLearnCardIdx === 0 && { opacity: 0.3 }]}
                disabled={activeLearnCardIdx === 0}
                onPress={() => jumpToLearnPage(activeLearnCardIdx - 1)}
              >
                <Ionicons name="chevron-back" size={20} color={palette.ink} />
              </TouchableOpacity>

              <View style={styles.pageDotsContainer}>
                {[0, 1, 2, 3, 4].map((idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => jumpToLearnPage(idx)}
                    style={[
                      styles.pageDot,
                      activeLearnCardIdx === idx && styles.pageDotActive
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.arrowNavButton, activeLearnCardIdx === 4 && { opacity: 0.3 }]}
                disabled={activeLearnCardIdx === 4}
                onPress={() => jumpToLearnPage(activeLearnCardIdx + 1)}
              >
                <Ionicons name="chevron-forward" size={20} color={palette.ink} />
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.learnQuickActions}>
              <Button
                label="Ready to Practice?"
                onPress={() => handleTabChange('practice')}
                variant="accent"
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      )}

      {/* ── Tab 2: PRACTICE (Quiz Session) ───────────────────── */}
      {activeTab === 'practice' && (
        <Animated.View entering={FadeIn} style={styles.tabContentContainer}>
          {!isQuizFinished ? (
            <ScrollView contentContainerStyle={styles.practiceContent} showsVerticalScrollIndicator={false}>
              {/* Quiz Header Progress */}
              <View style={styles.quizProgressHeader}>
                <Text style={styles.quizProgressText}>
                  QUESTION {currentQuizIdx + 1} OF {lesson.quiz.length}
                </Text>
                
                <View style={styles.quizProgressBarContainer}>
                  <View
                    style={[
                      styles.quizProgressBarFill,
                      { width: `${((currentQuizIdx) / lesson.quiz.length) * 100}%` }
                    ]}
                  />
                </View>

                <View style={styles.dotsIndicatorsRow}>
                  {lesson.quiz.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.quizStatusDot,
                        idx === currentQuizIdx && styles.quizStatusDotActive,
                        idx < currentQuizIdx && styles.quizStatusDotCompleted,
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Question Card */}
              {(() => {
                const question = lesson.quiz[currentQuizIdx];
                if (!question) return null;
                const hasAnswered = selectedAnswer !== null;

                return (
                  <View style={styles.questionBlock}>
                    <View style={[styles.questionCard, shadow.card]}>
                      <Text style={styles.questionCardTitle}>{question.q}</Text>
                    </View>

                    {/* Options List */}
                    <View style={styles.optionsListContainer}>
                      {question.options.map((opt, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = idx === question.answer;

                        let cardStyle: any = styles.optionBtn;
                        let textStyle: any = styles.optionBtnText;
                        let rightIcon = null;

                        if (hasAnswered) {
                          if (isCorrect) {
                            cardStyle = styles.optionCorrectBtn;
                            textStyle = styles.optionCorrectBtnText;
                            rightIcon = <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />;
                          } else if (isSelected) {
                            cardStyle = styles.optionWrongBtn;
                            textStyle = styles.optionWrongBtnText;
                            rightIcon = <Ionicons name="close-circle" size={18} color="#FFFFFF" />;
                          } else {
                            cardStyle = styles.optionMutedBtn;
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={idx}
                            disabled={hasAnswered}
                            style={cardStyle}
                            onPress={() => handleSelectQuizAnswer(idx)}
                            activeOpacity={0.8}
                          >
                            <Text style={textStyle}>{opt}</Text>
                            {rightIcon}
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Ask Maya Tutor Trigger */}
                    {hasAnswered && selectedAnswer !== question.answer && (
                      <TouchableOpacity
                        style={[styles.mayaAssistantTrigger, shadow.card]}
                        onPress={() => setMayaModalVisible(true)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.mayaAssistantIcon}>🤖</Text>
                        <View style={styles.mayaAssistantTextCol}>
                          <Text style={styles.mayaAssistantTitle}>Ask Maya Tutor</Text>
                          <Text style={styles.mayaAssistantSub}>Learn why this selection isn't standard.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={palette.accent} />
                      </TouchableOpacity>
                    )}

                    {/* Inline Explanation Feedback */}
                    {hasAnswered && (
                      <Animated.View entering={FadeInDown} style={styles.quizExplanationInline}>
                        <View style={styles.explanationInlineTitleRow}>
                          <Ionicons name="information-circle-outline" size={14} color={palette.accent} />
                          <Text style={styles.explanationInlineTitle}>EXPLANATION</Text>
                        </View>
                        <Text style={styles.explanationInlineBody}>{question.explanation || 'Excellent work matching structural rules.'}</Text>
                      </Animated.View>
                    )}

                    {/* Next Button */}
                    {hasAnswered && (
                      <View style={styles.bottomNextContainer}>
                        <Button
                          label={currentQuizIdx === lesson.quiz.length - 1 ? 'Analyze Final Score' : 'Next Question'}
                          onPress={handleQuizNext}
                          variant="accent"
                        />
                      </View>
                    )}

                    {/* Ask Maya Tutor Overlay Modal */}
                    <AskMayaModal
                      visible={mayaModalVisible}
                      onClose={() => setMayaModalVisible(false)}
                      userAnswer={question.options[selectedAnswer ?? 0]}
                      correctAnswer={question.options[question.answer]}
                      concept={lesson.topic}
                    />
                  </View>
                );
              })()}
            </ScrollView>
          ) : (
            // Results screen
            <Animated.View entering={FadeIn} style={styles.resultsWrapper}>
              <View style={[styles.resultsCard, shadow.card]}>
                <View style={styles.awardCircleBig}>
                  <Ionicons name="sparkles-outline" size={48} color={palette.gold} />
                </View>

                <Text style={styles.resultsCongratulations}>Practice Complete!</Text>
                <Text style={styles.resultsTopicTitle}>{lesson.topic}</Text>

                <View style={styles.resultsGrid}>
                  <View style={styles.resultsGridItem}>
                    <Text style={styles.resultsNum}>+{xpAwarded}</Text>
                    <Text style={styles.resultsLabel}>XP AWARDED</Text>
                  </View>

                  <View style={styles.resultsGridDivider} />

                  <View style={styles.resultsGridItem}>
                    <Text style={styles.resultsNum}>{masteryScore}%</Text>
                    <Text style={styles.resultsLabel}>MASTERY LEVEL</Text>
                  </View>
                </View>

                <View style={styles.resultsActionsContainer}>
                  <Button
                    label="Go to Challenge Mode"
                    onPress={() => handleTabChange('challenge')}
                    variant="accent"
                    style={styles.resultsBtn}
                  />

                  <Button
                    label="Back to Grammar Hub"
                    onPress={() => navigation.navigate('Grammar')}
                    variant="ghost"
                    style={styles.resultsBtn}
                  />

                  <TouchableOpacity style={styles.retryPracticeBtn} onPress={handleResetQuiz}>
                    <Ionicons name="refresh" size={14} color={palette.ink2} />
                    <Text style={styles.retryPracticeText}>Retry Practice Quiz</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      )}

      {/* ── Tab 3: QUICK REF (Cheat Sheet Lookup) ────────────── */}
      {activeTab === 'quick_ref' && (
        <Animated.View entering={FadeIn} style={styles.tabContentContainer}>
          <ScrollView contentContainerStyle={styles.quickRefContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.premiumCard, shadow.card]}>
              <View style={styles.cardIndicatorRow}>
                <Text style={styles.cardIndicatorText}>QUICK REFERENCE SHEETS</Text>
                <Ionicons name="clipboard-outline" size={16} color={palette.accent} />
              </View>

              <Text style={styles.conceptTitle}>{lesson.topic}</Text>
              <Text style={styles.quickRefSectionLabel}>THE FORMULA</Text>
              
              <View style={[styles.formulaBox, { backgroundColor: palette.paper, marginBottom: space.sm }]}>
                {renderFormulaLayout()}
              </View>

              <TouchableOpacity
                style={[styles.formulaCopyButton, { alignSelf: 'flex-end', marginBottom: space.md }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  showToast('📋', 'Formula copied to clipboard!');
                }}
              >
                <Ionicons name="copy-outline" size={12} color={palette.accent} />
                <Text style={styles.formulaCopyText}>Copy Raw Formula</Text>
              </TouchableOpacity>

              <Text style={styles.quickRefSectionLabel}>CORE USAGE RULE</Text>
              <Text style={styles.quickRefBodyText}>{lesson.rule}</Text>
              <Text style={styles.quickRefExplanation}>{lesson.explanation}</Text>

              <View style={styles.blueprintDivider} />

              <Text style={styles.quickRefSectionLabel}>KEY EXAMPLES</Text>
              <View style={styles.quickRefExamplesList}>
                {lesson.examples.map((ex, idx) => (
                  <View key={idx} style={styles.quickRefExampleRow}>
                    <Text style={styles.quickRefExampleDot}>•</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quickRefExampleSentence}>{ex.sentence}</Text>
                      <Text style={styles.quickRefExampleTranslation}>{ex.translation_hint}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      )}

      {/* ── Tab 4: CHALLENGE (Rapid Fire Timed Mode) ─────────── */}
      {activeTab === 'challenge' && (
        <Animated.View entering={FadeIn} style={styles.tabContentContainer}>
          {/* Pre-Game Idle / Rules */}
          {challengeState === 'idle' && (
            <View style={styles.challengeScaffold}>
              <View style={[styles.premiumCard, shadow.card, styles.challengeCenterCard]}>
                <View style={styles.awardCircleBig}>
                  <Ionicons name="flash-outline" size={40} color={palette.amber} />
                </View>
                
                <Text style={styles.challengeMainTitle}>60-Second Challenge</Text>
                <Text style={styles.challengeSubtitle}>Rapid-Fire Structural Test</Text>

                <View style={styles.challengeRulesContainer}>
                  <View style={styles.ruleBullet}>
                    <Ionicons name="time-outline" size={16} color={palette.accent} />
                    <Text style={styles.challengeRuleText}>You have 60 seconds to answer as many questions as possible.</Text>
                  </View>

                  <View style={styles.ruleBullet}>
                    <Ionicons name="trending-up-outline" size={16} color={palette.accent} />
                    <Text style={styles.challengeRuleText}>Consecutive correct answers trigger a streak multiplier.</Text>
                  </View>

                  <View style={styles.ruleBullet}>
                    <Ionicons name="infinite-outline" size={16} color={palette.accent} />
                    <Text style={styles.challengeRuleText}>The questions will loop if you master them before the timer is up.</Text>
                  </View>
                </View>

                <Button label="🚀 Start Challenge" onPress={handleStartChallenge} variant="accent" style={{ width: '100%', marginTop: space.lg }} />
              </View>
            </View>
          )}

          {/* Countdown State */}
          {challengeState === 'countdown' && (
            <View style={styles.challengeScaffold}>
              <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.countdownBox}>
                <Text style={styles.countdownTitle}>GET READY</Text>
                <Text style={styles.countdownNumber}>{challengeCountdown}</Text>
              </Animated.View>
            </View>
          )}

          {/* Gameplay State */}
          {challengeState === 'playing' && (
            <ScrollView contentContainerStyle={styles.playingScaffold} showsVerticalScrollIndicator={false}>
              {/* Gameplay Header stats */}
              <View style={styles.gameplayHeader}>
                <View style={styles.timerPill}>
                  <Ionicons
                    name="time"
                    size={16}
                    color={challengeTimer <= 15 ? '#C75450' : palette.accent}
                  />
                  <Text style={[styles.timerPillText, challengeTimer <= 15 && { color: '#C75450' }]}>
                    {challengeTimer}s
                  </Text>
                </View>

                <View style={styles.streakPill}>
                  <Ionicons name="flame" size={16} color={palette.amber} />
                  <Text style={styles.streakPillText}>
                    Streak: {challengeStreak}
                  </Text>
                </View>

                <View style={styles.scorePill}>
                  <Text style={styles.scorePillText}>
                    Score: {challengeScore}
                  </Text>
                </View>
              </View>

              {/* Question Screen */}
              {(() => {
                const question = lesson.quiz[challengeQuestionIdx];
                if (!question) return null;
                const hasAnswered = challengeSelectedAnswer !== null;

                return (
                  <View style={styles.questionBlock}>
                    <View style={[styles.questionCard, shadow.card]}>
                      <Text style={styles.questionCardTitle}>{question.q}</Text>
                    </View>

                    {/* Options List */}
                    <View style={styles.optionsListContainer}>
                      {question.options.map((opt, idx) => {
                        const isSelected = challengeSelectedAnswer === idx;
                        const isCorrect = idx === question.answer;

                        let cardStyle: any = styles.optionBtn;
                        let textStyle: any = styles.optionBtnText;
                        let rightIcon = null;

                        if (hasAnswered) {
                          if (isCorrect) {
                            cardStyle = styles.optionCorrectBtn;
                            textStyle = styles.optionCorrectBtnText;
                            rightIcon = <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />;
                          } else if (isSelected) {
                            cardStyle = styles.optionWrongBtn;
                            textStyle = styles.optionWrongBtnText;
                            rightIcon = <Ionicons name="close-circle" size={18} color="#FFFFFF" />;
                          } else {
                            cardStyle = styles.optionMutedBtn;
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={idx}
                            disabled={hasAnswered}
                            style={cardStyle}
                            onPress={() => handleSelectChallengeAnswer(idx)}
                            activeOpacity={0.8}
                          >
                            <Text style={textStyle}>{opt}</Text>
                            {rightIcon}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })()}
            </ScrollView>
          )}

          {/* Game Over Screen */}
          {challengeState === 'gameover' && (
            <View style={styles.challengeScaffold}>
              <View style={[styles.premiumCard, shadow.card, styles.challengeCenterCard]}>
                <View style={styles.awardCircleBig}>
                  <Ionicons name="trophy-outline" size={44} color={palette.gold} />
                </View>

                <Text style={styles.challengeGameOverTitle}>Time's Up!</Text>
                <Text style={styles.challengeSubtitle}>Challenge Finished</Text>

                <View style={styles.resultsGrid}>
                  <View style={styles.resultsGridItem}>
                    <Text style={styles.resultsNum}>{challengeScore}</Text>
                    <Text style={styles.resultsLabel}>FINAL SCORE</Text>
                  </View>

                  <View style={styles.resultsGridDivider} />

                  <View style={styles.resultsGridItem}>
                    <Text style={styles.resultsNum}>{challengeBestStreak}</Text>
                    <Text style={styles.resultsLabel}>BEST STREAK</Text>
                  </View>
                </View>

                <View style={styles.resultsActionsContainer}>
                  <Button label="🚀 Start Again" onPress={handleStartChallenge} variant="accent" style={styles.resultsBtn} />
                  <Button
                    label="Back to Grammar Hub"
                    onPress={() => navigation.navigate('Grammar')}
                    variant="ghost"
                    style={styles.resultsBtn}
                  />
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* Scaffold */
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.xxl,
  },
  loadingText: {
    fontFamily: font.serifMed,
    fontSize: 16,
    color: palette.ink2,
    marginTop: space.lg,
    textAlign: 'center',
  },

  /* Tabs Bar */
  tabsContainer: {
    backgroundColor: palette.paper,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingVertical: space.sm,
  },
  tabsScroll: {
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  tabButton: {
    paddingHorizontal: space.lg,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabActiveButton: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  tabLockedButton: {
    backgroundColor: 'transparent',
    borderColor: palette.line2,
    opacity: 0.6,
  },
  tabButtonText: {
    fontFamily: font.sansSemi,
    fontSize: 12,
    color: palette.ink2,
  },
  tabActiveButtonText: {
    color: '#FFFFFF',
  },

  /* Tab View Layouts */
  tabContentContainer: {
    flex: 1,
  },

  /* LEARN TAB STYLES */
  learnScrollContainer: {
    paddingTop: space.md,
    alignItems: 'center',
  },
  horizontalScrollContent: {
    paddingHorizontal: 0,
    gap: 0,
  },
  conceptCardContainer: {
    width: SCREEN_W,
    paddingHorizontal: space.xl,
    justifyContent: 'flex-start',
  },
  premiumCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.line,
    padding: space.xl,
    minHeight: 460,
  },
  cardIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  cardIndicatorText: {
    fontFamily: font.sansBold,
    fontSize: 9,
    color: palette.ink3,
    letterSpacing: 1.2,
  },
  conceptTitle: {
    fontFamily: font.serifBold,
    fontSize: 22,
    color: palette.ink,
    lineHeight: 28,
    marginBottom: space.xs,
  },
  conceptRule: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.accent,
    lineHeight: 20,
    marginBottom: space.lg,
  },
  conceptRuleSub: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 18,
    marginBottom: space.lg,
  },
  blueprintDivider: {
    height: 1,
    backgroundColor: palette.line,
    marginVertical: space.lg,
  },
  sectionLabel: {
    fontFamily: font.sansBold,
    fontSize: 9,
    color: palette.ink3,
    letterSpacing: 1,
    marginBottom: space.sm,
  },
  formulaBox: {
    backgroundColor: palette.paper,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.lg,
  },
  formulaLinesContainer: {
    gap: space.md,
  },
  formulaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    borderWidth: 1,
    borderColor: palette.line2,
    borderRadius: radius.md,
    padding: space.md,
    backgroundColor: palette.paper,
  },
  formulaLabelBadge: {
    backgroundColor: palette.accent,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 4,
  },
  formulaLabelText: {
    fontFamily: font.sansBold,
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  formulaElementsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  formulaCapsule: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  formulaCapsuleText: {
    fontFamily: font.sansBold,
    fontSize: 11,
  },
  formulaOperatorText: {
    fontFamily: font.sansBold,
    fontSize: 13,
    color: palette.ink3,
    marginHorizontal: 1,
  },
  tooltipCard: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#F2D7B4',
    borderRadius: radius.md,
    padding: space.md,
    marginTop: -space.sm,
    marginBottom: space.lg,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tooltipTitle: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.amber,
    flex: 1,
    letterSpacing: 0.5,
  },
  closeTooltipBtn: {
    padding: 2,
  },
  tooltipBody: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink2,
    lineHeight: 17,
  },
  conceptExplanation: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 20,
  },

  /* Workplace Context / Dialogue examples */
  examplesList: {
    gap: space.lg,
  },
  exampleItem: {
    backgroundColor: palette.paper,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.md,
    padding: space.md,
  },
  exampleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  exampleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent,
  },
  exampleNumLabel: {
    fontFamily: font.sansBold,
    fontSize: 8,
    color: palette.accent,
    letterSpacing: 0.8,
  },
  exampleText: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink,
    lineHeight: 20,
    marginBottom: 8,
  },
  translationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  translationToggleText: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.accent,
  },
  translationHintBox: {
    backgroundColor: palette.card,
    borderRadius: radius.sm,
    padding: space.sm,
    borderWidth: 1,
    borderColor: palette.line2,
    marginBottom: 8,
  },
  translationHintText: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink2,
    fontStyle: 'italic',
  },
  exampleNoteText: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
    lineHeight: 15,
  },

  /* Mistakes styling */
  mistakesList: {
    gap: space.lg,
  },
  mistakeItem: {
    gap: space.sm,
  },
  wrongBox: {
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#FBD5D5',
    borderRadius: radius.md,
    padding: space.md,
  },
  mistakeLabelWrong: {
    fontFamily: font.sansBold,
    fontSize: 8,
    color: '#C75450',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  mistakeSentenceWrong: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: '#9C2A26',
    textDecorationLine: 'line-through',
  },
  rightBox: {
    backgroundColor: '#F3FAF7',
    borderWidth: 1,
    borderColor: '#DEF7EC',
    borderRadius: radius.md,
    padding: space.md,
  },
  mistakeLabelRight: {
    fontFamily: font.sansBold,
    fontSize: 8,
    color: palette.accent,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  mistakeSentenceRight: {
    fontFamily: font.sansBold,
    fontSize: 13,
    color: palette.accentInk,
  },
  whyButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  whyButtonText: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.accent,
  },
  mistakeExplanationBox: {
    backgroundColor: palette.paper,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: palette.line,
  },
  mistakeExplanationText: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink2,
    lineHeight: 18,
  },

  /* Tips List styling */
  tipsList: {
    maxHeight: 380,
  },
  tipCardItem: {
    backgroundColor: palette.paper,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.md,
    padding: space.lg,
    marginBottom: space.md,
  },
  tipCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: 6,
  },
  tipIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipEmoji: {
    fontSize: 16,
  },
  tipCardTitle: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.ink,
  },
  tipCardBody: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink2,
    lineHeight: 18,
  },

  /* Signature Visualization inside Learn cards */
  signatureVisualizationHolder: {
    marginTop: space.sm,
    justifyContent: 'center',
  },

  /* Pagination styles */
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xl,
    marginVertical: space.lg,
  },
  arrowNavButton: {
    padding: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
  },
  pageDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.line,
  },
  pageDotActive: {
    backgroundColor: palette.accent,
    width: 20,
  },
  learnQuickActions: {
    paddingHorizontal: space.xl,
    width: '100%',
    marginTop: space.md,
  },

  /* PRACTICE TAB STYLES */
  practiceContent: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: 100,
  },
  quizProgressHeader: {
    marginBottom: space.lg,
  },
  quizProgressText: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.accent,
    letterSpacing: 1.5,
    marginBottom: space.sm,
  },
  quizProgressBarContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.line,
    overflow: 'hidden',
    marginBottom: space.md,
  },
  quizProgressBarFill: {
    height: '100%',
    backgroundColor: palette.accent,
    borderRadius: 3,
  },
  dotsIndicatorsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quizStatusDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.line2,
  },
  quizStatusDotActive: {
    backgroundColor: palette.gold,
  },
  quizStatusDotCompleted: {
    backgroundColor: palette.accent,
  },
  questionBlock: {
    gap: space.lg,
  },
  questionCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.line,
    padding: space.xl,
  },
  questionCardTitle: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
    lineHeight: 26,
  },
  optionsListContainer: {
    gap: space.md,
  },
  optionBtn: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.lg,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionBtnText: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.ink,
  },
  optionCorrectBtn: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
    borderRadius: radius.lg,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCorrectBtnText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  optionWrongBtn: {
    backgroundColor: '#C75450',
    borderColor: '#C75450',
    borderRadius: radius.lg,
    padding: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionWrongBtnText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  optionMutedBtn: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line2,
    borderRadius: radius.lg,
    padding: space.lg,
    opacity: 0.4,
  },

  /* Ask Maya Trigger in Quiz */
  mayaAssistantTrigger: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.xl,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  mayaAssistantIcon: {
    fontSize: 24,
  },
  mayaAssistantTextCol: {
    flex: 1,
  },
  mayaAssistantTitle: {
    fontFamily: font.sansBold,
    fontSize: 13,
    color: palette.accent,
  },
  mayaAssistantSub: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
    marginTop: 2,
  },

  /* Quiz inline feedback explanation */
  quizExplanationInline: {
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.xl,
    padding: space.lg,
  },
  explanationInlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  explanationInlineTitle: {
    fontFamily: font.sansBold,
    fontSize: 9,
    color: palette.accent,
    letterSpacing: 1.2,
  },
  explanationInlineBody: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.accentInk,
    lineHeight: 19,
  },
  bottomNextContainer: {
    marginTop: space.md,
  },

  /* Results Card screen */
  resultsWrapper: {
    flex: 1,
    padding: space.xl,
    justifyContent: 'center',
  },
  resultsCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.line,
    padding: space.xl,
    alignItems: 'center',
  },
  awardCircleBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  resultsCongratulations: {
    fontFamily: font.serifBold,
    fontSize: 22,
    color: palette.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  resultsTopicTitle: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink2,
    textAlign: 'center',
    marginBottom: space.xl,
  },
  resultsGrid: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: palette.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    paddingVertical: space.lg,
    marginBottom: space.xl,
  },
  resultsGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultsGridDivider: {
    width: 1,
    backgroundColor: palette.line,
  },
  resultsNum: {
    fontFamily: font.serifBold,
    fontSize: 28,
    color: palette.accent,
  },
  resultsLabel: {
    fontFamily: font.sansBold,
    fontSize: 8,
    color: palette.ink3,
    letterSpacing: 1,
    marginTop: 4,
  },
  resultsActionsContainer: {
    width: '100%',
    gap: space.md,
    alignItems: 'center',
  },
  resultsBtn: {
    width: '100%',
  },
  retryPracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: space.sm,
  },
  retryPracticeText: {
    fontFamily: font.sansSemi,
    fontSize: 12,
    color: palette.ink2,
  },

  /* QUICK REFERENCE TAB STYLES */
  quickRefContent: {
    padding: space.xl,
    paddingBottom: 80,
  },
  quickRefSectionLabel: {
    fontFamily: font.sansBold,
    fontSize: 9,
    color: palette.ink3,
    letterSpacing: 1,
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  quickRefFormulaBox: {
    backgroundColor: palette.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.line,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickRefFormulaText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    color: palette.ink,
    flex: 1,
    marginRight: space.md,
  },
  formulaCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    backgroundColor: palette.card,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.line,
  },
  formulaCopyText: {
    fontFamily: font.sansSemi,
    fontSize: 10,
    color: palette.accent,
  },
  quickRefBodyText: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.accent,
    marginBottom: 4,
  },
  quickRefExplanation: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 18,
  },
  quickRefExamplesList: {
    gap: space.md,
  },
  quickRefExampleRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  quickRefExampleDot: {
    fontSize: 16,
    color: palette.accent,
    lineHeight: 18,
  },
  quickRefExampleSentence: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink,
    marginBottom: 2,
  },
  quickRefExampleTranslation: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
    fontStyle: 'italic',
  },

  /* CHALLENGE TIMED TAB STYLES */
  challengeScaffold: {
    flex: 1,
    padding: space.xl,
    justifyContent: 'center',
  },
  challengeCenterCard: {
    alignItems: 'center',
  },
  challengeMainTitle: {
    fontFamily: font.serifBold,
    fontSize: 22,
    color: palette.ink,
    textAlign: 'center',
    marginBottom: 2,
  },
  challengeSubtitle: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    textAlign: 'center',
    marginBottom: space.xl,
  },
  challengeRulesContainer: {
    width: '100%',
    backgroundColor: palette.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.line,
    padding: space.lg,
    gap: space.md,
    marginBottom: space.lg,
  },
  ruleBullet: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'center',
  },
  challengeRuleText: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink2,
    flex: 1,
    lineHeight: 16,
  },

  /* Countdown screen */
  countdownBox: {
    alignItems: 'center',
  },
  countdownTitle: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.ink3,
    letterSpacing: 2,
    marginBottom: space.md,
  },
  countdownNumber: {
    fontFamily: font.serifBold,
    fontSize: 72,
    color: palette.amber,
  },

  /* Gameplay view */
  playingScaffold: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: 60,
  },
  gameplayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.lg,
    gap: 8,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
  },
  timerPillText: {
    fontFamily: font.sansBold,
    fontSize: 12,
    color: palette.accent,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
  },
  streakPillText: {
    fontFamily: font.sansBold,
    fontSize: 12,
    color: palette.amber,
  },
  scorePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.accent,
    borderWidth: 1,
    borderColor: palette.accent,
  },
  scorePillText: {
    fontFamily: font.sansBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  challengeGameOverTitle: {
    fontFamily: font.serifBold,
    fontSize: 22,
    color: '#C75450',
    textAlign: 'center',
    marginBottom: 2,
  },
});

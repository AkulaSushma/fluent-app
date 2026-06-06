import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  FadeOut,
  FadeInRight,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
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
import type { GrammarLessonResponse, GrammarTimeline } from '@/api/client';

const { width: SCREEN_W } = Dimensions.get('window');

/* ------------------------------------------------------------------ */
/*  Timeline Component                                                 */
/* ------------------------------------------------------------------ */
function AnimatedTimeline({ timeline }: { timeline?: GrammarTimeline }) {
  const width = useSharedValue(0);
  const dotScale = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      300,
      withTiming(100, { duration: 1000, easing: Easing.out(Easing.cubic) }),
    );
    dotScale.value = withDelay(
      1200,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
    );
  }, [timeline]);

  const lineStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTitle}>Tense Timeline</Text>
      <View style={styles.timelineTrack}>
        <Animated.View style={[styles.timelineFill, lineStyle]}>
          <LinearGradient
            colors={[palette.accent, palette.accent2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View style={[styles.timelineDot, dotStyle]}>
          <View style={styles.timelineDotInner} />
        </Animated.View>
      </View>
      <View style={styles.timelineLabels}>
        <Text style={styles.timelineLabel}>{timeline?.label_left || 'Past'}</Text>
        <Text style={styles.timelineMarker}>{timeline?.marker || 'Now'}</Text>
        <Text style={styles.timelineLabel}>{timeline?.label_right || 'Future'}</Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */
export default function GrammarScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const topicId = route.params?.topicId || '';
  const topicParam = route.params?.topic || 'Present Perfect vs Past Simple';
  const levelParam = route.params?.level || 'intermediate';

  const { showToast, fireConfetti, submitGrammarQuiz, grammarTopics, fetchGrammarTopics } = useStore();

  const [lesson, setLesson] = useState<GrammarLessonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<number>(1); // 1: Concept, 2: Examples, 3: Mistakes, 4: Quiz, 5: Summary

  // Quiz States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpAwarded, setXpAwarded] = useState<number>(0);
  const quizStartTime = useRef<number>(0);

  // Fetch lesson details
  useEffect(() => {
    let active = true;
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        const res = await api.generateGrammarLesson(topicParam, levelParam.toLowerCase());
        if (active) {
          setLesson(res);
          setIsLoading(false);
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
  }, [topicParam, levelParam]);

  // Fetch grammar topics for Next Topic calculation if not already available
  useEffect(() => {
    if (!grammarTopics) {
      fetchGrammarTopics();
    }
  }, [grammarTopics, fetchGrammarTopics]);

  // Compute Next Unlocked Topic
  const nextTopic = useMemo(() => {
    if (!grammarTopics?.categories) return null;
    const allTopics = grammarTopics.categories.flatMap((c) => c.topics);
    const currentIndex = allTopics.findIndex((t) => t.id === topicId || t.title === topicParam);
    if (currentIndex === -1) return null;
    for (let i = currentIndex + 1; i < allTopics.length; i++) {
      if (!allTopics[i].locked) {
        return allTopics[i];
      }
    }
    return null;
  }, [grammarTopics, topicId, topicParam]);

  const handleNextTopic = () => {
    if (nextTopic) {
      setPhase(1);
      setCurrentQuestionIdx(0);
      setSelectedAnswer(null);
      setCorrectCount(0);
      setXpAwarded(0);
      navigation.replace('GrammarLesson', {
        topicId: nextTopic.id,
        topic: nextTopic.title,
        level: nextTopic.levelLabel,
      });
    }
  };

  const handleReviewTopic = () => {
    setPhase(1);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setXpAwarded(0);
  };

  const handleBackToHub = () => {
    navigation.navigate('Grammar');
  };

  const handleSelectQuizAnswer = (idx: number) => {
    if (selectedAnswer !== null || !lesson) return;
    setSelectedAnswer(idx);

    const question = lesson.quiz[currentQuestionIdx];
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
    const isLastQuestion = currentQuestionIdx === lesson.quiz.length - 1;

    if (isLastQuestion) {
      // Calculate elapsed time
      const elapsed = (Date.now() - quizStartTime.current) / 1000;
      setIsLoading(true);

      const result = await submitGrammarQuiz({
        topic_id: topicId || lesson.topic,
        correct_count: correctCount,
        total_questions: lesson.quiz.length,
        time_spent_seconds: Math.round(elapsed),
      });

      setIsLoading(false);

      if (result) {
        setXpAwarded(result.xp_awarded);
      } else {
        const fallbackXp = correctCount === lesson.quiz.length ? 50 : correctCount >= 4 ? 25 : 10;
        setXpAwarded(fallbackXp);
        if (correctCount >= 4) {
          fireConfetti();
        }
      }

      await api.logSession('grammar', Math.round(elapsed), Math.round((correctCount / lesson.quiz.length) * 100));
      setPhase(5);
    } else {
      setCurrentQuestionIdx((idx) => idx + 1);
      setSelectedAnswer(null);
    }
  };

  const handleStartQuiz = () => {
    setPhase(4);
    quizStartTime.current = Date.now();
  };

  if (isLoading || !lesson) {
    return (
      <View style={[styles.loadingScreen, { paddingTop: insets.top }]}>
        <Header title="Grammar Engine" showBack={true} />
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Synthesizing custom interactive grammar lesson...</Text>
        </View>
      </View>
    );
  }

  // Choose level badge styles
  let badgeBg: string = palette.accentSoft;
  let badgeText: string = palette.accentInk;
  if (lesson.levelLabel?.toLowerCase().includes('intermediate')) {
    badgeBg = '#EFF6FF';
    badgeText = '#1E40AF';
  } else if (lesson.levelLabel?.toLowerCase().includes('advanced')) {
    badgeBg = '#F5F3FF';
    badgeText = '#5B21B6';
  } else if (lesson.levelLabel?.toLowerCase().includes('pro')) {
    badgeBg = '#FEF3C7';
    badgeText = '#92400E';
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Grammar Engine" showBack={true} />
      <Confetti />

      {/* PHASE 1: Concept Introduction */}
      {phase === 1 && (
        <Animated.View
          key="phase-concept"
          entering={FadeInRight.duration(400)}
          exiting={FadeOut.duration(200)}
          style={styles.flexOne}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.conceptTitle}>{lesson.topic}</Text>
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.badgeText, { color: badgeText }]}>{lesson.levelLabel}</Text>
              </View>
            </View>

            {/* Monospace Formula Card */}
            <Card index={0} style={styles.formulaCard}>
              <Text style={styles.formulaLabel}>STRUCTURE FORMULA</Text>
              <Text style={styles.formulaText}>{lesson.formula}</Text>
            </Card>

            {/* Timeline (if exists) */}
            {lesson.timeline && <AnimatedTimeline timeline={lesson.timeline} />}

            {/* Core Rule & Explanation */}
            <View style={styles.explanationSection}>
              <Text style={styles.ruleLargeText}>{lesson.rule}</Text>
              <Text style={styles.explanationText}>{lesson.explanation}</Text>
            </View>

            {/* Horizontal Swipeable Tip Cards */}
            {lesson.tipCards && lesson.tipCards.length > 0 && (
              <View style={styles.tipsSection}>
                <Text style={styles.sectionTitle}>Key Tips</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tipsScroll}
                  snapToInterval={SCREEN_W - space.xl * 2 + space.md}
                  decelerationRate="fast"
                >
                  {lesson.tipCards.map((tip, idx) => (
                    <View key={idx} style={[styles.tipCard, shadow.card]}>
                      <Text style={styles.tipEmoji}>{tip.emoji || '💡'}</Text>
                      <Text style={styles.tipCardTitle}>{tip.title}</Text>
                      <Text style={styles.tipCardBody}>{tip.body}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Floating Dock Continue Button */}
          <View style={styles.dock}>
            <LinearGradient
              colors={['rgba(244, 241, 235, 0)', 'rgba(244, 241, 235, 0.95)', 'rgba(244, 241, 235, 1)']}
              style={styles.dockGradient}
            />
            <View style={styles.dockButtonWrapper}>
              <Button label="Continue  →" onPress={() => setPhase(2)} variant="accent" />
            </View>
          </View>
        </Animated.View>
      )}

      {/* PHASE 2: Interactive Examples */}
      {phase === 2 && (
        <Animated.View
          key="phase-examples"
          entering={FadeInRight.duration(400)}
          exiting={FadeOut.duration(200)}
          style={styles.flexOne}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseKicker}>PHASE 2 OF 5</Text>
              <Text style={styles.phaseTitle}>Interactive Examples</Text>
              <Text style={styles.phaseSubtitle}>Analyze how these sentences are formed</Text>
            </View>

            {lesson.examples.map((example, idx) => (
              <Card key={idx} index={idx} style={styles.exampleCard}>
                <Text style={styles.exampleSentence}>{example.sentence}</Text>

                {/* Token Pills Row */}
                <View style={styles.tokensRow}>
                  {example.tokens.map((tok, tIdx) => {
                    let pillBg: string = palette.line2;
                    let pillText: string = palette.ink2;
                    const role = tok.role.toLowerCase();

                    if (role.includes('subject')) {
                      pillBg = '#E9EFEA';
                      pillText = palette.accentInk;
                    } else if (role.includes('verb') || role.includes('tense')) {
                      pillBg = '#F6EADB';
                      pillText = palette.amber;
                    }

                    return (
                      <View key={tIdx} style={[styles.tokenPill, { backgroundColor: pillBg }]}>
                        <Text style={[styles.tokenLabelText, { color: pillText }]}>{tok.text}</Text>
                        <Text style={styles.tokenRoleText}>{tok.role}</Text>
                      </View>
                    );
                  })}
                </View>

                {example.translation_hint ? (
                  <Text style={styles.translationText}>"{example.translation_hint}"</Text>
                ) : null}

                <View style={styles.exampleDivider} />
                <Text style={styles.exampleNote}>{example.note}</Text>
              </Card>
            ))}

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Floating Dock Continue Button */}
          <View style={styles.dock}>
            <LinearGradient
              colors={['rgba(244, 241, 235, 0)', 'rgba(244, 241, 235, 0.95)', 'rgba(244, 241, 235, 1)']}
              style={styles.dockGradient}
            />
            <View style={styles.dockButtonWrapper}>
              <Button label="Continue  →" onPress={() => setPhase(3)} variant="accent" />
            </View>
          </View>
        </Animated.View>
      )}

      {/* PHASE 3: Common Mistakes */}
      {phase === 3 && (
        <Animated.View
          key="phase-mistakes"
          entering={FadeInRight.duration(400)}
          exiting={FadeOut.duration(200)}
          style={styles.flexOne}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseKicker}>PHASE 3 OF 5</Text>
              <Text style={styles.phaseTitle}>Watch Out! ⚠️</Text>
              <Text style={styles.phaseSubtitle}>Common mistakes to spot and avoid</Text>
            </View>

            {lesson.commonMistakes.map((mistake, idx) => (
              <Card key={idx} index={idx} style={styles.mistakeCard}>
                {/* Incorrect Row */}
                <View style={styles.mistakeRowWrong}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" style={styles.mistakeIcon} />
                  <View style={styles.mistakeSentenceCol}>
                    <Text style={styles.mistakeSentenceWrong}>{mistake.wrong}</Text>
                    <Text style={styles.mistakeLabelWrong}>INCORRECT</Text>
                  </View>
                </View>

                {/* Correct Row */}
                <View style={styles.mistakeRowRight}>
                  <Ionicons name="checkmark-circle" size={20} color={palette.accent} style={styles.mistakeIcon} />
                  <View style={styles.mistakeSentenceCol}>
                    <Text style={styles.mistakeSentenceRight}>{mistake.right}</Text>
                    <Text style={styles.mistakeLabelRight}>CORRECT</Text>
                  </View>
                </View>

                {/* Explanation */}
                <View style={styles.mistakeExplanationContainer}>
                  <Text style={styles.mistakeExplanation}>{mistake.explanation}</Text>
                </View>
              </Card>
            ))}

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Floating Dock Start Quiz Button */}
          <View style={styles.dock}>
            <LinearGradient
              colors={['rgba(244, 241, 235, 0)', 'rgba(244, 241, 235, 0.95)', 'rgba(244, 241, 235, 1)']}
              style={styles.dockGradient}
            />
            <View style={styles.dockButtonWrapper}>
              <Button label="Start Quiz  →" onPress={handleStartQuiz} variant="accent" />
            </View>
          </View>
        </Animated.View>
      )}

      {/* PHASE 4: Practice Quiz */}
      {phase === 4 && (
        <Animated.View
          key="phase-quiz"
          entering={FadeInRight.duration(400)}
          exiting={FadeOut.duration(200)}
          style={styles.flexOne}
        >
          {(() => {
            const quizQuestions = lesson.quiz || [];
            const question = quizQuestions[currentQuestionIdx];

            if (!question) {
              return (
                <View style={styles.emptyQuiz}>
                  <Text style={styles.emptyQuizText}>No practice questions available for this topic.</Text>
                  <Button label="Complete Lesson" onPress={() => setPhase(5)} variant="accent" />
                </View>
              );
            }

            const totalQ = quizQuestions.length;
            const progress = (currentQuestionIdx / totalQ) * 100;
            const hasAnswered = selectedAnswer !== null;

            return (
              <View style={styles.flexOne}>
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Progress Header */}
                  <View style={styles.quizHeader}>
                    <Text style={styles.quizProgressText}>
                      Question {currentQuestionIdx + 1} of {totalQ}
                    </Text>
                    <View style={styles.quizProgressBarTrack}>
                      <View style={[styles.quizProgressBarFill, { width: `${progress}%` }]} />
                    </View>
                  </View>

                  {/* Question Title */}
                  <Card index={0} style={styles.quizCard}>
                    <Text style={styles.quizQuestionText}>{question.q}</Text>
                  </Card>

                  {/* Options */}
                  <View style={styles.quizOptionsCol}>
                    {question.options.map((opt, idx) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === question.answer;

                      let optionBorder: string = palette.line;
                      let optionBg: string = palette.card;
                      let optionText: string = palette.ink;
                      let icon = null;

                      if (hasAnswered) {
                        if (isCorrect) {
                          optionBorder = palette.accent;
                          optionBg = palette.accentSoft;
                          optionText = palette.accentInk;
                          icon = <Ionicons name="checkmark-circle" size={20} color={palette.accent} />;
                        } else if (isSelected) {
                          optionBorder = '#EF4444';
                          optionBg = '#FEF2F2';
                          optionText = '#B91C1C';
                          icon = <Ionicons name="close-circle" size={20} color="#EF4444" />;
                        } else {
                          optionBorder = palette.line2;
                          optionBg = palette.card;
                          optionText = palette.ink3;
                        }
                      } else if (isSelected) {
                        optionBorder = palette.accent;
                      }

                      return (
                        <TouchableOpacity
                          key={idx}
                          disabled={hasAnswered}
                          onPress={() => handleSelectQuizAnswer(idx)}
                          style={[
                            styles.quizOptionBtn,
                            { borderColor: optionBorder, backgroundColor: optionBg },
                            shadow.card,
                          ]}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.quizOptionText, { color: optionText }]}>{opt}</Text>
                          {icon}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Explanation Banner */}
                  {hasAnswered && (
                    <Animated.View entering={FadeInDown.duration(350)}>
                      <Card index={1} style={selectedAnswer === question.answer ? styles.feedbackCorrectCard : styles.feedbackWrongCard}>
                        <Text style={styles.feedbackCardTitle}>
                          {selectedAnswer === question.answer ? '🎯 Correct!' : '💡 Explanation'}
                        </Text>
                        <Text style={styles.feedbackCardBody}>
                          {question.explanation || 'Perfect syntax analysis.'}
                        </Text>
                      </Card>
                    </Animated.View>
                  )}

                  <View style={{ height: 120 }} />
                </ScrollView>

                {/* Floating Dock Next Button */}
                {hasAnswered && (
                  <View style={styles.dock}>
                    <LinearGradient
                      colors={['rgba(244, 241, 235, 0)', 'rgba(244, 241, 235, 0.95)', 'rgba(244, 241, 235, 1)']}
                      style={styles.dockGradient}
                    />
                    <View style={styles.dockButtonWrapper}>
                      <Button
                        label={currentQuestionIdx === totalQ - 1 ? 'Show Summary  →' : 'Next Question  →'}
                        onPress={handleQuizNext}
                        variant="accent"
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          })()}
        </Animated.View>
      )}

      {/* PHASE 5: Mastery Summary */}
      {phase === 5 && (
        <Animated.View
          key="phase-summary"
          entering={FadeInRight.duration(400)}
          exiting={FadeOut.duration(200)}
          style={styles.flexOne}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryCenter}>
              <View style={styles.successIconOuter}>
                <Ionicons name="ribbon" size={48} color={palette.gold} />
              </View>

              <Text style={styles.summaryTitle}>Topic Completed!</Text>
              <Text style={styles.summaryTopicName}>{lesson.topic}</Text>

              {/* Score Display Card */}
              <Card index={0} style={styles.summaryCard}>
                <Text style={styles.summaryScoreLabel}>QUIZ SCORE</Text>
                <Text style={styles.summaryScoreNum}>
                  {correctCount}/{lesson.quiz.length}
                </Text>
                <Text style={styles.summaryPerformance}>
                  {correctCount === lesson.quiz.length
                    ? 'Perfect!'
                    : correctCount >= 4
                      ? 'Excellent!'
                      : correctCount >= 3
                        ? 'Good job!'
                        : 'Keep practicing!'}
                </Text>
              </Card>

              {/* XP Award Banner */}
              <View style={styles.xpAwardBanner}>
                <Ionicons name="sparkles" size={18} color={palette.amber} />
                <Text style={styles.xpAwardText}>+{xpAwarded} XP Awarded</Text>
              </View>

              {/* Action Buttons Stack */}
              <View style={styles.summaryButtons}>
                {nextTopic ? (
                  <Button label="Next Topic  →" onPress={handleNextTopic} variant="accent" style={styles.summaryBtn} />
                ) : null}

                <Button label="Review This Topic" onPress={handleReviewTopic} variant="ghost" style={styles.summaryBtn} />

                <TouchableOpacity onPress={handleBackToHub} style={styles.backToHubLink}>
                  <Text style={styles.backToHubText}>Back to Grammar Hub</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 60 }} />
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  flexOne: {
    flex: 1,
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
  scrollContent: {
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    gap: space.lg,
  },

  /* titles & headers */
  titleContainer: {
    marginTop: space.xs,
    gap: space.xs,
  },
  conceptTitle: {
    fontFamily: font.serifMed,
    fontSize: 28,
    color: palette.ink,
    lineHeight: 34,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontFamily: font.sansBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  /* formula card */
  formulaCard: {
    backgroundColor: palette.accentSoft,
    borderColor: 'rgba(55, 86, 61, 0.15)',
    borderWidth: 1,
    padding: space.lg,
  },
  formulaLabel: {
    fontFamily: font.sansSemi,
    fontSize: 10,
    color: palette.accentInk,
    letterSpacing: 1,
    marginBottom: 6,
  },
  formulaText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 15,
    fontWeight: 'bold',
    color: palette.ink,
  },

  /* timeline */
  timelineContainer: {
    backgroundColor: palette.card,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: palette.line2,
  },
  timelineTitle: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.ink3,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: space.lg,
  },
  timelineTrack: {
    height: 4,
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    position: 'relative',
    marginBottom: space.md,
    justifyContent: 'center',
  },
  timelineFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
  },
  timelineDot: {
    position: 'absolute',
    right: -7,
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineLabel: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
  },
  timelineMarker: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.accent,
  },

  /* explanation sections */
  explanationSection: {
    gap: space.md,
  },
  ruleLargeText: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
    lineHeight: 25,
  },
  explanationText: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink2,
    lineHeight: 22,
  },

  /* tips slider */
  tipsSection: {
    marginTop: space.sm,
    gap: space.md,
  },
  sectionTitle: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
  },
  tipsScroll: {
    gap: space.md,
    paddingVertical: space.xs,
  },
  tipCard: {
    width: SCREEN_W - space.xl * 2 - space.md,
    backgroundColor: palette.card,
    borderRadius: radius.md,
    padding: space.xl,
    borderWidth: 1,
    borderColor: palette.line2,
    gap: space.sm,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipCardTitle: {
    fontFamily: font.serifMed,
    fontSize: 16,
    color: palette.ink,
  },
  tipCardBody: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 18,
  },

  /* floating button docks */
  dock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
  },
  dockGradient: {
    ...StyleSheet.absoluteFill,
  },
  dockButtonWrapper: {
    paddingHorizontal: space.xl,
    paddingBottom: 22,
  },

  /* phase descriptions */
  phaseHeader: {
    marginVertical: space.sm,
    gap: 2,
  },
  phaseKicker: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.ink3,
    letterSpacing: 1.2,
  },
  phaseTitle: {
    fontFamily: font.serifMed,
    fontSize: 26,
    color: palette.ink,
  },
  phaseSubtitle: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
  },

  /* interactive examples */
  exampleCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    gap: space.md,
    borderWidth: 1,
    borderColor: palette.line,
  },
  exampleSentence: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
    lineHeight: 24,
  },
  tokensRow: {
    flexDirection: 'row',
    gap: space.sm,
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  tokenPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: 2,
  },
  tokenLabelText: {
    fontFamily: font.sansSemi,
    fontSize: 14,
  },
  tokenRoleText: {
    fontFamily: font.sansReg,
    fontSize: 9,
    color: palette.ink3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  translationText: {
    fontFamily: font.sansReg,
    fontStyle: 'italic',
    fontSize: 13,
    color: palette.ink2,
    marginTop: 2,
  },
  exampleDivider: {
    height: 1,
    backgroundColor: palette.line,
  },
  exampleNote: {
    fontFamily: font.sansReg,
    fontSize: 12.5,
    color: palette.ink2,
    lineHeight: 18,
  },

  /* mistakes */
  mistakeCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: palette.line,
    gap: space.lg,
  },
  mistakeRowWrong: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: space.md,
    borderRadius: radius.md,
    borderColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
  },
  mistakeRowRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.accentSoft,
    padding: space.md,
    borderRadius: radius.md,
    borderColor: 'rgba(55, 86, 61, 0.12)',
    borderWidth: 1,
  },
  mistakeIcon: {
    marginTop: 2,
    marginRight: space.sm,
  },
  mistakeSentenceCol: {
    flex: 1,
    gap: 3,
  },
  mistakeSentenceWrong: {
    fontFamily: font.sansReg,
    textDecorationLine: 'line-through',
    fontSize: 14.5,
    color: '#991B1B',
  },
  mistakeSentenceRight: {
    fontFamily: font.sansSemi,
    fontSize: 14.5,
    color: palette.accentInk,
  },
  mistakeLabelWrong: {
    fontFamily: font.sansBold,
    fontSize: 8.5,
    color: '#EF4444',
    letterSpacing: 0.6,
  },
  mistakeLabelRight: {
    fontFamily: font.sansBold,
    fontSize: 8.5,
    color: palette.accent,
    letterSpacing: 0.6,
  },
  mistakeExplanationContainer: {
    borderTopWidth: 1,
    borderTopColor: palette.line2,
    paddingTop: space.md,
  },
  mistakeExplanation: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 19,
  },

  /* quiz style */
  quizHeader: {
    gap: space.xs,
    marginTop: space.sm,
  },
  quizProgressText: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.ink3,
    letterSpacing: 0.5,
  },
  quizProgressBarTrack: {
    height: 4,
    backgroundColor: palette.line,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  quizProgressBarFill: {
    height: '100%',
    backgroundColor: palette.accent,
    borderRadius: radius.pill,
  },
  quizCard: {
    paddingVertical: space.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.card,
  },
  quizQuestionText: {
    fontFamily: font.serifMed,
    fontSize: 20,
    color: palette.ink,
    textAlign: 'center',
    lineHeight: 28,
  },
  quizOptionsCol: {
    gap: space.md,
  },
  quizOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: space.lg,
  },
  quizOptionText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    flex: 1,
  },
  emptyQuiz: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.xxl,
    gap: space.lg,
  },
  emptyQuizText: {
    fontFamily: font.serifReg,
    fontSize: 16,
    color: palette.ink2,
    textAlign: 'center',
  },

  /* quiz feedback card */
  feedbackCorrectCard: {
    backgroundColor: palette.accentSoft,
    borderColor: 'rgba(55, 86, 61, 0.15)',
    borderWidth: 1,
    gap: space.xs,
  },
  feedbackWrongCard: {
    backgroundColor: palette.amberSoft,
    borderColor: 'rgba(178, 107, 34, 0.15)',
    borderWidth: 1,
    gap: space.xs,
  },
  feedbackCardTitle: {
    fontFamily: font.sansSemi,
    fontSize: 13,
    color: palette.ink,
  },
  feedbackCardBody: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 18,
  },

  /* summary screen styling */
  summaryCenter: {
    alignItems: 'center',
    paddingTop: space.xl,
    gap: space.lg,
  },
  successIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  summaryTitle: {
    fontFamily: font.serifBold,
    fontSize: 26,
    color: palette.ink,
  },
  summaryTopicName: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink2,
    textAlign: 'center',
    paddingHorizontal: space.xl,
    marginTop: -space.sm,
  },
  summaryCard: {
    width: '100%',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xxl,
  },
  summaryScoreLabel: {
    fontFamily: font.sansSemi,
    fontSize: 10,
    color: palette.ink3,
    letterSpacing: 1,
  },
  summaryScoreNum: {
    fontFamily: font.serifBold,
    fontSize: 48,
    color: palette.ink,
  },
  summaryPerformance: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpAwardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: palette.gold,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 6,
  },
  xpAwardText: {
    fontFamily: font.sansSemi,
    fontSize: 12.5,
    color: '#92400E',
  },
  summaryButtons: {
    width: '100%',
    gap: space.md,
    marginTop: space.md,
  },
  summaryBtn: {
    width: '100%',
  },
  backToHubLink: {
    alignSelf: 'center',
    paddingVertical: space.md,
  },
  backToHubText: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.accent,
  },
});

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';

import Card from '@/components/Card';
import PressableScale from '@/components/PressableScale';
import StreakPill from '@/components/StreakPill';
import ProgressRing from '@/components/ProgressRing';
import BarChart from '@/components/BarChart';
import Button from '@/components/Button';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';
import { api } from '@/api/client';

const { width: SCREEN_W } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<any>>();
  const isFocused = useIsFocused();

  const {
    streak,
    fluency,
    minutesWeek,
    goalProgress,
    dailyMinutes,
    userSettings,
    name,
    initials,
    deck,
    curriculumDay,
    curriculumPhase,
    srsDueCount,
    xp,
    xpLevel,
    xpLevelTitle,
    xpProgress,
    dailyPlanProgress,
    morningTasks,
    eveningTasks,
    grammarTopics,
    challenges,
    fetchProgress,
    fetchCurriculumToday,
    fetchXpState,
    fetchSettings,
    fetchGrammarTopics,
    fetchChallenges,
  } = useStore();

  const [recommendation, setRecommendation] = useState<string>(
    "Loading your personalized tip..."
  );

  const loadHomeData = async () => {
    try {
      const [_, __, ___, ____, _____, ______, rec] = await Promise.all([
        fetchProgress(),
        fetchCurriculumToday(),
        fetchXpState(),
        fetchSettings(),
        fetchGrammarTopics(),
        fetchChallenges(),
        api.getContentRecommendation(),
      ]);
      setRecommendation(rec.message);
    } catch (err) {
      console.error('Error loading home data:', err);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadHomeData();
    }
  }, [isFocused]);

  const allCurrentTasks = [...morningTasks, ...eveningTasks];
  const isTTCompleted = allCurrentTasks.some(t => t.type === 'pronunciation' && t.completed);
  const isSpeakingCompleted = allCurrentTasks.some(t => t.type === 'speaking' && t.completed);
  const isTutorCompleted = allCurrentTasks.some(t => (t.type === 'tutor' || t.type === 'chat') && t.completed);
  const isReaderCompleted = allCurrentTasks.some(t => t.type === 'reading' && t.completed);
  const isCoachCompleted = allCurrentTasks.some(t => t.type === 'speaking' && t.completed);
  const isObjectCompleted = allCurrentTasks.some(t => t.type === 'vocab' && t.completed);

  const LESSONS = [
    {
      id: 'grammar',
      emoji: '🧩',
      title: 'Grammar lessons',
      sub: grammarTopics ? `${Math.round(grammarTopics.overallMastery)}% overall mastery` : 'Structure and rules',
      pct: grammarTopics ? (grammarTopics.overallMastery / 100) : 0.0,
      screen: 'Grammar',
    },
    {
      id: 'tongue_twister',
      emoji: '🗣️',
      title: 'Tongue Twister',
      sub: isTTCompleted ? 'Completed today' : 'Daily voice drills',
      pct: isTTCompleted ? 1.0 : 0.0,
      screen: 'TongueTwister',
    },
    {
      id: 'pronunciation',
      emoji: '🎙️',
      title: 'Speaking Lab',
      sub: isSpeakingCompleted ? 'Completed today' : 'Evaluate pronunciation',
      pct: isSpeakingCompleted ? 1.0 : 0.0,
      screen: 'Teleprompter',
    },
    {
      id: 'vocab',
      emoji: '💼',
      title: 'Vocabulary Deck',
      sub: deck.progress > 0 ? `${Math.round(deck.progress * 100)}% complete` : 'Active memory deck',
      pct: deck.progress,
      screen: 'Vocab',
    },
    {
      id: 'tutor',
      emoji: '🤖',
      title: 'AI Tutor Chat',
      sub: isTutorCompleted ? 'Completed today' : 'Practice conversation',
      pct: isTutorCompleted ? 1.0 : 0.0,
      screen: 'Tutor',
    },
    {
      id: 'corporate_coach',
      emoji: '💼',
      title: 'Corporate Coach',
      sub: isCoachCompleted ? 'Completed today' : 'Professional speak',
      pct: isCoachCompleted ? 1.0 : 0.0,
      screen: 'CorporateCoach',
    },
    {
      id: 'tech_article',
      emoji: '📰',
      title: 'Executive Reader',
      sub: isReaderCompleted ? 'Completed today' : 'Analyze trade-offs',
      pct: isReaderCompleted ? 1.0 : 0.0,
      screen: 'TechArticle',
    },
    {
      id: 'object_naming',
      emoji: '🖼️',
      title: 'Object Naming',
      sub: isObjectCompleted ? 'Completed today' : 'What is this called?',
      pct: isObjectCompleted ? 1.0 : 0.0,
      screen: 'ObjectNaming',
    },
  ];

  const firstName = name.split(' ')[0];
  const todayMinutes = dailyMinutes[6] || 0;
  const goalMinutes = userSettings?.daily_goal_minutes || 30;
  const goalRatio = Math.min(todayMinutes / goalMinutes, 1);

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Combine tasks to display brief planner on home
  const allTasks = [...morningTasks, ...eveningTasks].slice(0, 3);

  return (
    <ScrollView
      style={[styles.scroll, { paddingTop: insets.top + 8 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header row ─────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(0).springify().damping(18)}
        style={styles.headerRow}
      >
        <View style={styles.headerText}>
          <Text style={styles.kicker}>{dateStr.toUpperCase()}</Text>
          <Text style={styles.greeting}>
            Good evening,{'\n'}
            {firstName}. Let's get{' '}
            <Text style={styles.greetingAccent}>fluent</Text>.
          </Text>
        </View>

        <PressableScale onPress={() => nav.navigate('ProfileTab')}>
          <LinearGradient
            colors={[palette.accent2, palette.accent]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <LinearGradient
            colors={[palette.gold, palette.amber]}
            style={styles.levelBadge}
          >
            <Text style={styles.levelText}>{xpLevel}</Text>
          </LinearGradient>
        </PressableScale>
      </Animated.View>

      {/* ── Streak & XP row ─────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(60).springify().damping(18)}
        style={styles.streakXpRow}
      >
        <StreakPill streak={streak} />
        <View style={styles.levelInfo}>
          <View style={styles.xpTextRow}>
            <Text style={styles.xpLevelLabel}>{xpLevelTitle}</Text>
            <Text style={styles.xpValueText}>{xp} XP</Text>
          </View>
          <View style={styles.xpBarBackground}>
            <LinearGradient
              colors={[palette.accent2, palette.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.xpBarFill, { width: `${xpProgress * 100}%` as any }]}
            />
          </View>
        </View>
      </Animated.View>

      {/* ── Spaced Repetition Review Prompt Alert ───────── */}
      {srsDueCount > 0 && (
        <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
          <PressableScale
            onPress={() => nav.navigate('ReviewStack', { screen: 'Review' })}
            style={[styles.srsAlertCard, shadow.card]}
          >
            <View style={styles.srsAlertLeft}>
              <View style={styles.srsBadgeCircle}>
                <Ionicons name="repeat" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.srsAlertTextCol}>
                <Text style={styles.srsAlertTitle}>Reviews Waiting</Text>
                <Text style={styles.srsAlertSub}>
                  You have {srsDueCount} words due for spaced-repetition.
                </Text>
              </View>
            </View>
            <View style={styles.srsGoCircle}>
              <Ionicons name="arrow-forward" size={16} color={palette.accent} />
            </View>
          </PressableScale>
        </Animated.View>
      )}

      {/* ── Adaptive Hero card ─────────────────────────── */}
      <Card index={1} dark style={styles.heroCard}>
        <View style={styles.sheenOverlay} />
        <Text style={styles.heroKicker}>ADAPTIVE FEEDBACK</Text>
        <Text style={styles.heroTitle}>{recommendation}</Text>
        <Text style={styles.heroSub}>
          Curriculum Phase: {curriculumPhase.charAt(0).toUpperCase() + curriculumPhase.slice(1)} (Day {curriculumDay}/90)
        </Text>

        <Button
          label="Today's missions"
          variant="light"
          icon="→"
          onPress={() => nav.navigate('Plan')}
          style={{ marginTop: space.lg }}
        />
      </Card>

      {/* ── Stat row ──────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(210).springify().damping(18)}
        style={styles.statRow}
      >
        {/* Fluency */}
        <View style={[styles.statCard, shadow.card]}>
          <Text style={styles.statLabel}>Fluency</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{fluency}</Text>
            <View style={styles.trendBadge}>
              <Text style={styles.trendText}>↑ 12%</Text>
            </View>
          </View>
        </View>

        {/* Minutes */}
        <View style={[styles.statCard, shadow.card]}>
          <Text style={styles.statLabel}>Minutes</Text>
          <Text style={styles.statValue}>{minutesWeek}</Text>
          <Text style={styles.statUnit}>min · this week</Text>
        </View>
      </Animated.View>

      {/* ── Daily goal card ───────────────────────────── */}
      <Card index={4}>
        <View style={styles.goalRow}>
          <ProgressRing progress={dailyPlanProgress} size={72} strokeWidth={7}>
            <Text style={styles.goalPct}>{Math.round(dailyPlanProgress * 100)}%</Text>
          </ProgressRing>
          <View style={styles.goalText}>
            <Text style={styles.goalTitle}>
              {Math.round(dailyPlanProgress * 100)}% objectives complete
            </Text>
            <Text style={styles.goalSub}>
              Hit 100% on your daily plan to unlock tomorrow's syllabus day.
            </Text>
          </View>
        </View>

        <View style={styles.goalDivider} />

        <View style={styles.practiceGoalRow}>
          <View style={styles.practiceTextContainer}>
            <View style={styles.practiceTitleRow}>
              <Text style={styles.practiceGoalTitle}>Daily Study Target</Text>
              <Text style={styles.practiceGoalValue}>
                {todayMinutes} / {goalMinutes} min
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${goalRatio * 100}%` }]} />
            </View>
            <Text style={styles.practiceGoalSub}>
              {todayMinutes >= goalMinutes
                ? "🎉 Daily study goal reached! Great job!"
                : `${goalMinutes - todayMinutes} more minutes to hit your daily target.`}
            </Text>
          </View>
        </View>
      </Card>

      {/* ── Daily Challenges Card ──────────────────────── */}
      <Card index={4.5}>
        <View style={styles.challengesHeader}>
          <Text style={styles.sectionTitle}>Daily Challenges</Text>
          <View style={styles.challengesPill}>
            <Text style={styles.challengesPillText}>TODAY</Text>
          </View>
        </View>
        
        <View style={styles.challengesList}>
          {challenges && challenges.length > 0 ? (
            challenges.map((challenge) => {
              // Custom colors based on challenge id
              let accentColor: string = palette.accent;
              let bgAccentColor: string = palette.accentSoft;
              if (challenge.id === 'daily_vocab') {
                accentColor = palette.amber;
                bgAccentColor = palette.amberSoft;
              } else if (challenge.id === 'daily_practice') {
                accentColor = palette.accent;
                bgAccentColor = palette.accentSoft;
              } else if (challenge.id === 'daily_srs') {
                accentColor = palette.gold;
                bgAccentColor = 'rgba(217, 164, 65, 0.12)';
              }

              return (
                <View key={challenge.id} style={styles.challengeItem}>
                  <View style={styles.challengeRow}>
                    <View style={[styles.challengeEmojiBg, { backgroundColor: bgAccentColor }]}>
                      <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
                    </View>
                    
                    <View style={styles.challengeContent}>
                      <View style={styles.challengeTitleRow}>
                        <Text style={styles.challengeTitle}>{challenge.title}</Text>
                        {challenge.completed ? (
                          <View style={styles.xpBadgeDone}>
                            <Text style={styles.xpBadgeTextDone}>+{challenge.xp_reward} XP</Text>
                          </View>
                        ) : (
                          <View style={styles.xpBadge}>
                            <Text style={styles.xpBadgeText}>+{challenge.xp_reward} XP</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.challengeDesc}>{challenge.description}</Text>
                      
                      <View style={styles.challengeProgressContainer}>
                        <View style={styles.challengeProgressBarTrack}>
                          <LinearGradient
                            colors={[accentColor, accentColor]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.challengeProgressBarFill,
                              { width: `${challenge.progress * 100}%` as any },
                            ]}
                          />
                        </View>
                        <Text style={styles.challengeProgressVal}>
                          {Math.round(challenge.progress * 100)}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.challengeStatus}>
                      {challenge.completed ? (
                        <View style={[styles.challengeCheckCircle, { backgroundColor: accentColor }]}>
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View style={styles.challengePendingCircle}>
                          <Ionicons name="ellipse-outline" size={18} color={palette.ink3} />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <ActivityIndicator size="small" color={palette.accent} style={{ marginVertical: space.md }} />
          )}
        </View>
      </Card>

      {/* ── Minutes spoken ────────────────────────────── */}
      <Card index={5}>
        <Text style={styles.sectionTitle}>Minutes spoken</Text>
        <BarChart data={dailyMinutes} />
      </Card>

      {/* ── Today's plan preview ──────────────────────── */}
      {allTasks.length > 0 && (
        <Card index={6}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Missions</Text>
            <PressableScale onPress={() => nav.navigate('Plan')}>
              <Text style={styles.seeAllText}>See Plan</Text>
            </PressableScale>
          </View>
          {allTasks.map((task, i) => (
            <PressableScale
              key={task.id}
              onPress={() => nav.navigate('Plan')}
              style={[
                styles.taskRow,
                i < allTasks.length - 1 ? styles.taskBorder : null,
              ] as any}
            >
              <View
                style={[
                  styles.taskCheck,
                  task.completed && styles.taskCheckDone,
                ]}
              >
                {task.completed && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <View style={styles.taskTextCol}>
                <Text
                  style={[
                    styles.taskTitle,
                    task.completed && styles.taskTitleDone,
                  ]}
                >
                  {task.title}
                </Text>
                <Text style={styles.taskSub}>{task.subtitle}</Text>
              </View>
              {!task.completed && <Text style={styles.chevron}>›</Text>}
            </PressableScale>
          ))}
        </Card>
      )}

      {/* ── Jump back in ──────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(490).springify().damping(18)}
      >
        <Text style={styles.sectionTitleLarge}>Interactive drills</Text>
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lessonsScroll}
      >
        {LESSONS.map((lesson, idx) => (
          <Animated.View
            key={lesson.id}
            entering={FadeInRight.delay(540 + idx * 90).springify().damping(18)}
          >
            <PressableScale
              onPress={() => {
                if (lesson.screen === 'ObjectNaming') {
                  nav.navigate('ObjectNamingStack');
                } else if (
                  lesson.screen === 'TechArticle' ||
                  lesson.screen === 'TongueTwister' ||
                  lesson.screen === 'CorporateCoach'
                ) {
                  nav.navigate(lesson.screen);
                } else {
                  nav.navigate(
                    `${
                      lesson.screen === 'Vocab'
                        ? 'VocabStack'
                        : lesson.screen === 'Grammar'
                        ? 'GrammarStack'
                        : lesson.screen === 'Tutor'
                        ? 'TutorStack'
                        : 'TeleprompterStack'
                    }`,
                    { screen: lesson.screen }
                  );
                }
              }}
              style={[styles.lessonCard, shadow.card]}
            >
              <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonSub}>{lesson.sub}</Text>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[palette.accent2, palette.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${lesson.pct * 100}%` as any }]}
                />
              </View>
            </PressableScale>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  content: {
    paddingHorizontal: space.xl,
    gap: space.lg,
  },

  /* header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: space.md,
  },
  headerText: { flex: 1, marginRight: space.lg },
  kicker: {
    fontFamily: font.sansSemi,
    fontSize: 11.5,
    color: palette.ink3,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  greeting: {
    fontFamily: font.serifReg,
    fontSize: 28,
    lineHeight: 36,
    color: palette.ink,
  },
  greetingAccent: {
    fontStyle: 'italic',
    color: palette.accent,
  },

  /* avatar */
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: font.sansBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.paper,
  },
  levelText: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: '#FFFFFF',
  },

  /* streak and XP row */
  streakXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginTop: -4,
  },
  levelInfo: {
    flex: 1,
    gap: 4,
  },
  xpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLevelLabel: {
    fontFamily: font.sansSemi,
    fontSize: 12,
    color: palette.ink,
  },
  xpValueText: {
    fontFamily: font.sansBold,
    fontSize: 12,
    color: palette.accent,
  },
  xpBarBackground: {
    height: 6,
    backgroundColor: palette.line2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 6,
    borderRadius: 3,
  },

  /* srs alert card */
  srsAlertCard: {
    backgroundColor: palette.accent,
    borderRadius: radius.lg,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  srsAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flex: 1,
  },
  srsBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  srsAlertTextCol: {
    flex: 1,
  },
  srsAlertTitle: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  srsAlertSub: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1.5,
  },
  srsGoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* hero */
  heroCard: {
    overflow: 'hidden',
  },
  sheenOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: palette.accent,
    opacity: 0.06,
    borderRadius: radius.xl,
  },
  heroKicker: {
    fontFamily: font.sansBold,
    fontSize: 9,
    color: palette.accent2,
    letterSpacing: 1.5,
    marginBottom: space.xs,
  },
  heroTitle: {
    fontFamily: font.serifMed,
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: space.sm,
  },
  heroSub: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },

  /* stats */
  statRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  statLabel: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink3,
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontFamily: font.serifBold,
    fontSize: 34,
    color: palette.ink,
  },
  statUnit: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    marginTop: 2,
  },
  trendBadge: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  trendText: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.accent,
  },

  /* goal */
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
  },
  goalPct: {
    fontFamily: font.sansBold,
    fontSize: 16,
    color: palette.accent,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
    marginBottom: 4,
  },
  goalSub: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 19,
  },
  goalDivider: {
    height: 1,
    backgroundColor: palette.line2,
    marginVertical: space.md,
  },
  practiceGoalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  practiceTextContainer: {
    flex: 1,
  },
  practiceTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.xs,
  },
  practiceGoalTitle: {
    fontFamily: font.serifMed,
    fontSize: 16,
    color: palette.ink,
  },
  practiceGoalValue: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.accent,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: palette.line2,
    overflow: 'hidden',
    marginBottom: space.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.sm,
    backgroundColor: palette.accent,
  },
  practiceGoalSub: {
    fontFamily: font.sansReg,
    fontSize: 12.5,
    color: palette.ink3,
    marginTop: 2,
  },

  /* section */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  seeAllText: {
    fontFamily: font.sansSemi,
    fontSize: 13,
    color: palette.accent,
  },
  sectionTitle: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
  },
  sectionTitleLarge: {
    fontFamily: font.serifMed,
    fontSize: 20,
    color: palette.ink,
    marginBottom: space.sm,
  },

  /* tasks */
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    gap: space.md,
  },
  taskBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.line2,
  },
  taskCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckDone: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  checkMark: {
    fontFamily: font.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  taskTextCol: { flex: 1 },
  taskTitle: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: palette.ink3,
  },
  taskSub: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    marginTop: 2,
  },
  chevron: {
    fontFamily: font.sansMed,
    fontSize: 22,
    color: palette.ink3,
  },

  /* lessons */
  lessonsScroll: {
    paddingRight: space.xl,
    gap: space.md,
  },
  lessonCard: {
    width: SCREEN_W * 0.42,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  lessonEmoji: {
    fontSize: 28,
    marginBottom: space.sm,
  },
  lessonTitle: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.ink,
    marginBottom: 3,
  },
  lessonSub: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    marginBottom: space.md,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: palette.line2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },
  challengesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  challengesPill: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  challengesPillText: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.accent,
    letterSpacing: 1,
  },
  challengesList: {
    gap: space.md,
  },
  challengeItem: {
    paddingVertical: 4,
  },
  challengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  challengeEmojiBg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeEmoji: {
    fontSize: 22,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  challengeTitle: {
    fontFamily: font.sansBold,
    fontSize: 14.5,
    color: palette.ink,
  },
  challengeDesc: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    marginBottom: 6,
  },
  challengeProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  challengeProgressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.sm,
    backgroundColor: palette.line2,
    overflow: 'hidden',
  },
  challengeProgressBarFill: {
    height: '100%',
    borderRadius: radius.sm,
  },
  challengeProgressVal: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.ink2,
    width: 32,
    textAlign: 'right',
  },
  challengeStatus: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengePendingCircle: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpBadge: {
    backgroundColor: palette.line2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  xpBadgeText: {
    fontFamily: font.sansBold,
    fontSize: 9,
    color: palette.ink2,
  },
  xpBadgeDone: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  xpBadgeTextDone: {
    fontFamily: font.sansBold,
    fontSize: 9,
    color: palette.accent,
  },
});

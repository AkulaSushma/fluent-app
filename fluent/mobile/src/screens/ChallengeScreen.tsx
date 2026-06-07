import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import PressableScale from '../components/PressableScale';
import Header from '../components/Header';
import Button from '../components/Button';
import ProgressRing from '../components/ProgressRing';

// Local dictionary of seeded roots for instant offline-friendly definitions
const ROOT_DICT: Record<string, { meaning: string; example: string }> = {
  bene: { meaning: 'good / well', example: 'benevolent, benefit' },
  mal: { meaning: 'bad / ill', example: 'malnutrition, malicious' },
  dict: { meaning: 'say / speak', example: 'dictate, contradict' },
  aud: { meaning: 'hear', example: 'audible, auditorium' },
  vis: { meaning: 'see', example: 'vision, visual' },
  scrib: { meaning: 'write', example: 'scribe, scribble' },
  port: { meaning: 'carry', example: 'transport, export' },
  ject: { meaning: 'throw', example: 'reject, project' },
  rupt: { meaning: 'break', example: 'rupture, disrupt' },
  struct: { meaning: 'build', example: 'structure, restructure' },
  tract: { meaning: 'pull / draw', example: 'traction, contract' },
  cred: { meaning: 'believe', example: 'credible, incredible' },
  path: { meaning: 'feeling / suffering', example: 'empathy, pathology' },
  morph: { meaning: 'form / shape', example: 'metamorphosis' },
  chron: { meaning: 'time', example: 'chronological, chronic' },
  graph: { meaning: 'write / draw', example: 'graphic, biography' },
  phon: { meaning: 'sound', example: 'phonics, telephone' },
  luc: { meaning: 'light', example: 'lucid, elucidate' },
  lum: { meaning: 'light', example: 'luminous, illuminate' },
  voc: { meaning: 'call / voice', example: 'vocal, advocate' },
  vok: { meaning: 'call / voice', example: 'provoke, evoke' },
  cogn: { meaning: 'know', example: 'cognitive, recognize' },
  vol: { meaning: 'wish / will', example: 'benevolent, volunteer' },
  gyn: { meaning: 'woman / lady', example: 'gynecologist, misogynist' },
  derm: { meaning: 'skin', example: 'dermatologist, dermatitis' },
  neuro: { meaning: 'nerve', example: 'neurology, neuropathy' },
  cardio: { meaning: 'heart', example: 'cardiology, cardiovascular' },
  pathy: { meaning: 'pain / disease', example: 'neuropathy, antipathy' },
  amor: { meaning: 'love / affection', example: 'amorous, amateur' },
  phil: { meaning: 'love / affection', example: 'philosophy, philanthropist' },
  grat: { meaning: 'pleasure / thankfulness', example: 'gratitude, gratify' },
  ben: { meaning: 'good / kind', example: 'benign, benefit' },
  soph: { meaning: 'wisdom', example: 'philosophy, sophisticated' },
  anthrop: { meaning: 'humanity', example: 'philanthropist' },
  arthr: { meaning: 'joint / bone', example: 'arthritis' },
};

export default function ChallengeScreen() {
  const insets = useSafeAreaInsets();
  
  const cognitiveChallenges = useStore((s) => s.cognitiveChallenges);
  const challengeProgress = useStore((s) => s.challengeProgress);
  const fetchCognitiveChallenges = useStore((s) => s.fetchCognitiveChallenges);
  const startChallenge = useStore((s) => s.startChallenge);
  const completeChallengeDay = useStore((s) => s.completeChallengeDay);
  const fireConfetti = useStore((s) => s.fireConfetti);

  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchCognitiveChallenges();
  }, [fetchCognitiveChallenges]);

  const challenge = cognitiveChallenges[activeTab];

  useEffect(() => {
    if (challenge) {
      startChallenge(challenge.id);
    }
  }, [challenge, startChallenge]);

  if (!challenge) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header title="30-Day Challenge" showBack={true} />
        <View style={styles.centered}>
          <ActivityIndicator color={palette.accent} size="large" />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      </View>
    );
  }

  const progress = challengeProgress[challenge.id] || {
    current_day: 1,
    completed_days: [],
  };

  const completedCount = progress.completed_days.length;
  const pct = challenge.total_days > 0 ? completedCount / challenge.total_days : 0;

  // Active day study data
  const currentStudyDay = selectedDay || Math.min(progress.current_day, challenge.total_days);
  const dayData = challenge.days.find((d) => d.day_number === currentStudyDay);
  const isCompleted = progress.completed_days.includes(currentStudyDay);
  const isLocked = currentStudyDay > progress.current_day;

  const handleComplete = async () => {
    await completeChallengeDay(challenge.id, currentStudyDay);
    fireConfetti();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="30-Day Challenges" showBack={true} />

      {/* Tabs */}
      {cognitiveChallenges.length > 1 && (
        <View style={styles.tabBar}>
          {cognitiveChallenges.map((c, idx) => (
            <PressableScale
              key={c.id}
              onPress={() => {
                setActiveTab(idx);
                setSelectedDay(null);
              }}
              style={[
                styles.tab,
                activeTab === idx && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === idx && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                {c.title.replace(' Challenge', '')}
              </Text>
            </PressableScale>
          ))}
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Ring Card */}
        <Animated.View
          entering={FadeInDown.springify().damping(18)}
          style={[styles.progressCard, shadow.card]}
        >
          <View style={styles.progressInfo}>
            <Text style={styles.cardKicker}>PROGRAM PROGRESS</Text>
            <Text style={styles.cardTitle}>{challenge.title}</Text>
            <Text style={styles.cardSub}>{challenge.subtitle}</Text>
            <Text style={styles.progressCounter}>
              {completedCount} of {challenge.total_days} days completed
            </Text>
          </View>
          <ProgressRing progress={pct} size={84} strokeWidth={8}>
            <Text style={styles.pctText}>{Math.round(pct * 100)}%</Text>
          </ProgressRing>
        </Animated.View>

        {/* 30-Day Grid */}
        <View style={styles.gridSection}>
          <Text style={styles.sectionTitle}>CHALLENGE GRID</Text>
          <View style={styles.grid}>
            {Array.from({ length: challenge.total_days }).map((_, idx) => {
              const dayNum = idx + 1;
              const isDone = progress.completed_days.includes(dayNum);
              const isActive = dayNum === progress.current_day;
              const isSelected = dayNum === currentStudyDay;

              return (
                <PressableScale
                  key={dayNum}
                  onPress={() => setSelectedDay(dayNum)}
                  style={[
                    styles.gridCell,
                    isDone && styles.gridCellDone,
                    isActive && styles.gridCellActive,
                    isSelected && styles.gridCellSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      isDone && styles.cellTextDone,
                      isActive && styles.cellTextActive,
                    ]}
                  >
                    {dayNum}
                  </Text>
                  {isDone && <Text style={styles.checkIcon}>✓</Text>}
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* Selected Day Study Area */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.studyCard, shadow.card]}
        >
          <View style={styles.studyHeader}>
            <Text style={styles.studyTitle}>Day {currentStudyDay} Study</Text>
            <View
              style={[
                styles.statusBadge,
                isCompleted && styles.statusBadgeCompleted,
                isLocked && styles.statusBadgeLocked,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isCompleted && styles.statusBadgeTextCompleted,
                ]}
              >
                {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Active'}
              </Text>
            </View>
          </View>

          {isLocked ? (
            <View style={styles.lockedContainer}>
              <Text style={styles.lockedEmoji}>🔒</Text>
              <Text style={styles.lockedText}>
                Complete previous days to unlock Day {currentStudyDay}.
              </Text>
            </View>
          ) : dayData && dayData.root_part_ids.length > 0 ? (
            <View style={styles.studyContent}>
              <Text style={styles.studyKicker}>ROOTS TO MASTER TODAY:</Text>
              <View style={styles.rootsContainer}>
                {dayData.root_part_ids.map((root) => {
                  const info = ROOT_DICT[root.toLowerCase()] || {
                    meaning: 'morphemic root',
                    example: 'various derivatives',
                  };

                  return (
                    <View key={root} style={styles.rootRow}>
                      <View style={styles.rootBadge}>
                        <Text style={styles.rootText}>{root.toUpperCase()}</Text>
                      </View>
                      <View style={styles.rootInfo}>
                        <Text style={styles.rootMeaning}>means: "{info.meaning}"</Text>
                        <Text style={styles.rootExample}>examples: {info.example}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {!isCompleted && currentStudyDay === progress.current_day && (
                <Button
                  label={`Complete Day ${currentStudyDay}`}
                  variant="accent"
                  onPress={handleComplete}
                  style={styles.completeBtn}
                />
              )}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                Study list not populated for this day yet. Try day 1 or 2!
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  scrollContent: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl + 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  loadingText: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.ink2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.line2,
    marginHorizontal: space.xl,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: space.md,
    marginTop: space.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: palette.card,
    ...shadow.card,
  },
  tabLabel: {
    fontFamily: font.sansMed,
    fontSize: 12.5,
    color: palette.ink3,
  },
  tabLabelActive: {
    color: palette.accent,
    fontFamily: font.sansBold,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    marginBottom: space.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  progressInfo: {
    flex: 1,
    marginRight: space.md,
  },
  cardKicker: {
    fontFamily: font.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: palette.ink3,
    marginBottom: 2,
  },
  cardTitle: {
    fontFamily: font.serifBold,
    fontSize: 18,
    color: palette.ink,
  },
  cardSub: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink2,
    marginTop: 2,
    marginBottom: space.sm,
  },
  progressCounter: {
    fontFamily: font.sansSemi,
    fontSize: 12.5,
    color: palette.accent,
  },
  pctText: {
    fontFamily: font.sansBold,
    fontSize: 18,
    color: palette.accent,
  },
  gridSection: {
    marginBottom: space.lg,
  },
  sectionTitle: {
    fontFamily: font.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: palette.ink3,
    marginBottom: space.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  gridCell: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: palette.card,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: palette.line,
    position: 'relative',
  },
  gridCellDone: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent2 + '40',
  },
  gridCellActive: {
    borderColor: palette.accent,
    borderStyle: 'dashed',
  },
  gridCellSelected: {
    borderColor: palette.accent,
    borderWidth: 2.5,
  },
  cellText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.ink2,
  },
  cellTextDone: {
    color: palette.accent,
  },
  cellTextActive: {
    color: palette.accentInk,
  },
  checkIcon: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 9,
    color: palette.accent,
    fontWeight: 'bold',
  },
  studyCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  studyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingBottom: space.md,
    marginBottom: space.md,
  },
  studyTitle: {
    fontFamily: font.serifBold,
    fontSize: 20,
    color: palette.ink,
  },
  statusBadge: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusBadgeCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeLocked: {
    backgroundColor: palette.line2,
  },
  statusBadgeText: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: palette.accent,
  },
  statusBadgeTextCompleted: {
    color: '#2E7D32',
  },
  lockedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxl,
    gap: space.sm,
  },
  lockedEmoji: {
    fontSize: 28,
  },
  lockedText: {
    fontFamily: font.sansReg,
    fontSize: 13.5,
    color: palette.ink3,
    textAlign: 'center',
  },
  studyContent: {
    gap: space.md,
  },
  studyKicker: {
    fontFamily: font.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: palette.ink3,
  },
  rootsContainer: {
    gap: space.md,
  },
  rootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  rootBadge: {
    backgroundColor: palette.accentSoft,
    borderWidth: 1.5,
    borderColor: palette.accent + '30',
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  rootText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.accent,
  },
  rootInfo: {
    flex: 1,
  },
  rootMeaning: {
    fontFamily: font.sansBold,
    fontSize: 13.5,
    color: palette.ink,
  },
  rootExample: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    marginTop: 2,
  },
  completeBtn: {
    marginTop: space.md,
  },
  noDataContainer: {
    paddingVertical: space.xl,
    alignItems: 'center',
  },
  noDataText: {
    fontFamily: font.sansReg,
    fontSize: 13.5,
    color: palette.ink3,
  },
});

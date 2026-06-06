import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import Header from '@/components/Header';
import Card from '@/components/Card';
import PressableScale from '@/components/PressableScale';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';
import { api } from '@/api/client';
import type { CurriculumProgressResponse } from '@/api/client';

let cachedProgress: CurriculumProgressResponse | null = null;

export default function LearningPathScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { showToast, setCurrentDay, fireConfetti } = useStore();

  const [progress, setProgress] = useState<CurriculumProgressResponse | null>(cachedProgress);
  const [loading, setLoading] = useState(!cachedProgress);

  // Load progress
  const loadProgress = async () => {
    if (!cachedProgress) {
      setLoading(true);
    }
    try {
      const res = await api.getCurriculumProgress();
      setProgress(res);
      cachedProgress = res;
    } catch (err) {
      console.error(err);
      showToast('❌', 'Failed to load syllabus path');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (loading && !progress) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={palette.accent} />
        <Text style={styles.loadingText}>Mapping your learning journey...</Text>
      </View>
    );
  }

  const currentDay = progress?.current_day ?? 24;

  // Let's generate a list of weeks / days
  // Mon-Sun pattern for 90 days (13 weeks total)
  const WEEKS = Array.from({ length: 13 }, (_, i) => i + 1);

  const getDayDetails = (dayNum: number) => {
    const weekday = (dayNum - 1) % 7;
    const weekDays = [
      { type: 'Vocab + Grammar', desc: 'Mon: Present Perfect & Core vocab', icon: 'book' },
      { type: 'Review & Reading', desc: 'Tue: Deep comprehension article', icon: 'reader' },
      { type: 'Vocab & Speech', desc: 'Wed: Pronunciation & Speech card', icon: 'mic' },
      { type: 'SRS & Deep Grammar', desc: 'Thu: Spaced repetition review', icon: 'repeat' },
      { type: 'Vocab & Weekly Quiz', desc: 'Fri: Assessment & speaking test', icon: 'checkmark-done-circle' },
      { type: 'Comprehensive Review', desc: 'Sat: Reinforcing weak patterns', icon: 'ribbon' },
      { type: 'Catch-up & Catch-up', desc: 'Sun: Light conversational review', icon: 'chatbubbles' },
    ];
    return weekDays[weekday];
  };

  const getPhaseName = (dayNum: number) => {
    if (dayNum <= 30) return { name: 'Foundation Phase', colors: [palette.accentSoft, 'rgba(99, 102, 241, 0.05)'], textColor: palette.accent };
    if (dayNum <= 60) return { name: 'Building Phase', colors: [palette.amberSoft, 'rgba(245, 158, 11, 0.03)'], textColor: palette.amber };
    return { name: 'Mastery Phase', colors: ['rgba(236, 72, 153, 0.1)', 'rgba(236, 72, 153, 0.03)'], textColor: '#EC4899' };
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Syllabus Journey" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase Header */}
        <Animated.View
          entering={FadeInDown.delay(50).springify().damping(18)}
          style={styles.summaryCard}
        >
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>90-Day Fluency Path</Text>
              <Text style={styles.summarySub}>
                Currently on Day {currentDay} of 90
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>
                {Math.round((progress?.overall_progress ?? 0.24) * 100)}%
              </Text>
            </View>
          </View>

          <View style={styles.track}>
            <LinearGradient
              colors={[palette.accent2, palette.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.fill,
                { width: `${(progress?.overall_progress ?? 0.24) * 100}%` as any },
              ]}
            />
          </View>
        </Animated.View>

        {/* Journey Map Timeline */}
        {WEEKS.map((weekNum, wIdx) => {
          const startDay = (weekNum - 1) * 7 + 1;
          const endDay = Math.min(weekNum * 7, 90);
          const phase = getPhaseName(startDay);

          // Skip rendering if week is completely in the future beyond what is necessary to show (let's show up to current week + 2 weeks)
          const currentWeek = Math.ceil(currentDay / 7);
          if (weekNum > currentWeek + 2) return null;

          return (
            <View key={weekNum} style={styles.weekContainer}>
              {/* Phase Banner at transition */}
              {(weekNum === 1 || weekNum === 5 || weekNum === 9) && (
                <View style={styles.phaseHeader}>
                  <Text style={[styles.phaseTitle, { color: phase.textColor }]}>
                    {phase.name.toUpperCase()}
                  </Text>
                </View>
              )}

              <Text style={styles.weekTitle}>Week {weekNum}</Text>

              <Card index={wIdx}>
                {Array.from({ length: endDay - startDay + 1 }, (_, dIdx) => {
                  const dayNum = startDay + dIdx;
                  const isCompleted = dayNum < currentDay;
                  const isActive = dayNum === currentDay;
                  const isLocked = dayNum > currentDay;
                  const details = getDayDetails(dayNum);

                  return (
                    <PressableScale
                      key={dayNum}
                      onPress={() => {
                        if (isActive) {
                          nav.navigate('Plan' as never);
                          return;
                        }

                        Alert.alert(
                          'Switch Active Day?',
                          `Would you like to set Day ${dayNum} as your active learning day? This will update your curriculum progress and daily missions.`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Switch',
                              onPress: async () => {
                                try {
                                  await setCurrentDay(dayNum);
                                  fireConfetti();
                                  showToast('🚀', `Active day switched to Day ${dayNum}!`);
                                  await loadProgress();
                                } catch (err) {
                                  showToast('❌', 'Failed to switch day');
                                }
                              },
                            },
                          ]
                        );
                      }}
                      style={[
                        styles.dayRow,
                        dIdx < 6 ? styles.dayBorder : undefined,
                        isActive ? styles.activeRow : undefined,
                      ] as any}
                    >
                      {/* Status Icon Indicator */}
                      <View
                        style={[
                          styles.statusCircle,
                          isCompleted && styles.statusCircleCompleted,
                          isActive && styles.statusCircleActive,
                          isLocked && styles.statusCircleLocked,
                        ]}
                      >
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        ) : isActive ? (
                          <Ionicons name="play" size={16} color="#FFFFFF" />
                        ) : (
                          <Ionicons name="lock-closed" size={14} color={palette.ink3} />
                        )}
                      </View>

                      {/* Details Info */}
                      <View style={styles.dayDetails}>
                        <View style={styles.dayHeaderRow}>
                          <Text
                            style={[
                              styles.dayNumberText,
                              isLocked && styles.lockedText,
                              isActive && styles.activeText,
                            ]}
                          >
                            Day {dayNum}
                          </Text>
                          <Text style={[styles.dayTypeTag, { color: phase.textColor }]}>
                            {details.type}
                          </Text>
                        </View>
                        <Text style={[styles.dayDescText, isLocked && styles.lockedText]}>
                          {details.desc}
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={isActive ? palette.accent : palette.ink3}
                      />
                    </PressableScale>
                  );
                })}
              </Card>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
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
    paddingBottom: 40,
    gap: space.xl,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink3,
    marginTop: space.md,
  },
  summaryCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    ...shadow.card,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  summaryTitle: {
    fontFamily: font.serifBold,
    fontSize: 22,
    color: palette.ink,
  },
  summarySub: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink2,
    marginTop: 2,
  },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.accent,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.line2,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
  weekContainer: {
    gap: space.md,
  },
  phaseHeader: {
    paddingVertical: space.xs,
    borderBottomWidth: 1.5,
    borderBottomColor: palette.line2,
    marginBottom: space.sm,
  },
  phaseTitle: {
    fontFamily: font.sansBold,
    fontSize: 12,
    letterSpacing: 2,
  },
  weekTitle: {
    fontFamily: font.serifBold,
    fontSize: 18,
    color: palette.ink,
    marginLeft: space.xs,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    gap: space.md,
  },
  dayBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.line2,
  },
  activeRow: {
    backgroundColor: palette.accentSoft,
    borderRadius: radius.md,
  },
  statusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCircleCompleted: {
    backgroundColor: palette.accent,
  },
  statusCircleActive: {
    backgroundColor: palette.accent,
  },
  statusCircleLocked: {
    backgroundColor: palette.line2,
    borderWidth: 1,
    borderColor: palette.line,
  },
  dayDetails: {
    flex: 1,
    gap: 4,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  dayNumberText: {
    fontFamily: font.sansBold,
    fontSize: 15,
    color: palette.ink,
  },
  dayTypeTag: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  dayDescText: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
  },
  lockedText: {
    color: palette.ink3,
  },
  activeText: {
    color: palette.accent,
  },
});

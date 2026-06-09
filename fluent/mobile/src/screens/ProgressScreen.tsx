import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_W } = Dimensions.get('window');

import Card from '@/components/Card';
import BarChart from '@/components/BarChart';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';
import { api } from '@/api/client';
import type { HeatmapDay, SeriousnessResponse } from '@/api/client';

/* ------------------------------------------------------------------ */
/*  Animated Streak Number Sub-component                              */
/* ------------------------------------------------------------------ */

function AnimatedStreakNumber({ value, isFocused }: { value: number; isFocused: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isFocused || value === 0) {
      setDisplayValue(0);
      setIsAnimating(false);
      return;
    }

    const start = 0;
    const targetMax = value + 10;
    const end = value;

    const durationUp = 800; // 0.8 seconds to count up to max
    const durationDown = 600; // 0.6 seconds to count back down to value
    const totalDuration = durationUp + durationDown;
    const startTime = Date.now();
    setIsAnimating(true);

    let animationFrameId: number;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < durationUp) {
        // Phase 1: Count Up to targetMax
        const progress = elapsed / durationUp;
        const easedProgress = progress * (2 - progress); // Ease out quad
        const current = start + easedProgress * (targetMax - start);
        setDisplayValue(current);
        animationFrameId = requestAnimationFrame(animate);
      } else if (elapsed < totalDuration) {
        // Phase 2: Count Down to end (value)
        const progress = (elapsed - durationUp) / durationDown;
        const easedProgress = progress * (2 - progress); // Ease out quad
        const current = targetMax - easedProgress * (targetMax - end);
        setDisplayValue(current);
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Finished
        setDisplayValue(end);
        setIsAnimating(false);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, isFocused]);

  const displayText = isAnimating 
    ? displayValue.toFixed(1) 
    : Math.round(displayValue).toString();

  return <Text style={styles.bigStreak}>{displayText}</Text>;
}


/* ------------------------------------------------------------------ */
/*  Main Progress Screen Component                                    */
/* ------------------------------------------------------------------ */

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  
  const {
    streak,
    fluency,
    words,
    dailyMinutes,
    initials,
    achievements,
    fetchProgress,
    fetchAchievements,
  } = useStore();

  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [seriousness, setSeriousness] = useState<SeriousnessResponse | null>(null);
  const [loadingExtra, setLoadingExtra] = useState(true);

  const streakScale = useSharedValue(1);

  useEffect(() => {
    if (isFocused) {
      streakScale.value = withSequence(
        withTiming(1.3, { duration: 500, easing: Easing.out(Easing.back(1.5)) }),
        withTiming(1.0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      );
    } else {
      streakScale.value = 1;
    }
  }, [isFocused]);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  const loadProgressDetails = async () => {
    // Stale-While-Revalidate: Show loading only on first load
    if (heatmap.length === 0 || !seriousness) {
      setLoadingExtra(true);
    }
    try {
      // Execute all details queries in parallel
      const [_, __, heatmapRes, seriousRes] = await Promise.all([
        fetchProgress(),
        fetchAchievements(),
        api.getActivityHeatmap(90),
        api.getSeriousnessScore()
      ]);
      setHeatmap(heatmapRes);
      setSeriousness(seriousRes);
    } catch (err) {
      console.error('Error loading progress stats:', err);
    } finally {
      setLoadingExtra(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadProgressDetails();
    }
  }, [isFocused]);

  // Heatmap intensity mapping
  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 1: return 'rgba(99, 102, 241, 0.25)'; // Light
      case 2: return 'rgba(99, 102, 241, 0.5)';  // Medium
      case 3: return 'rgba(99, 102, 241, 0.75)'; // Strong
      case 4: return palette.accent;              // Absolute Obsessed
      default: return palette.line2;              // Empty
    }
  };

  return (
    <ScrollView
      style={[styles.scroll, { paddingTop: insets.top + 8 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header area */}
      <Animated.View
        entering={FadeInDown.delay(0).springify().damping(18)}
        style={styles.headerRow}
      >
        <View>
          <Text style={styles.kicker}>YOUR JOURNEY</Text>
          <Text style={styles.title}>Progress</Text>
        </View>
        <LinearGradient
          colors={[palette.accent2, palette.accent]}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Big streak card */}
      <Animated.View 
        entering={FadeInDown.delay(80).springify().damping(18)}
        style={animatedScaleStyle}
      >
        <Card index={1} dark style={styles.streakCard}>
          <View style={styles.glowCircle} />
          <AnimatedStreakNumber value={streak} isFocused={isFocused} />
          <Text style={styles.streakLabel}>🔥 day streak · personal best</Text>
        </Card>
      </Animated.View>

      {/* Stat row */}
      <Animated.View
        entering={FadeInDown.delay(160).springify().damping(18)}
        style={styles.statRow}
      >
        <View style={[styles.statCard, shadow.card]}>
          <Text style={styles.statLabel}>Fluency</Text>
          <View style={styles.statValueRow}>
            <Text style={styles.statValue}>{fluency}</Text>
            <View style={styles.trendBadge}>
              <Text style={styles.trendText}>↑ 12%</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statCard, shadow.card]}>
          <Text style={styles.statLabel}>Words</Text>
          <Text style={styles.statValue}>{words.toLocaleString()}</Text>
          <Text style={styles.statUnit}>words mastered</Text>
        </View>
      </Animated.View>

      {/* Adaptive Engagement / Seriousness Score */}
      {seriousness && (
        <Animated.View entering={FadeInDown.delay(240).springify().damping(18)}>
          <Card index={3}>
            <Text style={styles.sectionTitle}>Engagement Rating</Text>
            <View style={styles.seriousHeader}>
              <View>
                <Text style={styles.seriousScoreText}>{seriousness.score}/100</Text>
                <Text style={styles.seriousLabelText}>Seriousness: {seriousness.label}</Text>
              </View>
              <View style={styles.labelBadgeOuter}>
                <Text style={styles.labelText}>{seriousness.label}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Breakdowns */}
            <View style={styles.breakdownGrid}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownVal}>{Math.round(seriousness.login_consistency * 100)}%</Text>
                <Text style={styles.breakdownLbl}>Active Days</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownVal}>{Math.round(seriousness.completion_rate * 100)}%</Text>
                <Text style={styles.breakdownLbl}>Task Rate</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownVal}>{Math.round(seriousness.session_depth * 100)}%</Text>
                <Text style={styles.breakdownLbl}>Focus Depth</Text>
              </View>
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Spoken Heatmap */}
      {heatmap.length > 0 && (
        <Animated.View entering={FadeInDown.delay(320).springify().damping(18)}>
          <Card index={4}>
            <Text style={styles.sectionTitle}>Activity Heatmap (90 Days)</Text>
            <View style={styles.heatmapGrid}>
              {heatmap.map((day, idx) => (
                <View
                  key={day.date}
                  style={[
                    styles.heatmapCell,
                    { backgroundColor: getIntensityColor(day.intensity) }
                  ]}
                />
              ))}
            </View>
            <View style={styles.legendRow}>
              <Text style={styles.legendText}>Less</Text>
              <View style={[styles.legendCell, { backgroundColor: palette.line2 }]} />
              <View style={[styles.legendCell, { backgroundColor: 'rgba(99, 102, 241, 0.25)' }]} />
              <View style={[styles.legendCell, { backgroundColor: 'rgba(99, 102, 241, 0.5)' }]} />
              <View style={[styles.legendCell, { backgroundColor: 'rgba(99, 102, 241, 0.75)' }]} />
              <View style={[styles.legendCell, { backgroundColor: palette.accent }]} />
              <Text style={styles.legendText}>More</Text>
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Weekly minutes */}
      <Animated.View entering={FadeInDown.delay(400).springify().damping(18)}>
        <Card index={5}>
          <Text style={styles.sectionTitle}>Weekly minutes</Text>
          <BarChart data={dailyMinutes} />
        </Card>
      </Animated.View>

      {/* Achievements */}
      <Animated.View
        entering={FadeInDown.delay(480).springify().damping(18)}
      >
        <Text style={styles.sectionTitleOuter}>Unlocked Achievements</Text>
      </Animated.View>

      {loadingExtra ? (
        <ActivityIndicator size="small" color={palette.accent} />
      ) : (
        <Animated.View entering={FadeInDown.delay(560).springify().damping(18)}>
          <View style={styles.badgesGrid}>
            {achievements.map((badge, i) => (
              <View
                key={badge.code}
                style={[
                  styles.badgeCard,
                  shadow.card,
                  !badge.unlocked && styles.badgeLocked,
                ]}
              >
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                <Text style={styles.badgeName}>{badge.title}</Text>
                <Text style={styles.badgeSub}>{badge.description}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

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
  kicker: {
    fontFamily: font.sansSemi,
    fontSize: 11.5,
    color: palette.ink3,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontFamily: font.serifBold,
    fontSize: 30,
    color: palette.ink,
  },
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

  /* streak */
  streakCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxl + 16,
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: palette.gold,
    opacity: 0.12,
  },
  flameEmoji: {
    fontSize: 52,
    marginBottom: space.sm,
  },
  bigStreak: {
    fontFamily: font.serifBold,
    fontSize: 68,
    color: palette.gold,
    textShadowColor: 'rgba(217,164,65,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  streakLabel: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: space.sm,
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

  /* seriousness card */
  seriousHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: space.sm,
  },
  seriousScoreText: {
    fontFamily: font.serifBold,
    fontSize: 28,
    color: palette.accent,
  },
  seriousLabelText: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink3,
    marginTop: 2,
  },
  labelBadgeOuter: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.accentSoft,
  },
  labelText: {
    fontFamily: font.sansBold,
    fontSize: 11.5,
    color: palette.accent,
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: space.sm,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownVal: {
    fontFamily: font.sansBold,
    fontSize: 17,
    color: palette.ink,
  },
  breakdownLbl: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: palette.line2,
    marginVertical: space.md,
  },

  /* heatmap */
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4.8,
    justifyContent: 'center',
    marginVertical: space.sm,
  },
  heatmapCell: {
    width: (SCREEN_W - 120) / 13,
    height: (SCREEN_W - 120) / 13,
    borderRadius: 3.5,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: space.sm,
  },
  legendText: {
    fontFamily: font.sansReg,
    fontSize: 10,
    color: palette.ink3,
    marginHorizontal: 2,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },

  /* sections */
  sectionTitle: {
    fontFamily: font.serifMed,
    fontSize: 17,
    color: palette.ink,
    marginBottom: space.sm,
  },
  sectionTitleOuter: {
    fontFamily: font.serifMed,
    fontSize: 20,
    color: palette.ink,
    marginBottom: space.sm,
  },

  /* badges */
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
  },
  badgeCard: {
    width: '47.5%',
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: space.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  badgeLocked: {
    opacity: 0.38,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: space.sm,
  },
  badgeName: {
    fontFamily: font.sansBold,
    fontSize: 13,
    color: palette.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeSub: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
    textAlign: 'center',
    lineHeight: 15,
  },
});

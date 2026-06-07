import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';

import Header from '@/components/Header';
import ProgressRing from '@/components/ProgressRing';
import PressableScale from '@/components/PressableScale';
import Button from '@/components/Button';
import { palette, radius, space, shadow, spring as springCfg } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';

const { width: SCREEN_W } = Dimensions.get('window');
const TOPIC_CARD_W = 160;

/* ─── level → colour mapping ──────────────────────────────── */

const LEVEL_STYLES: Record<
  string,
  { bg: string; text: string; border?: string }
> = {
  Foundation: { bg: palette.accentSoft, text: palette.accent },
  Intermediate: { bg: palette.amberSoft, text: palette.amber },
  Advanced: { bg: '#FDF3E0', text: palette.gold },
  Pro: { bg: palette.dark1, text: '#FFFFFF' },
};

const getLevelStyle = (label: string) =>
  LEVEL_STYLES[label] ?? LEVEL_STYLES.Foundation;

/* ═════════════════════════════════════════════════════════════
   GrammarHubScreen
   ═════════════════════════════════════════════════════════════ */

export default function GrammarHubScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { grammarTopics, fetchGrammarTopics, showToast } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ── data fetching ──────────────────────────────────────── */
  useEffect(() => {
    if (!grammarTopics) {
      setIsLoading(true);
      fetchGrammarTopics().finally(() => setIsLoading(false));
    }
  }, [grammarTopics, fetchGrammarTopics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGrammarTopics();
    setRefreshing(false);
  }, [fetchGrammarTopics]);

  /* ── navigation helpers ─────────────────────────────────── */
  const handleTopicPress = useCallback(
    (topic: { id: string; title: string; levelLabel: string; locked: boolean }) => {
      if (topic.locked) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast('🔒', 'Complete previous lessons first');
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('GrammarLesson', {
        topicId: topic.id,
        topic: topic.title,
        level: topic.levelLabel,
      });
    },
    [navigation, showToast],
  );

  const handleContinueLearning = useCallback(() => {
    if (!grammarTopics) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Find the first incomplete, unlocked topic
    for (const cat of grammarTopics.categories) {
      const next = cat.topics.find((t) => !t.completed && !t.locked);
      if (next) {
        navigation.navigate('GrammarLesson', {
          topicId: next.id,
          topic: next.title,
          level: next.levelLabel,
        });
        return;
      }
    }
    showToast('🎉', 'All topics mastered!');
  }, [grammarTopics, navigation, showToast]);

  /* ── derived stats ──────────────────────────────────────── */
  const overallPct = grammarTopics ? Math.round(grammarTopics.overallMastery * 100) : 0;
  const topicsCompleted = grammarTopics?.topicsCompleted ?? 0;
  const totalTopics = grammarTopics?.totalTopics ?? 0;

  /* ── loading state ──────────────────────────────────────── */
  if (isLoading && !grammarTopics) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header title="Grammar" showBack={true} />
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loaderText}>Loading grammar topics…</Text>
        </View>
      </View>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Grammar" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[palette.accent]}
            tintColor={palette.accent}
          />
        }
      >
        {/* ── Hero progress card ────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(0)
            .springify()
            .damping(springCfg.damping)
            .stiffness(springCfg.stiffness)
            .mass(springCfg.mass)}
        >
          <LinearGradient
            colors={[palette.dark1, palette.dark2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, shadow.raised]}
          >
            {/* decorative sheen */}
            <View style={styles.heroSheen} />

            <View style={styles.heroTop}>
              {/* left column */}
              <View style={styles.heroTextCol}>
                <Text style={styles.heroKicker}>YOUR GRAMMAR JOURNEY</Text>
                <Text style={styles.heroMastery}>{overallPct}%</Text>
                <Text style={styles.heroSub}>
                  {topicsCompleted} of {totalTopics} topics mastered
                </Text>
              </View>

              {/* right column — progress ring */}
              <ProgressRing progress={grammarTopics?.overallMastery ?? 0} size={64} strokeWidth={5}>
                <Ionicons name="school-outline" size={20} color="#FFFFFF" />
              </ProgressRing>
            </View>

            <Button
              label="Continue Learning"
              variant="light"
              icon="→"
              onPress={handleContinueLearning}
              style={{ marginTop: space.xl }}
            />
          </LinearGradient>
        </Animated.View>

        {/* ── Category Sections ─────────────────────────── */}
        {grammarTopics?.categories.map((category, catIdx) => (
          <Animated.View
            key={category.id}
            entering={FadeInDown.delay(80 + catIdx * 80)
              .springify()
              .damping(springCfg.damping)
              .stiffness(springCfg.stiffness)
              .mass(springCfg.mass)}
            style={styles.categorySection}
          >
            {/* section header */}
            <View style={styles.catHeaderRow}>
              <View style={styles.catTitleRow}>
                <Text style={styles.catEmoji}>{category.emoji}</Text>
                <Text style={styles.catLabel}>{category.label}</Text>
              </View>
              <View style={styles.catCountPill}>
                <Text style={styles.catCountText}>
                  {category.topics.length}
                </Text>
              </View>
            </View>

            {/* horizontal topic cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicScroll}
            >
              {category.topics.map((topic, topicIdx) => {
                const lvl = getLevelStyle(topic.levelLabel);
                const masteryPct = Math.round(topic.mastery * 100);

                return (
                  <Animated.View
                    key={topic.id}
                    entering={FadeInRight.delay(160 + catIdx * 80 + topicIdx * 60)
                      .springify()
                      .damping(springCfg.damping)
                      .stiffness(springCfg.stiffness)
                      .mass(springCfg.mass)}
                  >
                    <PressableScale
                      onPress={() => handleTopicPress(topic)}
                      style={[
                        styles.topicCard,
                        shadow.card,
                        topic.completed && styles.topicCardCompleted,
                        topic.locked && styles.topicCardLocked,
                      ]}
                    >
                      {/* completed green left accent */}
                      {topic.completed && <View style={styles.completedBorder} />}

                      {/* lock overlay */}
                      {topic.locked && (
                        <View style={styles.lockOverlay}>
                          <View style={styles.lockCircle}>
                            <Ionicons
                              name="lock-closed"
                              size={20}
                              color={palette.ink3}
                            />
                          </View>
                        </View>
                      )}

                      {/* level badge */}
                      <View
                        style={[
                          styles.levelBadge,
                          { backgroundColor: lvl.bg },
                        ]}
                      >
                        <Text style={[styles.levelBadgeText, { color: lvl.text }]}>
                          {topic.levelLabel}
                        </Text>
                      </View>

                      {/* title */}
                      <Text
                        style={styles.topicTitle}
                        numberOfLines={2}
                      >
                        {topic.title}
                      </Text>

                      {/* spacer pushes ring to bottom */}
                      <View style={styles.topicSpacer} />

                      {/* mini progress ring + percentage */}
                      <View style={styles.topicFooter}>
                        <ProgressRing
                          progress={topic.mastery}
                          size={32}
                          strokeWidth={3}
                        >
                          <Text style={styles.topicPct}>{masteryPct}</Text>
                        </ProgressRing>
                        {topic.bestScore > 0 && (
                          <Text style={styles.bestScoreLabel}>
                            Best {Math.round(topic.bestScore)}%
                          </Text>
                        )}
                      </View>
                    </PressableScale>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </Animated.View>
        ))}

        {/* bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ═════════════════════════════════════════════════════════════
   STYLES
   ═════════════════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  /* ── screen scaffold ────────────────────────────────────── */
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  scrollContent: {
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    gap: space.xl,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.lg,
  },
  loaderText: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink3,
  },

  /* ── hero card ──────────────────────────────────────────── */
  heroCard: {
    borderRadius: radius.xl,
    padding: space.xl,
    overflow: 'hidden',
  },
  heroSheen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: palette.accent,
    opacity: 0.06,
    borderRadius: radius.xl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextCol: {
    flex: 1,
    marginRight: space.lg,
  },
  heroKicker: {
    fontFamily: font.sansBold,
    fontSize: 9,
    color: palette.accent2,
    letterSpacing: 1.5,
    marginBottom: space.xs,
  },
  heroMastery: {
    fontFamily: font.serifBold,
    fontSize: 34,
    color: '#FFFFFF',
    lineHeight: 40,
  },
  heroSub: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  /* ── category section ───────────────────────────────────── */
  categorySection: {
    gap: space.md,
  },
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  catEmoji: {
    fontSize: 20,
  },
  catLabel: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
  },
  catCountPill: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    minWidth: 28,
    alignItems: 'center',
  },
  catCountText: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: palette.accent,
  },

  /* ── horizontal scroll ──────────────────────────────────── */
  topicScroll: {
    paddingRight: space.xl,
    gap: space.md,
  },

  /* ── topic card ─────────────────────────────────────────── */
  topicCard: {
    width: TOPIC_CARD_W,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    borderColor: palette.line2,
    overflow: 'hidden',
    minHeight: 170,
  },
  topicCardCompleted: {
    borderColor: palette.line2,
  },
  topicCardLocked: {
    opacity: 0.45,
  },

  /* green left accent for completed cards */
  completedBorder: {
    position: 'absolute',
    left: 0,
    top: space.lg,
    bottom: space.lg,
    width: 3,
    backgroundColor: palette.accent,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },

  /* lock overlay */
  lockOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* level badge */
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginBottom: space.sm,
  },
  levelBadgeText: {
    fontFamily: font.sansBold,
    fontSize: 9,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  /* topic text */
  topicTitle: {
    fontFamily: font.serifMed,
    fontSize: 14,
    color: palette.ink,
    lineHeight: 19,
  },

  topicSpacer: {
    flex: 1,
    minHeight: space.md,
  },

  /* topic footer */
  topicFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  topicPct: {
    fontFamily: font.sansBold,
    fontSize: 8,
    color: palette.accent,
  },
  bestScoreLabel: {
    fontFamily: font.sansReg,
    fontSize: 10,
    color: palette.ink3,
  },
});

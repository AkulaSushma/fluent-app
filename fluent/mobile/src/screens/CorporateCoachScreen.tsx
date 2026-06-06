import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import Card from '@/components/Card';
import PressableScale from '@/components/PressableScale';
import { palette, radius, space, shadow, spring } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { api, CorporatePhrasesResponse, CorporatePhrase } from '@/api/client';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

type Category = 'all' | 'assertiveness' | 'clarity' | 'professionalism' | 'diplomacy';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: '🔥 All' },
  { key: 'assertiveness', label: '💪 Assertiveness' },
  { key: 'clarity', label: '🎯 Clarity' },
  { key: 'professionalism', label: '👔 Professionalism' },
  { key: 'diplomacy', label: '🤝 Diplomacy' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  assertiveness: '💪',
  clarity: '🎯',
  professionalism: '👔',
  diplomacy: '🤝',
};

/* ------------------------------------------------------------------ */
/*  Animated Progress Bar                                              */
/* ------------------------------------------------------------------ */

function ProgressBar({ reviewed, total }: { reviewed: number; total: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(total > 0 ? reviewed / total : 0, spring);
  }, [reviewed, total, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify().damping(18).stiffness(220).mass(0.9)}
      style={styles.progressContainer}
    >
      <Text style={styles.progressLabel}>
        {reviewed} of {total} phrases reviewed
      </Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFillWrap, fillStyle]}>
          <LinearGradient
            colors={[palette.accent2, palette.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressFill}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Category Filter Pills                                              */
/* ------------------------------------------------------------------ */

function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: Category;
  onSelect: (cat: Category) => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(170).springify().damping(18).stiffness(220).mass(0.9)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {CATEGORIES.map((cat) => {
          const active = selected === cat.key;
          return (
            <PressableScale
              key={cat.key}
              onPress={() => onSelect(cat.key)}
              style={[
                styles.filterPill,
                active ? styles.filterPillActive : styles.filterPillInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  active ? styles.filterTextActive : styles.filterTextInactive,
                ]}
              >
                {cat.label}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Phrase Card                                                        */
/* ------------------------------------------------------------------ */

function PhraseCard({
  phrase,
  isRevealed,
  onReveal,
}: {
  phrase: CorporatePhrase;
  isRevealed: boolean;
  onReveal: () => void;
}) {
  const revealOpacity = useSharedValue(0);
  const revealTranslateY = useSharedValue(12);

  useEffect(() => {
    if (isRevealed) {
      revealOpacity.value = withTiming(1, { duration: 400 });
      revealTranslateY.value = withSpring(0, spring);
    } else {
      revealOpacity.value = withTiming(0, { duration: 200 });
      revealTranslateY.value = withTiming(12, { duration: 200 });
    }
  }, [isRevealed, revealOpacity, revealTranslateY]);

  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
    transform: [{ translateY: revealTranslateY.value }],
  }));

  const categoryEmoji = CATEGORY_EMOJI[phrase.category] || '📌';

  return (
    <Animated.View
      entering={FadeInDown.delay(240).springify().damping(18).stiffness(220).mass(0.9)}
    >
      <View style={[styles.phraseCard, shadow.card]}>
        {/* Don't Say section */}
        <View style={styles.weakSection}>
          <View style={styles.badgeRow}>
            <View style={styles.badgeWeak}>
              <Text style={styles.badgeIcon}>❌</Text>
              <Text style={styles.badgeWeakText}>Don't Say</Text>
            </View>
          </View>
          <Text style={styles.weakPhrase}>"{phrase.weak}"</Text>
        </View>

        {/* Reveal button */}
        {!isRevealed && (
          <PressableScale onPress={onReveal} style={styles.revealBtn}>
            <LinearGradient
              colors={[palette.accent2, palette.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.revealBtnGradient}
            >
              <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
              <Text style={styles.revealBtnText}>Tap to reveal the better way</Text>
            </LinearGradient>
          </PressableScale>
        )}

        {/* Instead Say section (revealed) */}
        {isRevealed && (
          <Animated.View style={revealStyle}>
            <View style={styles.strongSection}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeStrong}>
                  <Text style={styles.badgeIcon}>✅</Text>
                  <Text style={styles.badgeStrongText}>Instead Say</Text>
                </View>
              </View>
              <Text style={styles.strongPhrase}>"{phrase.strong}"</Text>
            </View>

            {/* Context card */}
            <View style={styles.contextCard}>
              <Ionicons name="bulb-outline" size={16} color={palette.amber} />
              <Text style={styles.contextText}>{phrase.context}</Text>
            </View>
          </Animated.View>
        )}

        {/* Category badge */}
        <View style={styles.categoryBadgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {categoryEmoji} {phrase.category.charAt(0).toUpperCase() + phrase.category.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Scenario Card                                                      */
/* ------------------------------------------------------------------ */

function ScenarioCard({ scenario }: { scenario: string }) {
  return (
    <Card dark index={6}>
      <View style={styles.scenarioHeader}>
        <Text style={styles.scenarioEmoji}>🎭</Text>
        <Text style={styles.scenarioTitle}>Role-Play Practice</Text>
      </View>
      <Text style={styles.scenarioText}>{scenario}</Text>
      <Text style={styles.scenarioSub}>
        Practice responding using the professional phrases you just learned
      </Text>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */

let cachedCorporateData: CorporatePhrasesResponse | null = null;

export default function CorporateCoachScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  /* data */
  const [data, setData] = useState<CorporatePhrasesResponse | null>(cachedCorporateData);
  const [loading, setLoading] = useState(!cachedCorporateData);
  const [error, setError] = useState<string | null>(null);

  /* interaction state */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  /* fetch */
  const fetchData = useCallback(async () => {
    if (!cachedCorporateData) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await api.getCorporatePhrases();
      setData(res);
      cachedCorporateData = res;
      setCurrentIndex(0);
      setRevealed(new Set());
      setSelectedCategory('all');
    } catch (e: any) {
      if (!cachedCorporateData) {
        setError(e.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* filtered phrases */
  const filteredPhrases = useMemo(() => {
    if (!data) return [];
    if (selectedCategory === 'all') return data.phrases;
    return data.phrases.filter((p) => p.category === selectedCategory);
  }, [data, selectedCategory]);

  /* reset index when filter changes */
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  const totalFiltered = filteredPhrases.length;
  const currentPhrase = filteredPhrases[currentIndex] ?? null;

  /* how many of the filtered set are revealed */
  const revealedCountInFiltered = useMemo(() => {
    if (!data) return 0;
    let count = 0;
    filteredPhrases.forEach((_, i) => {
      // Map filtered index back to original index
      const originalIndex = data.phrases.indexOf(filteredPhrases[i]);
      if (revealed.has(originalIndex)) count++;
    });
    return count;
  }, [data, filteredPhrases, revealed]);

  const allFilteredReviewed = totalFiltered > 0 && revealedCountInFiltered === totalFiltered;

  /* helpers */
  const getOriginalIndex = useCallback(
    (filteredIdx: number) => {
      if (!data) return -1;
      return data.phrases.indexOf(filteredPhrases[filteredIdx]);
    },
    [data, filteredPhrases],
  );

  const handleReveal = useCallback(() => {
    const origIdx = getOriginalIndex(currentIndex);
    if (origIdx < 0) return;
    setRevealed((prev) => new Set(prev).add(origIdx));
  }, [currentIndex, getOriginalIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalFiltered - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, totalFiltered]);

  const handleCategorySelect = useCallback((cat: Category) => {
    setSelectedCategory(cat);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  /* Loading */
  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Loading coaching session…</Text>
        </View>
      </View>
    );
  }

  /* Error */
  if (error || !data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error || 'Failed to load data'}</Text>
          <PressableScale onPress={fetchData} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  const currentOrigIdx = getOriginalIndex(currentIndex);
  const isCurrentRevealed = revealed.has(currentOrigIdx);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(0).springify().damping(18).stiffness(220).mass(0.9)}
          style={styles.header}
        >
          <PressableScale onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={palette.ink} />
          </PressableScale>
          <Text style={styles.headerTitle}>💼 Corporate Coach</Text>
          <PressableScale onPress={fetchData} style={styles.headerBtn}>
            <Ionicons name="refresh-outline" size={22} color={palette.ink2} />
          </PressableScale>
        </Animated.View>

        {/* Progress Bar */}
        <ProgressBar reviewed={revealedCountInFiltered} total={totalFiltered} />

        {/* Category Filter */}
        <CategoryFilter selected={selectedCategory} onSelect={handleCategorySelect} />

        {/* Empty state for filter */}
        {totalFiltered === 0 && (
          <Animated.View entering={FadeIn.delay(200)} style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No phrases in this category</Text>
          </Animated.View>
        )}

        {/* Phrase Card */}
        {currentPhrase && !allFilteredReviewed && (
          <View style={styles.cardArea}>
            <PhraseCard
              key={`${selectedCategory}-${currentIndex}`}
              phrase={currentPhrase}
              isRevealed={isCurrentRevealed}
              onReveal={handleReveal}
            />
          </View>
        )}

        {/* Navigation Buttons */}
        {totalFiltered > 0 && !allFilteredReviewed && (
          <Animated.View
            entering={FadeInDown.delay(310).springify().damping(18).stiffness(220).mass(0.9)}
            style={styles.navRow}
          >
            <PressableScale
              onPress={handlePrev}
              disabled={currentIndex === 0}
              style={[
                styles.navBtn,
                currentIndex === 0 ? styles.navBtnDisabled : undefined,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={currentIndex === 0 ? palette.ink3 : palette.accent}
              />
              <Text
                style={[
                  styles.navBtnText,
                  currentIndex === 0 ? styles.navBtnTextDisabled : undefined,
                ]}
              >
                Previous
              </Text>
            </PressableScale>

            <View style={styles.navCounter}>
              <Text style={styles.navCounterText}>
                Phrase {currentIndex + 1} of {totalFiltered}
              </Text>
            </View>

            <PressableScale
              onPress={handleNext}
              disabled={currentIndex >= totalFiltered - 1}
              style={[
                styles.navBtn,
                currentIndex >= totalFiltered - 1 ? styles.navBtnDisabled : undefined,
              ]}
            >
              <Text
                style={[
                  styles.navBtnText,
                  currentIndex >= totalFiltered - 1 ? styles.navBtnTextDisabled : undefined,
                ]}
              >
                Next
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={currentIndex >= totalFiltered - 1 ? palette.ink3 : palette.accent}
              />
            </PressableScale>
          </Animated.View>
        )}

        {/* Scenario Card — shown when all filtered phrases reviewed */}
        {allFilteredReviewed && (
          <View style={styles.cardArea}>
            <Animated.View entering={FadeInDown.delay(100).springify().damping(18).stiffness(220).mass(0.9)}>
              <View style={styles.completedBanner}>
                <Text style={styles.completedEmoji}>🎉</Text>
                <Text style={styles.completedTitle}>All Phrases Reviewed!</Text>
                <Text style={styles.completedSub}>
                  Now put your skills to the test with a scenario.
                </Text>
              </View>
            </Animated.View>

            <View style={{ marginTop: space.lg }}>
              <ScenarioCard scenario={data.scenario} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },

  /* loading / error */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.lg,
  },
  loadingText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink2,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink2,
    textAlign: 'center',
    paddingHorizontal: space.xxl,
  },
  retryBtn: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.pill,
  },
  retryBtnText: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.accent,
  },

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  headerTitle: {
    fontFamily: font.serifBold,
    fontSize: 22,
    color: palette.ink,
  },

  /* progress */
  progressContainer: {
    paddingHorizontal: space.xl,
    marginBottom: space.lg,
  },
  progressLabel: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink2,
    marginBottom: space.sm,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.line2,
    overflow: 'hidden',
  },
  progressFillWrap: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    flex: 1,
    borderRadius: 4,
  },

  /* category filter */
  filterRow: {
    paddingHorizontal: space.lg,
    gap: space.sm,
    paddingBottom: space.lg,
  },
  filterPill: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radius.pill,
  },
  filterPillActive: {
    backgroundColor: palette.accent,
  },
  filterPillInactive: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
  },
  filterText: {
    fontFamily: font.sansMed,
    fontSize: 13,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextInactive: {
    color: palette.ink2,
  },

  /* card area */
  cardArea: {
    paddingHorizontal: space.xl,
  },

  /* phrase card */
  phraseCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },

  /* weak section */
  weakSection: {
    backgroundColor: palette.amberSoft,
    padding: space.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: space.md,
  },
  badgeWeak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(178,107,34,0.15)',
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 1,
    borderRadius: radius.pill,
    gap: space.xs + 2,
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeWeakText: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.amber,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  weakPhrase: {
    fontFamily: font.sansMed,
    fontSize: 18,
    color: palette.ink,
    lineHeight: 26,
  },

  /* reveal button */
  revealBtn: {
    marginHorizontal: space.xl,
    marginVertical: space.lg,
  },
  revealBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    gap: space.sm,
    ...shadow.raised,
  },
  revealBtnText: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  /* strong section */
  strongSection: {
    backgroundColor: palette.accentSoft,
    padding: space.xl,
  },
  badgeStrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55,86,61,0.15)',
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 1,
    borderRadius: radius.pill,
    gap: space.xs + 2,
  },
  badgeStrongText: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  strongPhrase: {
    fontFamily: font.sansBold,
    fontSize: 18,
    color: palette.accentInk,
    lineHeight: 26,
  },

  /* context card */
  contextCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.amberSoft,
    marginHorizontal: space.lg,
    marginTop: space.md,
    marginBottom: space.lg,
    padding: space.lg,
    borderRadius: radius.sm,
    gap: space.sm,
  },
  contextText: {
    flex: 1,
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 20,
  },

  /* category badge */
  categoryBadgeRow: {
    flexDirection: 'row',
    paddingHorizontal: space.xl,
    paddingBottom: space.lg,
    paddingTop: space.sm,
  },
  categoryBadge: {
    backgroundColor: palette.line2,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 1,
    borderRadius: radius.pill,
  },
  categoryBadgeText: {
    fontFamily: font.sansMed,
    fontSize: 11,
    color: palette.ink2,
    textTransform: 'capitalize',
  },

  /* navigation row */
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    marginTop: space.xl,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.md,
    gap: space.xs,
    borderWidth: 1,
    borderColor: palette.line,
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
  navBtnText: {
    fontFamily: font.sansSemi,
    fontSize: 13,
    color: palette.accent,
  },
  navBtnTextDisabled: {
    color: palette.ink3,
  },
  navCounter: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
  },
  navCounterText: {
    fontFamily: font.sansMed,
    fontSize: 12,
    color: palette.accent,
  },

  /* completed / scenario */
  completedBanner: {
    alignItems: 'center',
    paddingVertical: space.xl,
  },
  completedEmoji: {
    fontSize: 48,
    marginBottom: space.md,
  },
  completedTitle: {
    fontFamily: font.serifBold,
    fontSize: 24,
    color: palette.ink,
    marginBottom: space.sm,
  },
  completedSub: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink2,
    textAlign: 'center',
  },

  /* scenario card */
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.lg,
  },
  scenarioEmoji: {
    fontSize: 24,
  },
  scenarioTitle: {
    fontFamily: font.serifBold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  scenarioText: {
    fontFamily: font.sansReg,
    fontSize: 15,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 24,
    marginBottom: space.lg,
  },
  scenarioSub: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },

  /* empty filter state */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: space.md,
  },
  emptyText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink3,
  },
});

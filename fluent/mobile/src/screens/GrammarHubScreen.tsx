import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

import Header from '@/components/Header';
import Card from '@/components/Card';
import PressableScale from '@/components/PressableScale';
import ProgressRing from '@/components/ProgressRing';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';

const { width: SCREEN_W } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function GrammarHubScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { grammarTopics, fetchGrammarTopics, showToast } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [levelFilter, setLevelFilter] = useState<'All' | 'Foundation' | 'Intermediate' | 'Advanced' | 'Pro'>('All');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

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

  const toggleCategory = (catId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const levelTabs: Array<'All' | 'Foundation' | 'Intermediate' | 'Advanced' | 'Pro'> = [
    'All',
    'Foundation',
    'Intermediate',
    'Advanced',
    'Pro',
  ];

  // Process matching topics
  const filteredCategories = useMemo(() => {
    if (!grammarTopics?.categories) return [];
    return grammarTopics.categories
      .map((cat) => {
        const matchingTopics = cat.topics.filter((topic) => {
          if (levelFilter === 'All') return true;
          return topic.levelLabel?.toLowerCase() === levelFilter.toLowerCase();
        });
        return {
          ...cat,
          topics: matchingTopics,
        };
      })
      .filter((cat) => cat.topics.length > 0);
  }, [grammarTopics, levelFilter]);

  // Derived stats
  const totalTopics = grammarTopics?.totalTopics || 0;
  const topicsCompleted = grammarTopics?.topicsCompleted || 0;
  const overallMastery = grammarTopics?.overallMastery || 0;
  const estimatedXp = topicsCompleted * 50; // Approximated XP from grammar completed

  if (isLoading && !grammarTopics) {
    return (
      <View style={[styles.loadingScreen, { paddingTop: insets.top }]}>
        <Header title="Grammar Engine" showBack={true} />
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Assembling grammar curriculum...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Grammar Engine" showBack={true} />

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
        {/* Mastery Stats Strip */}
        <Animated.View entering={FadeInDown.duration(500).springify()}>
          <Card index={0} style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Grammar Mastery</Text>
              <Text style={styles.statsSubtitle}>Track your syntax fluency</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statColumn}>
                <Text style={styles.statNum}>{Math.round(overallMastery)}%</Text>
                <Text style={styles.statLabel}>Avg Mastery</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statColumn}>
                <Text style={styles.statNum}>
                  {topicsCompleted}/{totalTopics}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statColumn}>
                <Text style={styles.statNum}>{estimatedXp}</Text>
                <Text style={styles.statLabel}>XP Earned</Text>
              </View>
            </View>

            {/* Custom progress bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${totalTopics > 0 ? (topicsCompleted / totalTopics) * 100 : 0}%` },
                ]}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Level Filters Horizontal Scroll */}
        <View style={styles.filterOuter}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {levelTabs.map((level) => {
              const active = levelFilter === level;
              return (
                <TouchableOpacity
                  key={level}
                  onPress={() => setLevelFilter(level)}
                  style={[
                    styles.levelTab,
                    active ? styles.levelTabActive : null,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.levelTabText, active ? styles.levelTabTextActive : null]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Categories List */}
        {filteredCategories.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyContainer}>
            <Ionicons name="journal-outline" size={48} color={palette.ink3} />
            <Text style={styles.emptyTitle}>No matching topics</Text>
            <Text style={styles.emptySub}>
              We couldn't find any {levelFilter !== 'All' ? `${levelFilter} ` : ''}grammar topics available right now.
            </Text>
          </Animated.View>
        ) : (
          filteredCategories.map((category, catIndex) => {
            const isCollapsed = !!collapsedCategories[category.id];
            return (
              <Animated.View
                key={category.id}
                entering={FadeInDown.delay(100 + catIndex * 80)
                  .springify()
                  .damping(18)}
                style={styles.categoryContainer}
              >
                {/* Category Accordion Header */}
                <TouchableOpacity
                  onPress={() => toggleCategory(category.id)}
                  style={[styles.categoryHeader, shadow.card]}
                  activeOpacity={0.9}
                >
                  <View style={styles.categoryTitleGroup}>
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                  </View>
                  <Ionicons
                    name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                    size={20}
                    color={palette.ink2}
                  />
                </TouchableOpacity>

                {/* Topics Accordion Body */}
                {!isCollapsed && (
                  <View style={styles.topicsList}>
                    {category.topics.map((topic, topicIndex) => {
                      const isLocked = topic.locked;

                      // Level badge style selectors
                      let badgeBg: string = palette.accentSoft;
                      let badgeText: string = palette.accentInk;
                      if (topic.levelLabel?.toLowerCase().includes('intermediate')) {
                        badgeBg = '#EFF6FF';
                        badgeText = '#1E40AF';
                      } else if (topic.levelLabel?.toLowerCase().includes('advanced')) {
                        badgeBg = '#F5F3FF';
                        badgeText = '#5B21B6';
                      } else if (topic.levelLabel?.toLowerCase().includes('pro')) {
                        badgeBg = '#FEF3C7';
                        badgeText = '#92400E';
                      }

                      const handlePress = () => {
                        if (isLocked) {
                          showToast('🔒', 'Complete previous topics to unlock this one!');
                        } else {
                          navigation.navigate('GrammarLesson', {
                            topicId: topic.id,
                            topic: topic.title,
                            level: topic.levelLabel,
                          });
                        }
                      };

                      return (
                        <PressableScale
                          key={topic.id}
                          onPress={handlePress}
                          style={[
                            styles.topicCard,
                            isLocked ? styles.topicCardLocked : null,
                            shadow.card,
                          ]}
                        >
                          <View style={styles.topicCardLeft}>
                            <Text style={styles.topicTitle} numberOfLines={2}>
                              {topic.title}
                            </Text>
                            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                              <Text style={[styles.badgeText, { color: badgeText }]}>
                                {topic.levelLabel}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.topicCardRight}>
                            {isLocked ? (
                              <View style={styles.lockRing}>
                                <Ionicons name="lock-closed" size={16} color={palette.ink3} />
                              </View>
                            ) : (
                              <ProgressRing progress={topic.mastery / 100} size={38} strokeWidth={3}>
                                <Text style={styles.masteryPercentageText}>
                                  {Math.round(topic.mastery)}
                                </Text>
                              </ProgressRing>
                            )}
                          </View>
                        </PressableScale>
                      );
                    })}
                  </View>
                )}
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  scrollContent: {
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    gap: space.lg,
  },

  /* stats card */
  statsCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
  },
  statsHeader: {
    marginBottom: space.lg,
  },
  statsTitle: {
    fontFamily: font.serifMed,
    fontSize: 20,
    color: palette.ink,
  },
  statsSubtitle: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: font.serifBold,
    fontSize: 22,
    color: palette.ink,
  },
  statLabel: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: palette.line,
  },
  progressTrack: {
    height: 4,
    backgroundColor: palette.line2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.accent,
    borderRadius: radius.pill,
  },

  /* filter tabs */
  filterOuter: {
    marginHorizontal: -space.xl,
  },
  filterScroll: {
    paddingHorizontal: space.xl,
    gap: space.sm,
    paddingVertical: space.xs,
  },
  levelTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: palette.line2,
    borderWidth: 1,
    borderColor: palette.line,
  },
  levelTabActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  levelTabText: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink2,
  },
  levelTabTextActive: {
    color: '#FFFFFF',
    fontFamily: font.sansSemi,
  },

  /* categories accordion */
  categoryContainer: {
    gap: space.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.card,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderWidth: 1,
    borderColor: palette.line2,
  },
  categoryTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryLabel: {
    fontFamily: font.serifMed,
    fontSize: 16,
    color: palette.ink,
  },

  /* topics list */
  topicsList: {
    gap: space.sm,
    paddingLeft: space.xs,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.card,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  topicCardLocked: {
    opacity: 0.55,
    backgroundColor: palette.line2,
  },
  topicCardLeft: {
    flex: 1,
    gap: space.xs,
    paddingRight: space.md,
  },
  topicTitle: {
    fontFamily: font.serifReg,
    fontSize: 15,
    color: palette.ink,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontFamily: font.sansSemi,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  topicCardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masteryPercentageText: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.ink,
  },

  /* empty state */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxl * 2,
    gap: space.sm,
  },
  emptyTitle: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
    marginTop: space.sm,
  },
  emptySub: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    textAlign: 'center',
    paddingHorizontal: space.xxl,
  },
});

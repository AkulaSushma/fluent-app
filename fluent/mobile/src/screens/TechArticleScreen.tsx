import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PressableScale from '@/components/PressableScale';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { api } from '@/api/client';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TechArticleResponse {
  title: string;
  content: string;
  key_tradeoffs: string[];
  executive_summary: string;
  discussion_prompt: string;
  vocabulary_highlights: string[];
}

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */

let cachedArticle: TechArticleResponse | null = null;

export default function TechArticleScreen() {
  const insets = useSafeAreaInsets();

  const [article, setArticle] = useState<TechArticleResponse | null>(cachedArticle);
  const [isLoading, setIsLoading] = useState(!cachedArticle);
  const [error, setError] = useState<string | null>(null);

  /* Interactive state */
  const [tradeoffsOpen, setTradeoffsOpen] = useState(false);
  const [userSummary, setUserSummary] = useState('');
  const [showModelSummary, setShowModelSummary] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Fetch                                                            */
  /* ---------------------------------------------------------------- */

  const fetchArticle = useCallback(async () => {
    try {
      if (!cachedArticle) {
        setIsLoading(true);
      }
      setError(null);
      setTradeoffsOpen(false);
      setUserSummary('');
      setShowModelSummary(false);
      const data = await (api as any).getTechArticle();
      setArticle(data);
      cachedArticle = data;
    } catch (err) {
      console.error('Failed to fetch tech article:', err);
      if (!cachedArticle) {
        setError('Could not load today\'s article. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  /* ---------------------------------------------------------------- */
  /*  Toggle helpers                                                    */
  /* ---------------------------------------------------------------- */

  const toggleTradeoffs = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTradeoffsOpen((prev) => !prev);
  };

  const handleRevealSummary = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowModelSummary(true);
  };

  /* ---------------------------------------------------------------- */
  /*  Refresh button (right side of header)                            */
  /* ---------------------------------------------------------------- */

  const refreshButton = (
    <PressableScale
      onPress={fetchArticle}
      style={styles.headerBtn}
    >
      <Ionicons name="refresh" size={20} color={palette.ink2} />
    </PressableScale>
  );

  /* ---------------------------------------------------------------- */
  /*  Loading State                                                     */
  /* ---------------------------------------------------------------- */

  if (isLoading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header title="Daily Business Reading" right={refreshButton} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Loading today's article…</Text>
        </View>
      </View>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Error State                                                       */
  /* ---------------------------------------------------------------- */

  if (error || !article) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header title="Daily Business Reading" right={refreshButton} />
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color={palette.ink3} />
          <Text style={styles.errorText}>
            {error || 'Something went wrong.'}
          </Text>
          <Button label="Retry" variant="accent" onPress={fetchArticle} />
        </View>
      </View>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Daily Business Reading" right={refreshButton} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* -------------------------------------------------------- */}
        {/*  Article Card                                             */}
        {/* -------------------------------------------------------- */}
        <Card index={0}>
          <View style={styles.articleTitleRow}>
            {/* Gradient accent bar */}
            <LinearGradient
              colors={[palette.accent2, palette.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.accentBar}
            />
            <Text style={styles.articleTitle}>{article.title}</Text>
          </View>

          <Text style={styles.articleBody}>{article.content}</Text>

          {/* Vocabulary Highlights */}
          {article.vocabulary_highlights.length > 0 && (
            <View style={styles.vocabSection}>
              <View style={styles.vocabDivider} />
              <Text style={styles.vocabLabel}>Vocabulary Highlights</Text>
              <View style={styles.vocabPillsRow}>
                {article.vocabulary_highlights.map((word, idx) => (
                  <View key={idx} style={styles.vocabPill}>
                    <Text style={styles.vocabPillText}>{word}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* -------------------------------------------------------- */}
        {/*  Key Trade-offs (Expandable)                               */}
        {/* -------------------------------------------------------- */}
        <Animated.View
          entering={FadeInDown.delay(120).springify().damping(18).stiffness(220).mass(0.9)}
        >
          <PressableScale onPress={toggleTradeoffs} scaleValue={0.98}>
            <View style={styles.tradeoffCard}>
              <View style={styles.tradeoffHeader}>
                <Text style={styles.tradeoffHeaderText}>
                  🔍  Key Trade-offs to Identify
                </Text>
                <Ionicons
                  name={tradeoffsOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={palette.ink2}
                />
              </View>

              {tradeoffsOpen && (
                <Animated.View
                  entering={FadeIn.duration(300)}
                  style={styles.tradeoffBody}
                >
                  {article.key_tradeoffs.map((tradeoff, idx) => (
                    <View key={idx} style={styles.tradeoffItem}>
                      <View style={styles.tradeoffDot} />
                      <Text style={styles.tradeoffText}>{tradeoff}</Text>
                    </View>
                  ))}
                </Animated.View>
              )}
            </View>
          </PressableScale>
        </Animated.View>

        {/* -------------------------------------------------------- */}
        {/*  Your Summary Section                                      */}
        {/* -------------------------------------------------------- */}
        <Animated.View
          entering={FadeInDown.delay(200).springify().damping(18).stiffness(220).mass(0.9)}
        >
          <Card index={0} style={styles.noPadTop}>
            <Text style={styles.sectionTitle}>✍️  Your Summary</Text>
            <TextInput
              style={styles.summaryInput}
              placeholder="Write your 2-sentence executive summary..."
              placeholderTextColor={palette.ink3}
              multiline
              textAlignVertical="top"
              value={userSummary}
              onChangeText={setUserSummary}
            />

            {!showModelSummary && (
              <PressableScale onPress={handleRevealSummary}>
                <LinearGradient
                  colors={[palette.accent2, palette.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.revealBtn}
                >
                  <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.revealBtnText}>Reveal Model Summary</Text>
                </LinearGradient>
              </PressableScale>
            )}
          </Card>
        </Animated.View>

        {/* -------------------------------------------------------- */}
        {/*  Model Summary Card                                        */}
        {/* -------------------------------------------------------- */}
        {showModelSummary && (
          <Animated.View
            entering={FadeInDown.delay(60).springify().damping(18).stiffness(220).mass(0.9)}
          >
            <View style={styles.modelCard}>
              <View style={styles.modelCardHeader}>
                <Ionicons name="checkmark-circle" size={20} color={palette.accent} />
                <Text style={styles.modelCardLabel}>Model Summary</Text>
              </View>
              <Text style={styles.modelCardText}>
                {article.executive_summary}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* -------------------------------------------------------- */}
        {/*  Discussion Prompt Card (Dark)                             */}
        {/* -------------------------------------------------------- */}
        <Card
          index={4}
          dark
          style={styles.discussionCard}
        >
          <Text style={styles.discussionEmoji}>💬</Text>
          <Text style={styles.discussionTitle}>Discussion Practice</Text>
          <Text style={styles.discussionPrompt}>
            {article.discussion_prompt}
          </Text>
          <Text style={styles.discussionHint}>
            Practice answering this question out loud
          </Text>
        </Card>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 100 }} />
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
  scrollContent: {
    paddingHorizontal: space.xl,
    gap: space.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.lg,
    paddingHorizontal: space.xxl,
  },
  loadingText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink3,
    marginTop: space.sm,
  },
  errorText: {
    fontFamily: font.sansReg,
    fontSize: 15,
    color: palette.ink2,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: space.sm,
  },

  /* Header button */
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },

  /* ---- Article Card ---- */
  articleTitleRow: {
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.lg,
  },
  accentBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 28,
  },
  articleTitle: {
    flex: 1,
    fontFamily: font.serifBold,
    fontSize: 22,
    color: palette.ink,
    lineHeight: 30,
  },
  articleBody: {
    fontFamily: font.sansReg,
    fontSize: 15.5,
    color: palette.ink2,
    lineHeight: 25,
    letterSpacing: 0.1,
  },

  /* Vocabulary pills */
  vocabSection: {
    marginTop: space.xl,
  },
  vocabDivider: {
    height: 1,
    backgroundColor: palette.line2,
    marginBottom: space.md,
  },
  vocabLabel: {
    fontFamily: font.sansSemi,
    fontSize: 12,
    color: palette.ink3,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: space.sm,
  },
  vocabPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  vocabPill: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    backgroundColor: palette.accentSoft,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(55, 86, 61, 0.12)',
  },
  vocabPillText: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.accentInk,
  },

  /* ---- Trade-offs Section ---- */
  tradeoffCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...shadow.card,
  },
  tradeoffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeoffHeaderText: {
    fontFamily: font.sansSemi,
    fontSize: 16,
    color: palette.ink,
  },
  tradeoffBody: {
    marginTop: space.lg,
    gap: space.md,
  },
  tradeoffItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  tradeoffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.accent,
    marginTop: 6,
  },
  tradeoffText: {
    flex: 1,
    fontFamily: font.sansReg,
    fontSize: 14.5,
    color: palette.ink2,
    lineHeight: 22,
  },

  /* ---- Summary Section ---- */
  noPadTop: {
    paddingTop: space.xl,
  },
  sectionTitle: {
    fontFamily: font.sansSemi,
    fontSize: 16,
    color: palette.ink,
    marginBottom: space.md,
  },
  summaryInput: {
    fontFamily: font.sansReg,
    fontSize: 15,
    color: palette.ink,
    backgroundColor: palette.line2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.line,
    padding: space.lg,
    minHeight: 100,
    lineHeight: 23,
    marginBottom: space.lg,
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: 14,
    borderRadius: radius.md,
    ...shadow.raised,
  },
  revealBtnText: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  /* ---- Model Summary Card ---- */
  modelCard: {
    backgroundColor: palette.accentSoft,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(55, 86, 61, 0.15)',
  },
  modelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.md,
  },
  modelCardLabel: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.accentInk,
  },
  modelCardText: {
    fontFamily: font.sansReg,
    fontSize: 15,
    color: palette.accentInk,
    lineHeight: 24,
  },

  /* ---- Discussion Card (Dark) ---- */
  discussionCard: {
    paddingTop: space.xxl,
    paddingBottom: space.xxl,
  },
  discussionEmoji: {
    fontSize: 28,
    marginBottom: space.sm,
  },
  discussionTitle: {
    fontFamily: font.serifMed,
    fontSize: 20,
    color: palette.paper,
    marginBottom: space.md,
  },
  discussionPrompt: {
    fontFamily: font.sansReg,
    fontSize: 15.5,
    color: 'rgba(244, 241, 235, 0.85)',
    lineHeight: 24,
    marginBottom: space.md,
  },
  discussionHint: {
    fontFamily: font.sansMed,
    fontSize: 12,
    color: palette.ink3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

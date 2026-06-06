import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  FadeInDown,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import Header from '@/components/Header';
import Button from '@/components/Button';
import PressableScale from '@/components/PressableScale';
import Confetti from '@/components/Confetti';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';
import { api } from '@/api/client';
import type { SRSCardOut } from '@/api/client';
import { useAudioPlayer } from 'expo-audio';
import { speakSweetly } from '@/utils/speech';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - space.xl * 2;
const CARD_H = 400;

interface CardDetails {
  word: string;
  ipa: string;
  definition: string;
  example: string;
  hindi: string;
  telugu: string;
}

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { showToast, fireConfetti, fetchProgress } = useStore();

  // Initialize sound player for page flip sound effect
  const againPlayer = useAudioPlayer();

  useEffect(() => {
    againPlayer.replace('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
  }, []);

  const [cards, setCards] = useState<SRSCardOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [details, setDetails] = useState<CardDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const flipProgress = useSharedValue(0);

  // Load due cards
  const loadDueCards = async () => {
    setLoading(true);
    try {
      const res = await api.getSrsDue(25);
      setCards(res.cards);
      setCurrentIndex(0);
      setReviewedCount(0);
      if (res.cards.length > 0) {
        await loadDetails(res.cards[0].word);
      }
    } catch (err) {
      console.error('Failed to load due cards:', err);
      showToast('❌', 'Failed to load review deck');
    } finally {
      setLoading(false);
    }
  };

  // Load details for current word
  const loadDetails = async (word: string) => {
    setLoadingDetails(true);
    try {
      const data = await api.getVocabCardDetails(word);
      setDetails(data);
    } catch (err) {
      console.error('Failed to load card details:', err);
      // Fallback
      setDetails({
        word,
        ipa: '/.../',
        definition: 'Spaced repetition vocabulary item.',
        example: `Practicing the word "${word}" today.`,
        hindi: 'शब्द',
        telugu: 'పదం',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadDueCards();
  }, []);

  useEffect(() => {
    flipProgress.value = withTiming(flipped ? 1 : 0, { duration: 500 });
  }, [flipped, flipProgress]);

  const handleSpeakOnly = () => {
    if (!details) return;
    speakSweetly(details.word);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleFlip = () => {
    setFlipped((prev) => {
      const next = !prev;
      if (next && details) {
        speakSweetly(details.word);
      }
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    againPlayer.seekTo(0);
    againPlayer.play();
  };

  const handleSpeakAndFlip = () => {
    if (!details) return;
    speakSweetly(details.word);
    
    // Play flip sound
    againPlayer.seekTo(0);
    againPlayer.play();
    
    setFlipped(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Submit review score
  const submitReview = async (quality: number) => {
    if (cards.length === 0 || currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];
    const word = currentCard.word;

    Haptics.notificationAsync(
      quality >= 3
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );

    try {
      // API call to update SM-2 parameters
      await api.reviewSrsCard(word, quality);

      setReviewedCount((prev) => prev + 1);

      // Check if there is a next card
      const nextIndex = currentIndex + 1;
      if (nextIndex < cards.length) {
        setFlipped(false);
        setCurrentIndex(nextIndex);
        await loadDetails(cards[nextIndex].word);
      } else {
        // Complete!
        fireConfetti();
        showToast('🎉', 'Spaced Repetition session complete!');
        // Log practice session for XP (5 min duration, 100% completion)
        try {
          await api.logSession('vocab', 5, 100);
          await fetchProgress();
        } catch (sessionErr) {
          console.error(sessionErr);
        }
        setCurrentIndex(cards.length); // shows completed card
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      showToast('❌', 'Error updating card status');
    }
  };

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1400 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      opacity: flipProgress.value < 0.5 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1400 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden' as const,
      opacity: flipProgress.value >= 0.5 ? 1 : 0,
    };
  });

  const total = cards.length;
  const current = Math.min(currentIndex, total - 1);
  const isDeckComplete = currentIndex >= total && total > 0;

  // Rating button configurations
  const RATINGS = [
    { label: 'Forgot', score: 0, color: '#EF4444' }, // Red
    { label: 'Hard', score: 2, color: '#F59E0B' },   // Amber
    { label: 'Good', score: 3, color: '#10B981' },   // Emerald/Green
    { label: 'Easy', score: 5, color: '#6366F1' },   // Indigo/Blue
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Daily Review" />
      <Confetti />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Fetching due cards...</Text>
        </View>
      ) : total === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🧠</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySub}>
            Your spaced repetition deck has no due cards for today. Good job!
          </Text>
          <Button
            label="Back to dashboard"
            variant="dark"
            onPress={() => nav.goBack()}
            style={styles.backBtn}
          />
        </View>
      ) : isDeckComplete ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyTitle}>Review Session Done!</Text>
          <Text style={styles.emptySub}>
            You completed all {total} reviews. Your long-term memory will thank you!
          </Text>
          <Button
            label="Back to dashboard"
            variant="dark"
            onPress={() => nav.goBack()}
            style={styles.backBtn}
          />
        </View>
      ) : (
        <View style={styles.mainContainer}>
          {/* Card Count */}
          <Animated.View
            entering={FadeInDown.delay(50).springify().damping(18)}
            style={styles.counterRow}
          >
            <View style={styles.counterPill}>
              <Text style={styles.counterText}>
                Due Card {current + 1} of {total}
              </Text>
            </View>
          </Animated.View>

          {/* Flashcard Area */}
          <View style={styles.cardWrapper}>
            {loadingDetails ? (
              <View style={[styles.cardFace, styles.frontFace, shadow.card, styles.center]}>
                <ActivityIndicator color={palette.accent} />
              </View>
            ) : (
              <View style={styles.cardContainer}>
                {/* Front Side */}
                <PressableScale
                  onPress={handleFlip}
                  style={styles.cardFace}
                  haptic={false}
                >
                  <Animated.View
                    style={[styles.cardFace, styles.frontFace, shadow.card, frontStyle]}
                  >
                    <Text style={styles.word}>{details?.word}</Text>
                    <Text style={styles.ipa}>{details?.ipa}</Text>
                    <PressableScale style={styles.speakerBtn} onPress={handleSpeakAndFlip}>
                      <Text style={styles.speakerIcon}>🔊</Text>
                    </PressableScale>
                    <Text style={styles.hint}>Tap to reveal details</Text>
                  </Animated.View>
                </PressableScale>

                {/* Back Side */}
                <PressableScale
                  onPress={handleFlip}
                  style={styles.cardFace}
                  haptic={false}
                >
                  <Animated.View
                    style={[styles.cardFace, styles.backFace, shadow.card, backStyle]}
                  >
                    <LinearGradient
                      colors={[palette.dark1, palette.dark2]}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <View style={styles.backContent}>
                      {/* Back Header with word and voice button */}
                      <View style={styles.backHeaderRow}>
                        <View style={styles.backHeaderTextCol}>
                          <Text style={styles.backWord}>{details?.word}</Text>
                          <Text style={styles.backIpa}>{details?.ipa}</Text>
                        </View>
                        <PressableScale style={styles.backSpeakerBtn} onPress={handleSpeakOnly}>
                          <Text style={styles.backSpeakerIcon}>🔊</Text>
                        </PressableScale>
                      </View>
                      <View style={styles.dividerLight} />

                      {/* Definitions & Examples */}
                      <Text style={styles.label}>Definition</Text>
                      <Text style={styles.defText}>{details?.definition}</Text>

                      <Text style={styles.label}>Example</Text>
                      <Text style={styles.exText}>"{details?.example}"</Text>

                      <View style={styles.dividerLight} />

                      {/* Regional Languages translations */}
                      <View style={styles.translationRow}>
                        <View style={styles.transCol}>
                          <Text style={styles.label}>Hindi (हिंदी)</Text>
                          <Text style={styles.transText}>{details?.hindi}</Text>
                        </View>
                        <View style={styles.transCol}>
                          <Text style={styles.label}>Telugu (తెలుగు)</Text>
                          <Text style={styles.transText}>{details?.telugu}</Text>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                </PressableScale>
              </View>
            )}
          </View>

          {/* Rating controls or Tip */}
          <Animated.View
            entering={FadeInDown.delay(150).springify().damping(18)}
            style={styles.controlArea}
          >
            {!flipped ? (
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  💡 Recall the meaning and translations, then tap the card to verify.
                </Text>
              </View>
            ) : (
              <View style={styles.gradeContainer}>
                <Text style={styles.gradeTitle}>How well did you recall?</Text>
                <View style={styles.btnRow}>
                  {RATINGS.map((rate) => (
                    <PressableScale
                      key={rate.score}
                      onPress={() => submitReview(rate.score)}
                      style={[styles.gradeBtn, { borderColor: rate.color }]}
                    >
                      <Text style={[styles.gradeBtnText, { color: rate.color }]}>
                        {rate.label}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: space.xl,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xxl,
  },
  loadingText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink3,
    marginTop: space.md,
  },
  counterRow: {
    alignItems: 'center',
    marginTop: space.md,
  },
  counterPill: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  counterText: {
    fontFamily: font.sansSemi,
    fontSize: 13,
    color: palette.accent,
  },
  cardWrapper: {
    width: CARD_W,
    height: CARD_H,
    marginTop: space.lg,
  },
  cardContainer: {
    flex: 1,
    position: 'relative',
  },
  cardFace: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  frontFace: {
    backgroundColor: palette.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  backFace: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  backContent: {
    flex: 1,
    padding: space.xl,
    justifyContent: 'center',
  },
  backHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  backHeaderTextCol: {
    flex: 1,
  },
  backWord: {
    fontFamily: font.serifBold,
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  backIpa: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  backSpeakerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpeakerIcon: {
    fontSize: 18,
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: space.md,
  },
  word: {
    fontFamily: font.serifBold,
    fontSize: 38,
    color: palette.ink,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  ipa: {
    fontFamily: font.sansReg,
    fontSize: 18,
    color: palette.ink3,
    marginBottom: space.xl,
    textAlign: 'center',
  },
  speakerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xxl,
  },
  speakerIcon: {
    fontSize: 24,
  },
  hint: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    textAlign: 'center',
  },
  label: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.accent2,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  defText: {
    fontFamily: font.sansReg,
    fontSize: 17,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: space.lg,
  },
  exText: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: space.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: space.md,
  },
  translationRow: {
    flexDirection: 'row',
    gap: space.lg,
  },
  transCol: {
    flex: 1,
  },
  transText: {
    fontFamily: font.sansMed,
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 4,
  },
  controlArea: {
    marginTop: space.lg,
  },
  tipBox: {
    padding: space.xl,
    borderRadius: radius.lg,
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  tipText: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.accent,
    textAlign: 'center',
    lineHeight: 18,
  },
  gradeContainer: {
    alignItems: 'center',
  },
  gradeTitle: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.ink2,
    marginBottom: space.md,
  },
  btnRow: {
    flexDirection: 'row',
    gap: space.sm,
    justifyContent: 'space-between',
    width: '100%',
  },
  gradeBtn: {
    flex: 1,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeBtnText: {
    fontFamily: font.sansSemi,
    fontSize: 12,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: space.lg,
  },
  emptyTitle: {
    fontFamily: font.serifBold,
    fontSize: 26,
    color: palette.ink,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink2,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: space.xxl,
  },
  backBtn: {
    width: '80%',
  },
});

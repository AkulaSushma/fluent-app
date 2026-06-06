import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

import Header from '@/components/Header';
import Button from '@/components/Button';
import Confetti from '@/components/Confetti';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';
import { useAudioPlayer } from 'expo-audio';
import { speakSweetly } from '@/utils/speech';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - space.xl * 2;

export default function ObjectNamingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    visualCards,
    fetchVisualVocab,
    logPracticeSession,
    markCardMastered,
    showToast,
    fireConfetti,
  } = useStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [revealed, setRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Initialize sound effects players
  const successPlayer = useAudioPlayer();
  const completePlayer = useAudioPlayer();

  useEffect(() => {
    successPlayer.replace('https://assets.mixkit.co/active_storage/sfx/2013/2013-84.wav');
    completePlayer.replace('https://assets.mixkit.co/active_storage/sfx/1435/1435-200.wav');
  }, []);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleVal = useSharedValue(1.5);

  // Fetch cards on mount
  useEffect(() => {
    const loadCards = async () => {
      setIsLoading(true);
      await fetchVisualVocab();
      setIsLoading(false);
    };
    loadCards();
  }, [fetchVisualVocab]);

  // Use cards directly (already randomized and shuffled by backend)
  const filteredCards = useMemo(() => {
    return visualCards;
  }, [visualCards]);

  // Restart timer for current card when index changes
  useEffect(() => {
    if (filteredCards.length === 0 || isSessionComplete) return;

    setCountdown(3);
    setRevealed(false);
    scaleVal.value = 1.5;
    scaleVal.value = withSpring(1, { damping: 10, stiffness: 100 });

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setRevealed(true);
          successPlayer.seekTo(0);
          successPlayer.play();
          if (filteredCards[currentIndex]) {
            speakSweetly(filteredCards[currentIndex].word);
          }
          return 0;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        scaleVal.value = 1.5;
        scaleVal.value = withSpring(1, { damping: 10, stiffness: 100 });
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, filteredCards, isSessionComplete, scaleVal, successPlayer]);

  const handleReveal = useCallback(() => {
    if (revealed) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(0);
    setRevealed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    successPlayer.seekTo(0);
    successPlayer.play();
    if (filteredCards[currentIndex]) {
      speakSweetly(filteredCards[currentIndex].word);
    }
  }, [revealed, currentIndex, filteredCards, successPlayer]);

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    const currentCard = filteredCards[currentIndex];

    // Mark card as mastered in background without blocking screen transition
    markCardMastered(currentCard.word).catch((e) => {
      console.warn('Could not mark word as mastered:', e);
    });

    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsSessionComplete(true);
      completePlayer.seekTo(0);
      completePlayer.play();
      fireConfetti();
      showToast('🎉', 'Visual vocabulary deck complete!');
      logPracticeSession('vocab', 2, 100).catch((e) => {
        console.warn('Could not log practice session:', e);
      });
    }
  }, [currentIndex, filteredCards, markCardMastered, fireConfetti, showToast, logPracticeSession, completePlayer]);

  const timerNumStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleVal.value }],
    };
  });

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={palette.accent} />
      </View>
    );
  }

  if (visualCards.length === 0) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>No visual cards found. Check backend server.</Text>
        <Button label="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const currentCard = filteredCards[currentIndex];
  const progressPercent = filteredCards.length > 0 
    ? ((currentIndex + (isSessionComplete ? 1 : 0)) / filteredCards.length) * 100 
    : 0;

  return (
    <LinearGradient
      colors={['#E8ECFD', '#F6F3FE']}
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <Header title="Visual Vocabulary" />
      <Confetti />

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {isSessionComplete
            ? 'Deck Complete'
            : `Object ${currentIndex + 1} of ${filteredCards.length}`}
        </Text>
      </View>

      {isSessionComplete ? (
        <View style={styles.centerContainer}>
          <Animated.View
            entering={FadeInDown.springify().damping(15)}
            style={[styles.completedCard, shadow.card]}
          >
            <Text style={styles.completedEmoji}>🏆</Text>
            <Text style={styles.completedTitle}>Object Master!</Text>
            <Text style={styles.completedSub}>
              You identified all {filteredCards.length} daily everyday objects correctly.
            </Text>
            <View style={styles.xpRewardPill}>
              <Text style={styles.xpRewardText}>+100 XP Earned</Text>
            </View>
            <Button
              label="Return to Dashboard"
              onPress={() => navigation.navigate('MainTabs')}
              style={styles.actionBtn}
            />
          </Animated.View>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* US Flag Indicator & Category Badge */}
          <View style={styles.badgeRow}>
            <View style={styles.flagPill}>
              <Text style={styles.flagText}>🇺🇸 US English</Text>
            </View>
            {currentCard && (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryBadgeText}>
                  {currentCard.category === 'daily_life' ? '🏠 ' 
                   : currentCard.category === 'corporate' ? '💼 ' 
                   : currentCard.category === 'catering' ? '🍽️ ' 
                   : currentCard.category === 'travel' ? '✈️ ' 
                   : '📍 '}
                  {currentCard.categoryLabel}
                </Text>
              </View>
            )}
          </View>

          {/* Interactive Object Card */}
          {currentCard && (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={handleReveal}
              style={[styles.glassCard, shadow.card]}
            >
              <Text style={styles.cardHeaderTitle}>What is this called?</Text>

              {/* Object Image - Use key prop to prevent image flash caching mismatch */}
              <View style={styles.imageWrapper}>
                {currentCard.imageUrl ? (
                  <Image
                    key={currentCard.word}
                    source={{
                      uri: currentCard.imageUrl,
                      cache: 'force-cache',
                    }}
                    style={styles.objectImage}
                    resizeMode="cover"
                    onError={(e) => console.warn('Image loading failed:', e.nativeEvent.error)}
                  />
                ) : (
                  <View style={[styles.objectImage, styles.imagePlaceholder]}>
                    <Text style={styles.placeholderIcon}>🖼️</Text>
                  </View>
                )}
              </View>

              {/* Reveal section */}
              <View style={styles.bottomSection}>
                {!revealed ? (
                  <View style={styles.timerWrapper}>
                    <View style={styles.circularTimer}>
                      <Animated.Text style={[styles.timerNumber, timerNumStyle]}>
                        {countdown}
                      </Animated.Text>
                    </View>
                    <Text style={styles.tapToRevealHint}>Tap image to reveal instantly</Text>
                  </View>
                ) : (
                  <Animated.View
                    entering={FadeInDown.springify().damping(12)}
                    style={styles.revealWrapper}
                  >
                    <View style={styles.objectNameRow}>
                      <Text style={styles.objectName}>{currentCard.word}</Text>
                      <TouchableOpacity
                        onPress={() => speakSweetly(currentCard.word)}
                        style={styles.visualSpeakerBtn}
                      >
                        <Ionicons name="volume-medium-outline" size={22} color={palette.accent} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.objectIpa}>{currentCard.ipa}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.definitionText}>{currentCard.definition}</Text>
                  </Animated.View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Next Button */}
          {revealed && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.nextBtnContainer}>
              <Button
                label={currentIndex === filteredCards.length - 1 ? 'Finish Drill' : 'Next Object'}
                onPress={handleNext}
                style={styles.nextBtn}
              />
            </Animated.View>
          )}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.xl,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl,
  },
  tabsContainer: {
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'center',
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabPillActive: {
    backgroundColor: palette.card,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  tabText: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink3,
  },
  tabTextActive: {
    color: palette.accent,
    fontFamily: font.sansSemi,
  },
  progressContainer: {
    paddingHorizontal: space.xl,
    marginTop: space.xs,
    marginBottom: space.md,
    alignItems: 'center',
  },
  progressBarBg: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: palette.accent,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: font.sansMed,
    fontSize: 12,
    color: palette.ink2,
    marginTop: space.xs,
  },
  errorText: {
    fontFamily: font.sansReg,
    fontSize: 16,
    color: palette.amber,
    textAlign: 'center',
    marginBottom: space.lg,
    paddingHorizontal: space.xl,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.md,
    alignItems: 'center',
  },
  flagPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  flagText: {
    fontFamily: font.sansMed,
    fontSize: 12,
    color: palette.ink2,
  },
  categoryPill: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  categoryBadgeText: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.accent,
  },
  glassCard: {
    width: CARD_W,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: space.xl,
    alignItems: 'center',
    flex: 1,
    minHeight: 420,
    marginBottom: space.xl,
  },
  cardHeaderTitle: {
    fontFamily: font.serifMed,
    fontSize: 20,
    color: palette.ink,
    marginBottom: space.lg,
    textAlign: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginBottom: space.xl,
  },
  objectImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  bottomSection: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerWrapper: {
    alignItems: 'center',
    gap: space.md,
  },
  circularTimer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: palette.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerNumber: {
    fontFamily: font.sansBold,
    fontSize: 28,
    color: palette.accent,
  },
  tapToRevealHint: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
  },
  revealWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  objectName: {
    fontFamily: font.sansBold,
    fontSize: 28,
    color: palette.ink,
    textAlign: 'center',
  },
  objectIpa: {
    fontFamily: font.sansReg,
    fontSize: 16,
    color: palette.ink2,
    fontStyle: 'italic',
    marginTop: space.xs,
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: palette.accent,
    marginVertical: space.md,
    borderRadius: 1,
  },
  definitionText: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink2,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: space.sm,
  },
  nextBtnContainer: {
    width: '100%',
    marginBottom: space.sm,
  },
  nextBtn: {
    width: '100%',
  },
  completedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: space.xxl,
    alignItems: 'center',
    width: CARD_W,
  },
  completedEmoji: {
    fontSize: 64,
    marginBottom: space.lg,
  },
  completedTitle: {
    fontFamily: font.serifBold,
    fontSize: 26,
    color: palette.ink,
    marginBottom: space.md,
    textAlign: 'center',
  },
  completedSub: {
    fontFamily: font.sansReg,
    fontSize: 15,
    color: palette.ink2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: space.xl,
  },
  xpRewardPill: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginBottom: space.xxl,
  },
  xpRewardText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.accent,
  },
  actionBtn: {
    width: '100%',
  },
  objectNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  visualSpeakerBtn: {
    padding: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.accentSoft,
    marginLeft: space.xs,
  },
});

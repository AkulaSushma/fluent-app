import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Extrapolation,
  FadeInDown,
  Easing,
  withRepeat,
  withDelay,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRoute } from '@react-navigation/native';
import { useAudioPlayer, useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import Ionicons from '@expo/vector-icons/Ionicons';

import Header from '@/components/Header';
import Button from '@/components/Button';
import PressableScale from '@/components/PressableScale';
import Confetti from '@/components/Confetti';
import { palette, radius, space, shadow, spring as springCfg } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';
import { speakSweetly } from '@/utils/speech';
import { api } from '@/api/client';


const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_H < 750;
const SWIPE_THRESHOLD = 110;
const CARD_W = SCREEN_W - space.xl * 2;
const CARD_H = IS_SMALL_SCREEN ? 310 : 380;

/* ------------------------------------------------------------------ */
/*  Equalizer Bar                                                      */
/* ------------------------------------------------------------------ */
function EqBar({ index, isRecording }: { index: number; isRecording: boolean }) {
  const height = useSharedValue(8);
  const duration = 600 + Math.random() * 600;

  useEffect(() => {
    if (isRecording) {
      height.value = withDelay(
        index * 25,
        withRepeat(
          withTiming(8 + Math.random() * 30, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true,
        ),
      );
    } else {
      height.value = withTiming(8, { duration: 300 });
    }
  }, [height, index, duration, isRecording]);

  const style = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View style={[styles.eqBar, style]}>
      <LinearGradient
        colors={[palette.accent2, palette.accent]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  FlashCard                                                          */
/* ------------------------------------------------------------------ */
function FlashCardView({
  word,
  ipa,
  definition,
  example,
  hindi,
  telugu,
  isFlipped,
  onFlip,
  onSpeak,
  onSpeakOnly,
}: {
  word: string;
  ipa: string;
  definition: string;
  example: string;
  hindi?: string;
  telugu?: string;
  isFlipped: boolean;
  onFlip: () => void;
  onSpeak: () => void;
  onSpeakOnly: () => void;
}) {
  const flipProgress = useSharedValue(0);

  React.useEffect(() => {
    flipProgress.value = withTiming(isFlipped ? 1 : 0, { duration: 500 });
  }, [isFlipped, flipProgress]);

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

  return (
    <View style={styles.cardContainer}>
      {/* Front */}
      <PressableScale
        onPress={onFlip}
        style={styles.cardFace}
        haptic={false}
      >
        <Animated.View style={[styles.cardFace, styles.frontFace, shadow.card, frontStyle]}>
          <Text style={styles.word}>{word}</Text>
          <Text style={styles.ipa}>{ipa}</Text>
          <PressableScale style={styles.speakerBtn} onPress={onSpeak}>
            <Text style={styles.speakerIcon}>🔊</Text>
          </PressableScale>
          <Text style={styles.hint}>Tap to reveal · Swipe to continue</Text>
        </Animated.View>
      </PressableScale>

      {/* Back */}
      <PressableScale
        onPress={onFlip}
        style={styles.cardFace}
        haptic={false}
      >
        <Animated.View style={[styles.cardFace, styles.backFace, shadow.card, backStyle]}>
          <LinearGradient
            colors={[palette.dark1, palette.dark2]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <ScrollView
            contentContainerStyle={styles.backContentScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Back Header with word and voice button */}
            <View style={styles.backHeaderRow}>
              <View style={styles.backHeaderTextCol}>
                <Text style={styles.backWord}>{word}</Text>
                <Text style={styles.backIpa}>{ipa}</Text>
              </View>
              <PressableScale style={styles.backSpeakerBtn} onPress={onSpeakOnly}>
                <Text style={styles.backSpeakerIcon}>🔊</Text>
              </PressableScale>
            </View>

            <View style={styles.dividerLight} />

            <Text style={styles.defLabel}>Definition</Text>
            <Text style={styles.defText}>{definition}</Text>
            <Text style={styles.exLabel}>Example</Text>
            <Text style={styles.exText}>"{example}"</Text>

            {(hindi || telugu) && (
              <>
                <View style={styles.dividerLight} />
                <View style={styles.translationRow}>
                  {hindi && (
                    <View style={styles.transCol}>
                      <Text style={styles.defLabel}>Hindi (हिंदी)</Text>
                      <Text style={styles.transText}>{hindi}</Text>
                    </View>
                  )}
                  {telugu && (
                    <View style={styles.transCol}>
                      <Text style={styles.defLabel}>Telugu (తెలుగు)</Text>
                      <Text style={styles.transText}>{telugu}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </PressableScale>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */
export default function VocabScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const themeParam = route.params?.theme || 'corporate';

  // Initialize sound effects players
  const successPlayer = useAudioPlayer();
  const againPlayer = useAudioPlayer();
  const completePlayer = useAudioPlayer();

  React.useEffect(() => {
    successPlayer.replace('https://assets.mixkit.co/active_storage/sfx/2013/2013-84.wav');
    againPlayer.replace('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
    completePlayer.replace('https://assets.mixkit.co/active_storage/sfx/1435/1435-200.wav');
  }, []);

  const {
    deck,
    currentCardIndex,
    knownIds,
    markKnown,
    markAgain,
    showToast,
    fireConfetti,
    fetchVocabDeck,
    logPracticeSession,
    userSettings,
    fetchSettings,
  } = useStore();

  React.useEffect(() => {
    fetchVocabDeck(themeParam);
    if (!userSettings) {
      fetchSettings();
    }
  }, [fetchVocabDeck, themeParam, fetchSettings, userSettings]);

  const cards = deck.cards;
  const total = cards.length;
  const current = Math.min(currentCardIndex, total - 1);
  const isDeckComplete = currentCardIndex >= total;

  const [flipped, setFlipped] = useState(false);

  /* Voice Verification States */
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isPronunciationValid, setIsPronunciationValid] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const attemptCountRef = React.useRef(0);

  // Reset verification state, speak word automatically, and auto-start recording on first load
  useEffect(() => {
    setIsPronunciationValid(false);
    setIsRecording(false);
    setIsEvaluating(false);
    setEvaluationResult(null);
    attemptCountRef.current = 0;

    if (isDeckComplete || !isVoiceMode) return;

    // 1. Speak target word automatically
    const targetWord = cards[current].word;
    speakSweetly(targetWord);

    // 2. Automatically start recording after TTS finishes (approx 1.4s)
    const timer = setTimeout(() => {
      if (attemptCountRef.current === 0 && !isPronunciationValid && !isDeckComplete) {
        startRecording();
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [currentCardIndex, isVoiceMode]);

  const isUnlocked = !isVoiceMode || isPronunciationValid;
  const isUnlockedShared = useSharedValue(true);

  useEffect(() => {
    isUnlockedShared.value = isUnlocked;
  }, [isUnlocked]);

  const showLockToast = useCallback(() => {
    showToast('🔒', 'Please repeat the word correctly to unlock next card');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, [showToast]);

  async function startRecording() {
    attemptCountRef.current += 1;
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        showToast('⚠️', 'Microphone permission is required');
        return;
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      showToast('🎙️', 'Recording started...');
    } catch (err) {
      console.error('Failed to start recording', err);
      showToast('❌', 'Could not access microphone');
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    showToast('⏳', 'Evaluating speech accuracy...');
    setIsEvaluating(true);

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (uri && !isDeckComplete) {
        const targetWord = cards[current].word;
        const evalResult = await api.evaluatePronunciation(uri, targetWord);
        setEvaluationResult(evalResult);

        if (evalResult.accuracy >= 75) {
          setIsPronunciationValid(true);
          successPlayer.seekTo(0);
          successPlayer.play();
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          showToast('✨', `Perfect! Accuracy: ${evalResult.accuracy}%`);
          logPracticeSession('pronunciation', 1, evalResult.accuracy).catch(() => {});
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          showToast('❌', `Try again. Accuracy: ${evalResult.accuracy}%`);
        }
      }
    } catch (err) {
      console.error('Failed to evaluate recording:', err);
      showToast('⚠️', 'Connection error. You can skip the check.');
      
      const fallbackResult = {
        accuracy: 0,
        matched_words: [],
        problem_words: [cards[current].word],
        tip: 'Could not connect to the pronunciation server. Tap "Skip voice check" below to continue offline.',
      };
      setEvaluationResult(fallbackResult);
      setIsPronunciationValid(false);
      againPlayer.seekTo(0);
      againPlayer.play();
    } finally {
      setIsEvaluating(false);
    }
  }

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  /* gesture values */
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const handleKnown = useCallback(() => {
    if (isDeckComplete) return;
    const card = cards[current];
    markKnown(card.id || '');
    setFlipped(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('✅', `"${card.word}" mastered!`);
    if (current === total - 1) {
      completePlayer.seekTo(0);
      completePlayer.play();
      fireConfetti();
      showToast('🎉', 'Deck complete! Amazing work!');
      logPracticeSession('vocab', 2, 100);
    } else {
      successPlayer.seekTo(0);
      successPlayer.play();
    }
  }, [current, cards, isDeckComplete, total, markKnown, showToast, fireConfetti, logPracticeSession, successPlayer, completePlayer]);

  const handleAgain = useCallback(() => {
    if (isDeckComplete) return;
    markAgain();
    setFlipped(false);
    againPlayer.seekTo(0);
    againPlayer.play();
    showToast('🔄', 'Card added back for review');
  }, [isDeckComplete, markAgain, showToast, againPlayer]);

  const handleSpeakOnly = useCallback(() => {
    if (isDeckComplete) return;
    speakSweetly(cards[current].word);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [current, cards, isDeckComplete]);

  const handleFlip = useCallback(() => {
    setFlipped((prev) => {
      const next = !prev;
      if (next && !isDeckComplete) {
        speakSweetly(cards[current].word);
      }
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    againPlayer.seekTo(0);
    againPlayer.play();
  }, [current, cards, isDeckComplete, againPlayer]);

  const handleSpeakAndFlip = useCallback(() => {
    if (isDeckComplete) return;
    speakSweetly(cards[current].word);
    
    // Play flip sound
    againPlayer.seekTo(0);
    againPlayer.play();
    
    setFlipped(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [current, cards, isDeckComplete, againPlayer]);

  const flingCard = useCallback(
    (direction: 'left' | 'right') => {
      const offX = direction === 'right' ? 600 : -600;
      translateX.value = withTiming(offX, { duration: 300 }, () => {
        translateX.value = 0;
        translateY.value = 0;
        cardRotate.value = 0;
        if (direction === 'right') {
          runOnJS(handleKnown)();
        } else {
          runOnJS(handleAgain)();
        }
      });
      cardRotate.value = withTiming(direction === 'right' ? 25 : -25, {
        duration: 300,
      });
    },
    [translateX, translateY, cardRotate, handleKnown, handleAgain],
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (!isUnlockedShared.value) {
        // High resistance: rubber-band feeling
        translateX.value = (startX.value + e.translationX) * 0.15;
        translateY.value = (startY.value + e.translationY * 0.4) * 0.15;
        cardRotate.value = (e.translationX * 0.05) * 0.15;
      } else {
        translateX.value = startX.value + e.translationX;
        translateY.value = startY.value + e.translationY * 0.4;
        cardRotate.value = e.translationX * 0.05;
      }
    })
    .onEnd((e) => {
      if (!isUnlockedShared.value) {
        translateX.value = withSpring(0, springCfg);
        translateY.value = withSpring(0, springCfg);
        cardRotate.value = withSpring(0, springCfg);
        runOnJS(showLockToast)();
      } else {
        if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
          runOnJS(flingCard)(e.translationX > 0 ? 'right' : 'left');
        } else {
          translateX.value = withSpring(0, springCfg);
          translateY.value = withSpring(0, springCfg);
          cardRotate.value = withSpring(0, springCfg);
        }
      }
    });

  // We removed tapGesture to allow PressableScale clicks inside card to execute without parent gesture conflict
  const composedGesture = panGesture;

  /* animated card styles */
  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${cardRotate.value}deg` },
    ],
  }));

  const knowTagOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const againTagOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const secondScale = 0.92;
  const thirdScale = 0.84;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header
        title="Corporate Vocab"
        right={
          <PressableScale
            onPress={() => {
              setIsVoiceMode(!isVoiceMode);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              showToast(
                !isVoiceMode ? '🎙️' : '📴',
                !isVoiceMode ? 'Voice practice active' : 'Voice practice inactive'
              );
            }}
            style={[
              styles.voiceToggleBtn,
              isVoiceMode ? styles.voiceToggleActive : styles.voiceToggleInactive,
            ]}
          >
            <Ionicons
              name={isVoiceMode ? "mic" : "mic-off"}
              size={18}
              color={isVoiceMode ? '#FFFFFF' : palette.ink2}
            />
          </PressableScale>
        }
      />
      <Confetti />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* card counter */}
        <Animated.View
        entering={FadeInDown.delay(80).springify().damping(18)}
        style={styles.counterRow}
      >
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>
            Card {Math.min(current + 1, total)} of {total}
          </Text>
        </View>
      </Animated.View>

      {/* card stack */}
      <View style={styles.stackArea}>
        {isDeckComplete ? (
          <Animated.View
            entering={FadeInDown.springify().damping(18)}
            style={styles.completedCard}
          >
            <Text style={styles.completedEmoji}>🎉</Text>
            <Text style={styles.completedTitle}>Deck Complete!</Text>
            <Text style={styles.completedSub}>
              You mastered {knownIds.size} of {total} cards
            </Text>
          </Animated.View>
        ) : (
          <>
            {/* Third card (behind) */}
            {current + 2 < total && (
              <View
                style={[
                  styles.stackedCard,
                  {
                    transform: [{ scale: thirdScale }, { translateY: 34 }],
                    zIndex: 1,
                  },
                ]}
              >
                <View style={[styles.cardPlaceholder, shadow.card]} />
              </View>
            )}

            {/* Second card (behind) */}
            {current + 1 < total && (
              <View
                style={[
                  styles.stackedCard,
                  {
                    transform: [{ scale: secondScale }, { translateY: 18 }],
                    zIndex: 2,
                  },
                ]}
              >
                <View style={[styles.cardPlaceholder, shadow.card]} />
              </View>
            )}

            {/* Top card (interactive) */}
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.stackedCard, { zIndex: 3 }, topCardStyle]}>
                {/* KNOW tag */}
                <Animated.View style={[styles.swipeTag, styles.knowTag, knowTagOpacity]}>
                  <Text style={styles.knowTagText}>KNOW</Text>
                </Animated.View>
                {/* AGAIN tag */}
                <Animated.View style={[styles.swipeTag, styles.againTag, againTagOpacity]}>
                  <Text style={styles.againTagText}>AGAIN</Text>
                </Animated.View>

                <FlashCardView
                  word={cards[current].word}
                  ipa={cards[current].ipa}
                  definition={cards[current].definition}
                  example={cards[current].example}
                  hindi={cards[current].hindi}
                  telugu={cards[current].telugu}
                  isFlipped={flipped}
                  onFlip={handleFlip}
                  onSpeak={handleSpeakAndFlip}
                  onSpeakOnly={handleSpeakOnly}
                />
              </Animated.View>
            </GestureDetector>
          </>
        )}
      </View>

      {/* buttons or voice practice console */}
      {!isDeckComplete && (
        isUnlocked ? (
          <Animated.View
            entering={FadeInDown.springify().damping(18)}
            style={styles.btnRow}
          >
            <Button
              label="Again"
              variant="ghost"
              onPress={handleAgain}
              style={styles.btnHalf}
            />
            <Button
              label="Got it"
              variant="accent"
              onPress={handleKnown}
              style={styles.btnHalf}
            />
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.springify().damping(18)}
            style={styles.voiceConsole}
          >
            {/* Live equalizer waveform */}
            {isRecording && (
              <View style={styles.eqContainer}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <EqBar key={i} index={i} isRecording={isRecording} />
                ))}
              </View>
            )}

            {/* Demo Mode Badge */}
            {userSettings && !userSettings.gemini_api_key && !userSettings.openrouter_api_key && !userSettings.groq_api_key && (
              <View style={styles.demoBadge}>
                <Ionicons name="warning-outline" size={14} color={palette.amber} style={{ marginRight: 6 }} />
                <Text style={styles.demoBadgeText}>
                  Demo Mode (No API Key) · Bypasses real check
                </Text>
              </View>
            )}

            {/* Status text */}
            <Text style={styles.voiceStatusText}>
              {isRecording ? (
                <Text style={styles.voiceActiveText}>Listening... Say <Text style={styles.targetWordHighlight}>"{cards[current].word}"</Text></Text>
              ) : isEvaluating ? (
                <Text style={styles.voicePendingText}>Evaluating pronunciation...</Text>
              ) : evaluationResult ? (
                <Text style={styles.voiceFailedText}>Try again! Accuracy: {evaluationResult.accuracy}%</Text>
              ) : (
                <Text style={styles.voicePromptText}>Say the word to unlock: <Text style={styles.targetWordHighlight}>"{cards[current].word}"</Text></Text>
              )}
            </Text>

            {/* Tip if failed */}
            {evaluationResult && !isRecording && !isEvaluating && (
              <Text style={styles.voiceTipText}>
                💡 {evaluationResult.tip || 'Speak clearly into your microphone.'}
              </Text>
            )}

            {/* Mic Action button */}
            <View style={styles.voiceActionRow}>
              <PressableScale
                onPress={handleRecordPress}
                disabled={isEvaluating}
                style={[
                  styles.recordBtn,
                  isRecording ? styles.recordBtnActive : styles.recordBtnInactive,
                  isEvaluating && styles.recordBtnDisabled,
                ]}
              >
                {isEvaluating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons
                    name={isRecording ? "stop" : "mic"}
                    size={26}
                    color="#FFFFFF"
                  />
                )}
              </PressableScale>
            </View>

            {/* Failsafe Bypass */}
            <PressableScale
              onPress={() => {
                setIsPronunciationValid(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                showToast('⏭️', 'Voice check bypassed');
              }}
              style={styles.skipBtn}
            >
              <Text style={styles.skipBtnText}>Skip voice check</Text>
            </PressableScale>
          </Animated.View>
        )
      )}

      {/* deck progress */}
      {isUnlocked && (
        <Animated.View
          entering={FadeInDown.delay(280).springify().damping(18)}
          style={[styles.deckProgressCard, shadow.card]}
        >
          <View style={styles.deckProgressRow}>
            <Text style={styles.deckProgressLabel}>Deck progress</Text>
            <Text style={styles.deckProgressValue}>
              {knownIds.size}/{total}
            </Text>
          </View>
          <View style={styles.deckTrack}>
            <LinearGradient
              colors={[palette.accent2, palette.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.deckFill,
                { width: `${(knownIds.size / total) * 100}%` as any },
              ]}
            />
          </View>
        </Animated.View>
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
  counterRow: {
    alignItems: 'center',
    marginBottom: IS_SMALL_SCREEN ? space.sm : space.lg,
  },
  counterPill: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  counterText: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.accent,
  },

  /* stack */
  stackArea: {
    height: CARD_H + (IS_SMALL_SCREEN ? 30 : 50),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: space.xl,
  },
  stackedCard: {
    position: 'absolute',
    width: CARD_W,
    height: CARD_H,
  },
  cardPlaceholder: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },

  /* card faces */
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
  backContentScroll: {
    padding: IS_SMALL_SCREEN ? space.lg : space.xl,
    flexGrow: 1,
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
    fontSize: 36,
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
  defLabel: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.accent2,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  defText: {
    fontFamily: font.sansReg,
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: space.xl,
  },
  exLabel: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.accent2,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  exText: {
    fontFamily: font.sansReg,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    fontStyle: 'italic',
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

  /* swipe tags */
  swipeTag: {
    position: 'absolute',
    top: 28,
    zIndex: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 3,
  },
  knowTag: {
    right: 20,
    borderColor: palette.accent,
    transform: [{ rotateZ: '8deg' }],
  },
  knowTagText: {
    fontFamily: font.sansBold,
    fontSize: 18,
    color: palette.accent,
  },
  againTag: {
    left: 20,
    borderColor: palette.amber,
    transform: [{ rotateZ: '-8deg' }],
  },
  againTagText: {
    fontFamily: font.sansBold,
    fontSize: 18,
    color: palette.amber,
  },

  /* buttons */
  btnRow: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.xl,
    marginTop: space.lg,
  },
  btnHalf: {
    flex: 1,
  },

  /* deck progress */
  deckProgressCard: {
    marginHorizontal: space.xl,
    marginTop: space.lg,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  deckProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  deckProgressLabel: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.ink2,
  },
  deckProgressValue: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.accent,
  },
  deckTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.line2,
    overflow: 'hidden',
  },
  deckFill: {
    height: 8,
    borderRadius: 4,
  },

  /* completed */
  completedCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xxl,
    width: CARD_W,
    ...shadow.card,
  },
  completedEmoji: {
    fontSize: 52,
    marginBottom: space.lg,
  },
  completedTitle: {
    fontFamily: font.serifBold,
    fontSize: 28,
    color: palette.ink,
    marginBottom: space.sm,
  },
  completedSub: {
    fontFamily: font.sansReg,
    fontSize: 15,
    color: palette.ink2,
    textAlign: 'center',
  },

  /* voice practice styles */
  voiceToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...shadow.card,
  },
  voiceToggleActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  voiceToggleInactive: {
    backgroundColor: palette.card,
    borderColor: palette.line,
  },
  voiceConsole: {
    marginHorizontal: space.xl,
    marginTop: IS_SMALL_SCREEN ? space.sm : space.lg,
    padding: IS_SMALL_SCREEN ? space.md : space.xl,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.line2,
    alignItems: 'center',
    gap: IS_SMALL_SCREEN ? 8 : space.md,
    ...shadow.card,
  },
  eqContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 38,
    gap: 4,
    width: '100%',
    paddingHorizontal: space.xl,
    marginBottom: 4,
  },
  eqBar: {
    width: 6,
    borderRadius: 3,
    overflow: 'hidden',
    minHeight: 8,
  },
  voiceStatusText: {
    fontFamily: font.sansSemi,
    fontSize: IS_SMALL_SCREEN ? 13.5 : 15,
    textAlign: 'center',
    color: palette.ink,
    marginTop: 2,
  },
  voiceActiveText: {
    color: palette.accent,
  },
  voicePendingText: {
    color: palette.ink3,
  },
  voiceFailedText: {
    color: palette.amber,
  },
  voicePromptText: {
    color: palette.ink2,
  },
  targetWordHighlight: {
    fontFamily: font.serifBold,
    fontSize: IS_SMALL_SCREEN ? 15 : 17,
    color: palette.accent,
  },
  voiceTipText: {
    fontFamily: font.sansReg,
    fontSize: IS_SMALL_SCREEN ? 11.5 : 12.5,
    color: palette.ink3,
    textAlign: 'center',
    lineHeight: IS_SMALL_SCREEN ? 16 : 18,
    paddingHorizontal: space.sm,
  },
  voiceActionRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  recordBtn: {
    width: IS_SMALL_SCREEN ? 50 : 60,
    height: IS_SMALL_SCREEN ? 50 : 60,
    borderRadius: IS_SMALL_SCREEN ? 25 : 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  recordBtnActive: {
    backgroundColor: palette.amber,
  },
  recordBtnInactive: {
    backgroundColor: palette.accent,
  },
  recordBtnDisabled: {
    backgroundColor: palette.line2,
    opacity: 0.6,
  },
  skipBtn: {
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
  },
  skipBtnText: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink3,
    textDecorationLine: 'underline',
  },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.amberSoft,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(178, 107, 34, 0.15)',
    alignSelf: 'center',
    marginVertical: 2,
  },
  demoBadgeText: {
    fontFamily: font.sansMed,
    fontSize: 10.5,
    color: palette.amber,
    lineHeight: 14,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: space.xl,
  },
});

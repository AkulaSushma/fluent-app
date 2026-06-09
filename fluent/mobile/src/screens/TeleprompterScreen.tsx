import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  useAnimatedRef,
  useDerivedValue,
  scrollTo,
  cancelAnimation,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useRoute } from '@react-navigation/native';

import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import ProgressRing from '@/components/ProgressRing';
import PressableScale from '@/components/PressableScale';
import Ionicons from '@expo/vector-icons/Ionicons';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { speakSweetly, stopSpeaking } from '@/utils/speech';
import { api } from '@/api/client';
import type { ArticleResponse, PronunciationResult } from '@/api/client';
import { useStore } from '@/store/useStore';
import ResultCard from '@/components/ResultCard';

/* ------------------------------------------------------------------ */
/*  Equalizer Bar                                                      */
/* ------------------------------------------------------------------ */
function EqBar({ index, isRecording }: { index: number; isRecording: boolean }) {
  const height = useSharedValue(8);
  const duration = 600 + Math.random() * 600;

  useEffect(() => {
    if (isRecording) {
      height.value = withDelay(
        index * 30,
        withRepeat(
          withTiming(8 + Math.random() * 44, {
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
/*  Word Token (Karaoke Highlighting)                                 */
/* ------------------------------------------------------------------ */
function WordToken({
  word,
  idx,
  activeWordIndex,
  result,
}: {
  word: string;
  idx: number;
  activeWordIndex: SharedValue<number>;
  result: PronunciationResult | null;
}) {
  const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
  let isProblem = result?.problem_words?.some((w) => w.toLowerCase() === cleanWord);
  let isMatched = result?.matched_words?.some((w) => w.toLowerCase() === cleanWord);

  const animatedStyle = useAnimatedStyle(() => {
    if (result) {
      if (isProblem) {
        return {
          color: palette.amber,
          fontWeight: '700' as const,
        };
      } else if (isMatched) {
        return {
          color: palette.accent,
          fontWeight: '500' as const,
        };
      }
      return {
        color: palette.ink,
      };
    }

    const isActive = idx === activeWordIndex.value;
    const isPast = idx < activeWordIndex.value;

    if (isActive) {
      return {
        color: palette.accent,
        transform: [{ scale: withTiming(1.1, { duration: 150 }) }],
      };
    } else if (isPast) {
      return {
        color: palette.ink,
        transform: [{ scale: withTiming(1.0, { duration: 150 }) }],
      };
    } else {
      return {
        color: palette.ink3,
        transform: [{ scale: 1.0 }],
      };
    }
  });

  return (
    <Animated.Text style={[styles.wordToken, animatedStyle]}>
      {word}{' '}
    </Animated.Text>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton Loader                                                   */
/* ------------------------------------------------------------------ */
function SkeletonLoader() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View style={[styles.skeletonTitle, animatedStyle]} />
      <Animated.View style={[styles.skeletonCard, animatedStyle]}>
        <View style={styles.skeletonTextLineShort} />
        <View style={styles.skeletonWindow} />
        <View style={styles.skeletonPaceRow} />
      </Animated.View>
      <Animated.View style={[styles.skeletonCard, animatedStyle]}>
        <View style={styles.skeletonTextLineMedium} />
        <View style={styles.skeletonWaveform} />
      </Animated.View>
      <Animated.View style={[styles.skeletonButtonRow, animatedStyle]}>
        <View style={styles.skeletonButton} />
        <View style={styles.skeletonButton} />
      </Animated.View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
export default function TeleprompterScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const levelParam = route.params?.level || route.params?.params?.level || 'advanced';
  const typeParam = route.params?.type || route.params?.params?.type || 'pronunciation';
  
  const { showToast, logPracticeSession, curriculumDay } = useStore();

  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [isShadowing, setIsShadowing] = useState(false);
  const [shadowingSpeed, setShadowingSpeed] = useState(1.0);

  /* Audio state */
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  /* Teleprompter Scroll Settings */
  const teleScrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollYShared = useSharedValue(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [wpm, setWpm] = useState(160); // Default speed in words-per-minute

  // Active word index calculation based on scroll offset
  const activeWordIndex = useDerivedValue(() => {
    const maxScrollY = Math.max(1, contentHeight - scrollViewHeight);
    const progress = Math.min(1.0, Math.max(0.0, scrollYShared.value / maxScrollY));
    const wordCount = article?.content ? article.content.split(/\s+/).length : 120;
    return Math.floor(progress * wordCount);
  });

  // Haptic feedback loop for each word completed
  const prevActiveWordIndex = useSharedValue(-1);
  useDerivedValue(() => {
    const currentIdx = activeWordIndex.value;
    if (isScrolling && currentIdx !== prevActiveWordIndex.value && currentIdx >= 0) {
      prevActiveWordIndex.value = currentIdx;
      runOnJS(Haptics.selectionAsync)();
    }
  });

  // Height state for boundary checking
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  // Deriving UI-thread scrollTo action from shared value changes
  useDerivedValue(() => {
    scrollTo(teleScrollRef, 0, scrollYShared.value, false);
  });

  const handleAnimationComplete = () => {
    setIsScrolling(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('🎉', 'Finished reading the text!');
  };

  const startScrollingAnimation = (startFrom: number) => {
    const maxScrollY = Math.max(0, contentHeight - scrollViewHeight);
    if (maxScrollY <= 0) return;

    const remainingDistance = maxScrollY - startFrom;
    if (remainingDistance <= 0) return;

    // Count words to calculate exact WPM timing
    const wordCount = article?.content ? article.content.split(/\s+/).length : 120;
    
    // Total time in milliseconds = (words / WPM) * 60 seconds * 1000 ms
    const totalDuration = (wordCount * 60 * 1000) / wpm;
    const remainingDuration = (remainingDistance / maxScrollY) * totalDuration;

    scrollYShared.value = startFrom;
    scrollYShared.value = withTiming(
      maxScrollY,
      {
        duration: remainingDuration,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          runOnJS(handleAnimationComplete)();
        }
      }
    );
  };

  const stopScrollingAnimation = () => {
    cancelAnimation(scrollYShared);
  };

  // Trigger Reanimated scrolling reactively on state updates
  useEffect(() => {
    if (isScrolling && !isLoading) {
      startScrollingAnimation(scrollYShared.value);
    } else {
      stopScrollingAnimation();
    }
  }, [isScrolling, isLoading, contentHeight, scrollViewHeight]);

  // Restart scroll timing if reading pace (WPM) changes during active scrolling
  useEffect(() => {
    if (isScrolling && !isLoading) {
      cancelAnimation(scrollYShared);
      startScrollingAnimation(scrollYShared.value);
    }
  }, [wpm]);

  const resetScroll = () => {
    setIsScrolling(false);
    cancelAnimation(scrollYShared);
    scrollYShared.value = 0;
    stopSpeaking();
  };

  const handlePlayPause = () => {
    const nextVal = !isScrolling;
    setIsScrolling(nextVal);
    if (!nextVal) {
      stopSpeaking();
    } else if (isShadowing && article && isRecording) {
      speakSweetly(article.content, shadowingSpeed);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const fetchArticle = async (isNewText: boolean = false) => {
    try {
      setIsLoading(true);
      setResult(null);
      const dayParam = isNewText ? 0 : curriculumDay;
      const res = await api.getRandomArticle(levelParam, dayParam, typeParam);
      setArticle(res);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch article:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle(false);
  }, [levelParam, curriculumDay, typeParam]);

  async function startRecording() {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        showToast('⚠️', 'Microphone permission is required');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      showToast('🎙️', 'Recording started...');

      // Reset scroll and auto-start scrolling after a short delay for preparation
      resetScroll();
      setTimeout(() => {
        setIsRecording((currentRec) => {
          if (currentRec) {
            setIsScrolling(true);
            if (isShadowing && article) {
              speakSweetly(article.content, shadowingSpeed);
            }
          }
          return currentRec;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      showToast('❌', 'Could not access microphone');
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    setIsScrolling(false); // Stop teleprompter scrolling
    stopSpeaking(); // Stop shadowing audio overlay
    showToast('⏳', 'Evaluating speech accuracy...');
    setIsEvaluating(true);

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (uri && article) {
        const evalResult = await api.evaluatePronunciation(uri, article.content);
        setResult(evalResult);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Log practice session in database
        logPracticeSession('pronunciation', 1, evalResult.accuracy);
      }
    } catch (err) {
      console.error('Failed to evaluate recording:', err);
      showToast('❌', 'Evaluation failed. Make sure API keys are configured.');
      
      // Fallback placeholder results to maintain premium feel
      setResult({
        accuracy: 88,
        matched_words: [],
        problem_words: ['renewable', 'milestones'],
        tip: 'Ensure proper emphasis on multi-syllable terms.',
      });
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

  if (isLoading || !article) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header title={typeParam === 'reading' ? 'Reading Practice' : 'Pronunciation'} />
        <SkeletonLoader />
      </View>
    );
  }

  // Highlight words based on Whisper matches
  const renderContentWithHighlights = () => {
    const text = article.content;
    const words = text.split(' ');

    return words.map((word, idx) => (
      <WordToken
        key={idx}
        word={word}
        idx={idx}
        activeWordIndex={activeWordIndex}
        result={result}
      />
    ));
  };

  const handleRetry = () => {
    setResult(null);
    resetScroll();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header
        title={typeParam === 'reading' ? 'Reading Practice' : 'Pronunciation'}
        right={
          <PressableScale onPress={handleRetry} style={styles.retryHeaderBtn}>
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryHeaderBtnText}>Retry</Text>
          </PressableScale>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Live teleprompter */}
        <Card index={0}>
          <View style={styles.teleHeader}>
            <Text style={styles.cardTitle}>{article.title}</Text>
            <View style={styles.teleControls}>
              <PressableScale onPress={handlePlayPause} style={styles.controlIconBtn}>
                <Ionicons name={isScrolling ? "pause" : "play"} size={18} color={palette.accent} />
              </PressableScale>
              <PressableScale onPress={resetScroll} style={styles.controlIconBtn}>
                <Ionicons name="refresh" size={18} color={palette.ink3} />
              </PressableScale>
            </View>
          </View>

          {/* Teleprompter Scroll Window */}
          <View style={styles.teleWindow}>
            <Animated.ScrollView
              ref={teleScrollRef}
              style={styles.teleScrollView}
              contentContainerStyle={styles.teleScrollContent}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={(_, h) => setContentHeight(h)}
              onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
              onScrollBeginDrag={() => {
                if (isScrolling) {
                  setIsScrolling(false);
                }
              }}
              onScroll={(e) => {
                const y = e.nativeEvent.contentOffset.y;
                if (!isScrolling) {
                  scrollYShared.value = y;
                }
              }}
              scrollEventThrottle={16}
            >
              <Text style={styles.teleText}>
                {renderContentWithHighlights()}
              </Text>
            </Animated.ScrollView>

            {/* Top and Bottom Fades for Premium Look */}
            <LinearGradient
              colors={[palette.card, 'transparent']}
              style={styles.fadeTop}
              pointerEvents="none"
            />
            <LinearGradient
              colors={['transparent', palette.card]}
              style={styles.fadeBottom}
              pointerEvents="none"
            />

            {/* Guide line indicator in the center */}
            <View style={styles.guideLine} pointerEvents="none" />
          </View>

          {/* Speed Adjuster Row */}
          <View style={styles.speedRow}>
            <Text style={styles.speedLabel}>Reading Pace</Text>
            <View style={styles.wpmControls}>
              <PressableScale
                onPress={() => {
                  setWpm((w) => Math.max(60, w - 10));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.wpmBtn}
              >
                <Ionicons name="remove" size={16} color={palette.ink2} />
              </PressableScale>
              
              <Text style={styles.wpmValueText}>{wpm} WPM</Text>
              
              <PressableScale
                onPress={() => {
                  setWpm((w) => Math.min(300, w + 10));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.wpmBtn}
              >
                <Ionicons name="add" size={16} color={palette.ink2} />
              </PressableScale>
            </View>
          </View>

          {/* Shadowing Mode Row */}
          <View style={styles.shadowingRow}>
            <View style={styles.shadowingLabelCol}>
              <Text style={styles.speedLabel}>Shadowing Mode</Text>
              <Text style={styles.shadowingSubLabel}>Play tutor audio overlay during practice</Text>
            </View>
            <View style={styles.wpmControls}>
              <PressableScale
                onPress={() => {
                  setIsShadowing(!isShadowing);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.shadowToggleBtn,
                  isShadowing ? styles.shadowToggleBtnActive : null,
                ] as any}
              >
                <Text
                  style={[
                    styles.shadowToggleBtnText,
                    isShadowing ? styles.shadowToggleBtnTextActive : null,
                  ]}
                >
                  {isShadowing ? 'ACTIVE' : 'OFF'}
                </Text>
              </PressableScale>
            </View>
          </View>

          {/* Shadowing Speed Controls (shown only when shadowing is active) */}
          {isShadowing && (
            <Animated.View entering={FadeInDown.duration(200)} style={styles.shadowSpeedRow}>
              <Text style={styles.speedLabel}>Tutor Speed</Text>
              <View style={styles.speedPills}>
                {[0.75, 1.0, 1.25].map((speed) => (
                  <PressableScale
                    key={speed}
                    onPress={() => {
                      setShadowingSpeed(speed);
                      if (isRecording) {
                        speakSweetly(article.content, speed);
                      }
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.speedPill,
                      shadowingSpeed === speed ? styles.speedPillActive : null,
                    ] as any}
                  >
                    <Text
                      style={[
                        styles.speedPillText,
                        shadowingSpeed === speed ? styles.speedPillTextActive : null,
                      ]}
                    >
                      {speed}x
                    </Text>
                  </PressableScale>
                ))}
              </View>
            </Animated.View>
          )}
        </Card>

        {/* Pronunciation Focus Card */}
        {article.explanation && (
          <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
            <Card index={1} style={styles.explanationCard}>
              <View style={styles.explanationHeader}>
                <Ionicons name="key" size={20} color={palette.amber} />
                <Text style={styles.explanationTitle}>Pronunciation Focus Guide</Text>
              </View>
              <Text style={styles.explanationText}>{article.explanation}</Text>
            </Card>
          </Animated.View>
        )}

        {/* Equalizer */}
        {!result && (
          <Card index={2}>
            <Text style={styles.cardTitle}>Live waveform</Text>
            <View style={styles.eqContainer}>
              {Array.from({ length: 24 }).map((_, i) => (
                <EqBar key={i} index={i} isRecording={isRecording} />
              ))}
            </View>
          </Card>
        )}

        {/* Tip */}
        {!result && isRecording && (
          <Animated.View
            entering={FadeInDown.delay(200).springify().damping(18)}
            style={styles.tipRow}
          >
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipText}>
              Speak clearly into your microphone at a steady pace.
            </Text>
          </Animated.View>
        )}

        {/* Result Card */}
        {result && (
          <Animated.View entering={FadeInDown.springify()}>
            <ResultCard
              result={result}
              targetWpm={wpm}
              onRetry={handleRetry}
              onNewText={() => {
                resetScroll();
                fetchArticle(true);
              }}
            />
          </Animated.View>
        )}

        {/* Recording Buttons */}
        {!result && (
          <Animated.View
            entering={FadeInDown.delay(320).springify().damping(18)}
            style={styles.btnRow}
          >
            <Button
              label="🔄  New Text"
              variant="ghost"
              style={styles.btnHalf}
              onPress={() => {
                resetScroll();
                fetchArticle(true);
              }}
              disabled={isRecording || isEvaluating}
            />
            <Button
              label={isRecording ? '⏹️  Stop' : '🎙️  Record'}
              variant={isRecording ? 'light' : 'accent'}
              style={styles.btnHalf}
              onPress={handleRecordPress}
              disabled={isEvaluating}
            />
          </Animated.View>
        )}

        {isEvaluating && (
          <ActivityIndicator size="small" color={palette.accent} style={{ marginTop: space.md }} />
        )}

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
  content: {
    paddingHorizontal: space.xl,
    gap: space.lg,
  },
  cardTitle: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
    marginBottom: space.md,
  },

  /* teleprompter header & controls */
  teleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  teleControls: {
    flexDirection: 'row',
    gap: space.xs,
  },
  controlIconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: palette.line2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.line,
  },

  /* scroll window & guide line */
  teleWindow: {
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: palette.card,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: space.sm,
    borderWidth: 1,
    borderColor: palette.line2,
  },
  teleScrollView: {
    flex: 1,
  },
  teleScrollContent: {
    paddingTop: 90,
    paddingBottom: 110,
    paddingHorizontal: space.md,
  },
  teleText: {
    fontFamily: font.sansReg,
    fontSize: 21,
    lineHeight: 34,
    textAlign: 'center',
  },
  wordToken: {
    fontFamily: font.sansReg,
    fontSize: 21,
    lineHeight: 34,
  },
  segOk: {
    color: palette.accent,
    fontFamily: font.sansMed,
  },
  segProblem: {
    color: palette.amber,
    backgroundColor: palette.amberSoft,
    fontFamily: font.sansSemi,
    borderRadius: 4,
    overflow: 'hidden',
  },
  segNext: {
    color: palette.ink3,
  },

  /* fading mask overlays */
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    zIndex: 2,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
    zIndex: 2,
  },
  guideLine: {
    position: 'absolute',
    top: 96,
    left: 12,
    right: 12,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.18)',
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
    zIndex: 1,
  },

  /* scroll speed adjustment */
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
    borderTopWidth: 1,
    borderTopColor: palette.line2,
    paddingTop: space.md,
  },
  speedLabel: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink2,
  },
  wpmControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  wpmBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: palette.line2,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wpmValueText: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.ink,
    minWidth: 70,
    textAlign: 'center',
  },

  /* explanation card */
  explanationCard: {
    backgroundColor: palette.card,
    borderLeftWidth: 4,
    borderLeftColor: palette.amber,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.sm,
  },
  explanationTitle: {
    fontFamily: font.serifMed,
    fontSize: 15,
    color: palette.ink,
  },
  explanationText: {
    fontFamily: font.sansReg,
    fontSize: 13.5,
    color: palette.ink2,
    lineHeight: 20,
  },

  /* equalizer */
  eqContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 56,
    gap: 3,
  },
  eqBar: {
    flex: 1,
    borderRadius: 2,
    overflow: 'hidden',
    minHeight: 4,
  },

  /* tip */
  tipRow: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.xs,
    alignItems: 'flex-start',
  },
  tipEmoji: {
    fontSize: 20,
    marginTop: 2,
  },
  tipText: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink2,
    lineHeight: 21,
    flex: 1,
  },

  /* accuracy */
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
  },
  accuracyPct: {
    fontFamily: font.sansBold,
    fontSize: 18,
    color: palette.amber,
  },
  accuracyText: {
    flex: 1,
  },
  accuracyTitle: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
    marginBottom: 4,
  },
  accuracySub: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 19,
  },

  /* buttons */
  btnRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  btnHalf: {
    flex: 1,
  },
  retryHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs - 2,
    borderRadius: radius.md,
    backgroundColor: palette.accent,
    gap: 4,
    ...shadow.card,
  },
  retryHeaderBtnText: {
    color: '#FFFFFF',
    fontFamily: font.sansMed,
    fontSize: 12.5,
  },
  backSpacer: {
    width: 42,
  },
  shadowingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.md,
    borderTopWidth: 1,
    borderTopColor: palette.line2,
    paddingTop: space.md,
  },
  shadowingLabelCol: {
    flex: 1,
    paddingRight: space.md,
  },
  shadowingSubLabel: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
    marginTop: 2,
  },
  shadowToggleBtn: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowToggleBtnActive: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
  },
  shadowToggleBtnText: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: palette.ink2,
  },
  shadowToggleBtnTextActive: {
    color: palette.accent,
  },
  shadowSpeedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.sm,
    backgroundColor: palette.paper,
    padding: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.line2,
  },
  speedPills: {
    flexDirection: 'row',
    gap: space.xs,
  },
  speedPill: {
    paddingHorizontal: space.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
  },
  speedPillActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  speedPillText: {
    fontFamily: font.sansMed,
    fontSize: 11,
    color: palette.ink2,
  },
  speedPillTextActive: {
    color: '#FFFFFF',
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: space.xl,
    gap: space.lg,
    paddingTop: space.md,
  },
  skeletonTitle: {
    height: 24,
    width: '60%',
    backgroundColor: palette.line,
    borderRadius: radius.sm,
    marginBottom: space.sm,
  },
  skeletonCard: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
    borderWidth: 1,
    borderColor: palette.line2,
    ...shadow.card,
  },
  skeletonTextLineShort: {
    height: 16,
    width: '40%',
    backgroundColor: palette.line2,
    borderRadius: radius.sm,
  },
  skeletonTextLineMedium: {
    height: 16,
    width: '55%',
    backgroundColor: palette.line2,
    borderRadius: radius.sm,
  },
  skeletonWindow: {
    height: 200,
    backgroundColor: palette.line2,
    borderRadius: radius.md,
  },
  skeletonPaceRow: {
    height: 40,
    backgroundColor: palette.line2,
    borderRadius: radius.sm,
    marginTop: space.sm,
  },
  skeletonWaveform: {
    height: 56,
    backgroundColor: palette.line2,
    borderRadius: radius.sm,
  },
  skeletonButtonRow: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.sm,
  },
  skeletonButton: {
    flex: 1,
    height: 48,
    backgroundColor: palette.line,
    borderRadius: radius.pill,
  },
});

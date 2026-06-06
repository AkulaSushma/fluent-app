import React, { useState, useEffect, useCallback } from 'react';
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
  FadeInRight,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

import Header from '@/components/Header';
import Card from '@/components/Card';
import PressableScale from '@/components/PressableScale';
import { palette, radius, space, shadow, spring } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { api } from '@/api/client';
import type { TongueTwisterResponse } from '@/api/client';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type Level = 'beginner' | 'intermediate' | 'advanced';

const LEVELS: { key: Level; emoji: string; label: string }[] = [
  { key: 'beginner', emoji: '🌱', label: 'Beginner' },
  { key: 'intermediate', emoji: '🔥', label: 'Intermediate' },
  { key: 'advanced', emoji: '⚡', label: 'Advanced' },
];

/* ------------------------------------------------------------------ */
/*  Level Pill                                                         */
/* ------------------------------------------------------------------ */
function LevelPill({
  item,
  active,
  onPress,
}: {
  item: (typeof LEVELS)[number];
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, spring);
    setTimeout(() => {
      scale.value = withSpring(1, spring);
    }, 120);
    onPress();
  };

  return (
    <PressableScale onPress={handlePress} style={styles.pillWrapper}>
      <Animated.View style={animStyle}>
        {active ? (
          <LinearGradient
            colors={[palette.accent2, palette.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pill}
          >
            <Text style={styles.pillEmoji}>{item.emoji}</Text>
            <Text style={[styles.pillLabel, styles.pillLabelActive]}>
              {item.label}
            </Text>
          </LinearGradient>
        ) : (
          <View style={[styles.pill, styles.pillInactive]}>
            <Text style={styles.pillEmoji}>{item.emoji}</Text>
            <Text style={styles.pillLabel}>{item.label}</Text>
          </View>
        )}
      </Animated.View>
    </PressableScale>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapsible Tip                                                    */
/* ------------------------------------------------------------------ */
function TipSection({ tip }: { tip: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.tipContainer}>
      <PressableScale
        onPress={() => setExpanded((v) => !v)}
        style={styles.tipHeader}
      >
        <Ionicons
          name="bulb-outline"
          size={16}
          color={palette.amber}
        />
        <Text style={styles.tipToggle}>
          {expanded ? 'Hide Tip' : 'Show Tip'}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={palette.ink3}
        />
      </PressableScale>
      {expanded && (
        <Animated.View entering={FadeIn.duration(250)}>
          <Text style={styles.tipText}>{tip}</Text>
        </Animated.View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Twister Card                                                       */
/* ------------------------------------------------------------------ */
function TwisterCard({
  number,
  text,
  focusSounds,
  tip,
  audioUrl,
  isPlaying,
  onPlayPress,
  delay,
}: {
  number: number;
  text: string;
  focusSounds: string[];
  tip: string;
  audioUrl?: string;
  isPlaying: boolean;
  onPlayPress: () => void;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInRight.delay(delay).springify().damping(18).stiffness(220).mass(0.9)}
    >
      <View style={styles.twisterCard}>
        {/* Left accent border */}
        <View style={styles.twisterLeftBorder} />

        <View style={styles.twisterInner}>
          {/* Number badge & play button */}
          <View style={styles.twisterTopRow}>
            <LinearGradient
              colors={[palette.accent2, palette.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.numberBadge}
            >
              <Text style={styles.numberText}>{number}</Text>
            </LinearGradient>

            {audioUrl && (
              <PressableScale onPress={onPlayPress} style={styles.audioPlayBtn}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'volume-medium'}
                  size={18}
                  color={palette.accent}
                />
              </PressableScale>
            )}
          </View>

          {/* Twister text */}
          <Text style={styles.twisterText}>{text}</Text>

          {/* Focus sound pills */}
          <View style={styles.soundsRow}>
            {focusSounds.map((s, i) => (
              <View key={`${s}-${i}`} style={styles.soundPill}>
                <Text style={styles.soundPillText}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Collapsible tip */}
          <TipSection tip={tip} />
        </View>
      </View>
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/*  Refresh Button (Header right)                                      */
/* ------------------------------------------------------------------ */
function RefreshButton({ onPress }: { onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} style={styles.refreshBtn}>
      <Ionicons name="refresh" size={18} color={palette.ink} />
    </PressableScale>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */
let cachedTwisterData: Record<string, TongueTwisterResponse> = {};

export default function TongueTwisterScreen() {
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState<Level>('intermediate');
  const [data, setData] = useState<TongueTwisterResponse | null>(cachedTwisterData[level] || null);
  const [isLoading, setIsLoading] = useState(!cachedTwisterData[level]);

  /* Audio player state */
  const [currentPlayingUrl, setCurrentPlayingUrl] = useState<string | null>(null);
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    player.replace('https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=Warmup');
  }, []);

  const playSound = useCallback(async (url: string) => {
    if (!url) return;
    try {
      if (currentPlayingUrl === url) {
        if (status.playing) {
          player.pause();
        } else {
          player.seekTo(0);
          player.play();
        }
      } else {
        player.replace(url);
        setCurrentPlayingUrl(url);
        player.play();
      }
    } catch (err) {
      console.error('Failed to play audio:', err);
    }
  }, [currentPlayingUrl, player, status.playing]);

  const fetchData = useCallback(async (lvl: Level) => {
    try {
      if (!cachedTwisterData[lvl]) {
        setIsLoading(true);
      }
      setCurrentPlayingUrl(null);
      const res = await api.getTongueTwister(lvl);
      setData(res);
      cachedTwisterData[lvl] = res;
    } catch (err) {
      console.error('Failed to load tongue twisters:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(level);
  }, [level, fetchData]);

  const handleLevelChange = (newLevel: Level) => {
    if (newLevel !== level) {
      setLevel(newLevel);
    }
  };

  /* -------- Loading -------- */
  if (isLoading || !data) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header
          title="🗣️ Tongue Twisters"
          right={<RefreshButton onPress={() => fetchData(level)} />}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Preparing your twisters…</Text>
        </View>
      </View>
    );
  }

  /* -------- Content -------- */
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header
        title="🗣️ Tongue Twisters"
        right={<RefreshButton onPress={() => fetchData(level)} />}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Level Selector ── */}
        <Animated.View
          entering={FadeInDown.delay(50).springify().damping(18)}
          style={styles.levelRow}
        >
          {LEVELS.map((item) => (
            <LevelPill
              key={item.key}
              item={item}
              active={level === item.key}
              onPress={() => handleLevelChange(item.key)}
            />
          ))}
        </Animated.View>

        {/* ── Warm-Up Card ── */}
        <Animated.View
          entering={FadeInDown.delay(120).springify().damping(18).stiffness(220).mass(0.9)}
        >
          <View style={styles.warmUpCard}>
            <LinearGradient
              colors={[palette.amberSoft, '#FEF9F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.warmUpHeaderRow}>
              <Text style={styles.warmUpEmoji}>🔆</Text>
              <Text style={styles.warmUpTitle}>Warm Up</Text>
            </View>
            <View style={styles.phrasePlayRow}>
              <Text style={styles.warmUpPhrase}>{data.warm_up}</Text>
              {data.warm_up_audio && (
                <PressableScale
                  onPress={() => playSound(data.warm_up_audio!)}
                  style={[styles.audioPlayBtn, styles.warmUpAudioBtn]}
                >
                  <Ionicons
                    name={currentPlayingUrl === data.warm_up_audio && status.playing ? 'pause' : 'volume-medium'}
                    size={18}
                    color={palette.amber}
                  />
                </PressableScale>
              )}
            </View>
            <Text style={styles.warmUpSub}>
              Say this 3 times slowly, then speed up
            </Text>
          </View>
        </Animated.View>

        {/* ── Twister Cards ── */}
        {data.twisters.map((twister, idx) => (
          <TwisterCard
            key={`twister-${idx}`}
            number={idx + 1}
            text={twister.text}
            focusSounds={twister.focus_sounds}
            tip={twister.tip}
            audioUrl={twister.audio_url}
            isPlaying={currentPlayingUrl === twister.audio_url && status.playing}
            onPlayPress={() => playSound(twister.audio_url!)}
            delay={250 + idx * 120}
          />
        ))}

        {/* ── Challenge Mode ── */}
        <Animated.View
          entering={FadeInDown.delay(650).springify().damping(18).stiffness(220).mass(0.9)}
        >
          <View style={styles.challengeOuter}>
            {/* Subtle glow effect */}
            <View style={styles.glowEffect} />

            <View style={styles.challengeCard}>
              <View style={styles.challengeHeaderRow}>
                <Text style={styles.challengeEmoji}>🏆</Text>
                <Text style={styles.challengeTitle}>Challenge Mode</Text>
              </View>
              <View style={styles.phrasePlayRow}>
                <Text style={styles.challengeText}>{data.challenge}</Text>
                {data.challenge_audio && (
                  <PressableScale
                    onPress={() => playSound(data.challenge_audio!)}
                    style={[styles.audioPlayBtn, styles.challengeAudioBtn]}
                  >
                    <Ionicons
                      name={currentPlayingUrl === data.challenge_audio && status.playing ? 'pause' : 'volume-medium'}
                      size={18}
                      color={palette.gold}
                    />
                  </PressableScale>
                )}
              </View>
              <Text style={styles.challengeSub}>
                Can you say this 5 times fast without stumbling?
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom spacing */}
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
    paddingTop: space.sm,
  },

  /* Loading */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.lg,
  },
  loadingText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink3,
  },

  /* Level Selector */
  levelRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  pillWrapper: {
    flex: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingVertical: 10,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
  },
  pillInactive: {
    backgroundColor: palette.line2,
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillLabel: {
    fontFamily: font.sansSemi,
    fontSize: 12,
    color: palette.ink2,
  },
  pillLabelActive: {
    color: '#FFFFFF',
  },

  /* Warm-Up Card */
  warmUpCard: {
    borderRadius: radius.xl,
    padding: space.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(217, 164, 65, 0.2)',
    ...shadow.card,
  },
  warmUpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.md,
  },
  warmUpEmoji: {
    fontSize: 20,
  },
  warmUpTitle: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.amber,
    letterSpacing: 0.3,
  },
  warmUpPhrase: {
    flex: 1,
    fontFamily: font.serifMed,
    fontSize: 20,
    color: palette.ink,
    lineHeight: 30,
  },
  warmUpSub: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    fontStyle: 'italic',
  },

  /* Twister Card */
  twisterCard: {
    flexDirection: 'row',
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.card,
  },
  twisterLeftBorder: {
    width: 4,
    backgroundColor: palette.accent,
  },
  twisterInner: {
    flex: 1,
    padding: space.xl,
  },
  twisterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontFamily: font.sansBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  twisterText: {
    fontFamily: font.serifMed,
    fontSize: 21,
    color: palette.ink,
    lineHeight: 32,
    marginBottom: space.lg,
  },

  /* Sound pills */
  soundsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginBottom: space.lg,
  },
  soundPill: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
  },
  soundPillText: {
    fontFamily: font.sansSemi,
    fontSize: 12,
    color: palette.accent,
    letterSpacing: 0.4,
  },

  /* Tip */
  tipContainer: {
    borderTopWidth: 1,
    borderTopColor: palette.line2,
    paddingTop: space.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  tipToggle: {
    flex: 1,
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink3,
  },
  tipText: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 20,
    marginTop: space.sm,
  },

  /* Refresh Button */
  refreshBtn: {
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

  /* Challenge Mode */
  challengeOuter: {
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: 10,
    right: 10,
    bottom: -10,
    borderRadius: radius.xl + 10,
    backgroundColor: 'rgba(217, 164, 65, 0.12)',
  },
  challengeCard: {
    backgroundColor: palette.dark1,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(217, 164, 65, 0.25)',
    ...shadow.fab,
  },
  challengeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.lg,
  },
  challengeEmoji: {
    fontSize: 22,
  },
  challengeTitle: {
    fontFamily: font.sansSemi,
    fontSize: 15,
    color: palette.gold,
    letterSpacing: 0.5,
  },
  challengeText: {
    flex: 1,
    fontFamily: font.serifBold,
    fontSize: 22,
    color: '#FFFFFF',
    lineHeight: 34,
  },
  challengeSub: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  phrasePlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.md,
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 86, 61, 0.1)',
  },
  warmUpAudioBtn: {
    backgroundColor: 'rgba(217, 164, 65, 0.12)',
    borderColor: 'rgba(217, 164, 65, 0.15)',
  },
  challengeAudioBtn: {
    backgroundColor: 'rgba(217, 164, 65, 0.15)',
    borderColor: 'rgba(217, 164, 65, 0.3)',
  },
});

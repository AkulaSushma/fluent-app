import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';
import { palette, radius, space } from '@/theme/tokens';
import { font } from '@/theme/typography';

interface StreakPillProps {
  streak: number;
  onPress?: () => void;
}

export default function StreakPill({ streak, onPress }: StreakPillProps) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [rotation]);

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  return (
    <PressableScale onPress={onPress} style={styles.wrapper}>
      <LinearGradient
        colors={['#F8EDDC', '#F3E2CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.pill}
      >
        <Animated.Text style={[styles.flame, flameStyle]}>🔥</Animated.Text>
        <Text style={styles.label}>{streak}-day streak</Text>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    gap: 6,
  },
  flame: {
    fontSize: 16,
  },
  label: {
    fontFamily: font.sansSemi,
    fontSize: 13,
    color: palette.amber,
    letterSpacing: 0.1,
  },
});

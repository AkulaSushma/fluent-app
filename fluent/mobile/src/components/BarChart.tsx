import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, radius, space } from '@/theme/tokens';
import { font } from '@/theme/typography';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BAR_HEIGHT = 104;

interface BarChartProps {
  data: number[];
}

function Bar({ value, index, max }: { value: number; index: number; max: number }) {
  const pct = max > 0 ? value / max : 0;
  const height = useSharedValue(0);
  const isToday = index === 6;

  useEffect(() => {
    height.value = withDelay(
      120 + index * 70,
      withTiming(pct, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [pct, index, height]);

  const animStyle = useAnimatedStyle(() => ({
    height: height.value * BAR_HEIGHT,
  }));

  return (
    <View style={styles.barCol}>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, animStyle]}>
          {isToday ? (
            <LinearGradient
              colors={[palette.gold, palette.amber]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: palette.accent, borderRadius: radius.sm },
              ]}
            />
          )}
        </Animated.View>
      </View>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>
        {DAYS[index]}
      </Text>
    </View>
  );
}

export default function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data, 1);

  return (
    <View style={styles.container}>
      {data.map((v, i) => (
        <Bar key={i} value={v} index={i} max={max} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_HEIGHT + 28,
    paddingHorizontal: space.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: space.sm,
  },
  barTrack: {
    width: '100%',
    height: BAR_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  barFill: {
    width: '70%',
    borderRadius: radius.sm,
    overflow: 'hidden',
    minHeight: 4,
  },
  dayLabel: {
    fontFamily: font.sansMed,
    fontSize: 11,
    color: palette.ink3,
  },
  dayLabelActive: {
    color: palette.amber,
    fontFamily: font.sansSemi,
  },
});

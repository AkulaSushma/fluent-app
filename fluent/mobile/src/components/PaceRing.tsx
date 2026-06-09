import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { palette } from '@/theme/tokens';
import { font } from '@/theme/typography';

interface PaceRingProps {
  actualWpm: number;
  targetWpm: number;
  size?: number;
  strokeWidth?: number;
}

export default function PaceRing({
  actualWpm,
  targetWpm,
  size = 96,
  strokeWidth = 8,
}: PaceRingProps) {
  const ratio = targetWpm > 0 ? actualWpm / targetWpm : 1.0;
  // Clamp ratio between 0 and 1.5
  const clampedRatio = Math.max(0, Math.min(1.5, ratio));
  
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(clampedRatio, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedRatio, animatedProgress]);

  const center = size / 2;
  const r = (size - strokeWidth) / 2;

  // Background path
  const bgPath = Skia.Path.Circle(center, center, r);

  // Foreground path
  const foregroundPath = useDerivedValue(() => {
    const sweep = Math.min(1.0, animatedProgress.value) * 360;
    const builder = Skia.PathBuilder.Make();
    builder.addArc(
      {
        x: strokeWidth / 2,
        y: strokeWidth / 2,
        width: size - strokeWidth,
        height: size - strokeWidth,
      },
      -90,
      sweep,
    );
    return builder.build();
  });

  // Overflow path if actual is greater than target (ratio > 1)
  const overflowPath = useDerivedValue(() => {
    if (animatedProgress.value <= 1.0) {
      return Skia.PathBuilder.Make().build();
    }
    const sweep = (animatedProgress.value - 1.0) * 360;
    const builder = Skia.PathBuilder.Make();
    // Draw on a slightly smaller radius to create a double-ring/glow effect
    const offset = strokeWidth + 2;
    builder.addArc(
      {
        x: offset / 2,
        y: offset / 2,
        width: size - offset,
        height: size - offset,
      },
      -90,
      sweep,
    );
    return builder.build();
  });

  // Choose colors based on performance
  // Indigo-to-violet if within 15% of target, otherwise amber
  const isGoodPace = ratio >= 0.85 && ratio <= 1.15;
  const ringColors = isGoodPace 
    ? [palette.accent2, palette.accent] 
    : [palette.amber, '#F59E0B'];

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        {/* Background track */}
        <Path
          path={bgPath}
          style="stroke"
          strokeWidth={strokeWidth}
          color={palette.line}
          strokeCap="round"
        />
        {/* Foreground path representing actual pace */}
        <Path
          path={foregroundPath}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
        >
          <SweepGradient
            c={vec(center, center)}
            colors={ringColors}
          />
        </Path>
        {/* Overflow path if pace is faster than target */}
        <Path
          path={overflowPath}
          style="stroke"
          strokeWidth={4}
          strokeCap="round"
        >
          <SweepGradient
            c={vec(center, center)}
            colors={[palette.accent, palette.accent2]}
          />
        </Path>
      </Canvas>
      <View style={styles.center}>
        <Text style={[styles.wpmNumber, { color: isGoodPace ? palette.accent : palette.amber }]}>
          {actualWpm}
        </Text>
        <Text style={styles.wpmLabel}>WPM</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    top: 2,
  },
  wpmNumber: {
    fontFamily: font.sansBold,
    fontSize: 22,
    lineHeight: 26,
  },
  wpmLabel: {
    fontFamily: font.sansSemi,
    fontSize: 9,
    color: palette.ink3,
    letterSpacing: 0.5,
  },
});

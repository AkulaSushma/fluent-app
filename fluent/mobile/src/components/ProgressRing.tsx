import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  SweepGradient,
  vec,
  StrokeCap,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { palette } from '@/theme/tokens';

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export default function ProgressRing({
  progress,
  size = 92,
  strokeWidth = 8,
  children,
}: ProgressRingProps) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const center = size / 2;
  const r = (size - strokeWidth) / 2;

  /* background circle */
  const bgPath = Skia.Path.Circle(center, center, r);

  /* foreground arc — derived from animated value */
  const foregroundPath = useDerivedValue(() => {
    const sweep = animatedProgress.value * 360;
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

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        {/* bg ring */}
        <Path
          path={bgPath}
          style="stroke"
          strokeWidth={strokeWidth}
          color={palette.line}
          strokeCap="round"
        />
        {/* fg ring */}
        <Path
          path={foregroundPath}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
        >
          <SweepGradient
            c={vec(center, center)}
            colors={[palette.accent2, palette.accent]}
          />
        </Path>
      </Canvas>
      {children && <View style={styles.center}>{children}</View>}
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
  },
});

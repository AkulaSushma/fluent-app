import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { palette } from '@/theme/tokens';
import { useStore } from '@/store/useStore';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PARTICLE_COUNT = 70;
const COLORS = [palette.accent, palette.gold, palette.amber, palette.accent2, '#E9EFEA'];

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  rotation: number;
  drift: number;
}

function ConfettiPiece({ p }: { p: Particle }) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      p.delay,
      withTiming(SCREEN_H + 40, {
        duration: 2200 + Math.random() * 800,
        easing: Easing.in(Easing.quad),
      }),
    );
    rotate.value = withDelay(
      p.delay,
      withTiming(p.rotation, {
        duration: 2200,
        easing: Easing.linear,
      }),
    );
    opacity.value = withDelay(
      p.delay + 1600,
      withTiming(0, { duration: 600 }),
    );
  }, [translateY, opacity, rotate, p]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: p.drift },
      { rotateZ: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: p.x,
          width: p.size,
          height: p.size * 0.6,
          backgroundColor: p.color,
          borderRadius: p.size * 0.15,
        },
        style,
      ]}
    />
  );
}

export default function Confetti() {
  const visible = useStore((s) => s.confettiVisible);
  const clear = useStore((s) => s.clearConfetti);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * SCREEN_W,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        delay: Math.random() * 400,
        rotation: 360 + Math.random() * 720,
        drift: (Math.random() - 0.5) * 60,
      })),
    [],
  );

  useEffect(() => {
    if (visible) {
      const t = setTimeout(clear, 3200);
      return () => clearTimeout(t);
    }
  }, [visible, clear]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiPiece key={p.id} p={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 10000,
  },
  particle: {
    position: 'absolute',
    top: -10,
  },
});

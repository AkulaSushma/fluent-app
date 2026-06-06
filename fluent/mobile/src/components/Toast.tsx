import React, { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { palette, radius, space, spring } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';

export default function Toast() {
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);

  const translateY = useSharedValue(28);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toast) {
      translateY.value = 28;
      opacity.value = 0;
      translateY.value = withSpring(0, spring);
      opacity.value = withTiming(1, { duration: 250 });

      // auto-dismiss
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 });
        translateY.value = withDelay(
          100,
          withTiming(28, { duration: 200 }, () => {
            runOnJS(clearToast)();
          }),
        );
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [toast, clearToast, translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toast) return null;

  return (
    <View style={styles.positioner} pointerEvents="none">
      <Animated.View style={[styles.pill, animStyle]}>
        <Text style={styles.emoji}>{toast.emoji}</Text>
        <Text style={styles.message}>{toast.message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  positioner: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23,21,17,0.94)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radius.pill,
    gap: 10,
    maxWidth: '85%',
  },
  emoji: {
    fontSize: 18,
  },
  message: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: '#FFFFFF',
    flexShrink: 1,
  },
});

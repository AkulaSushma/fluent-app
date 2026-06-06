import React, { useCallback } from 'react';
import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { spring } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
  haptic?: boolean;
  children: React.ReactNode;
}

export default function PressableScale({
  style,
  scaleValue = 0.95,
  haptic = true,
  children,
  onPress,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(scaleValue, spring);
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [scaleValue, haptic, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, spring);
  }, [scale]);

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[animStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

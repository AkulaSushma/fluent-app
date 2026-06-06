import React from 'react';
import { type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { palette, radius, space, shadow } from '@/theme/tokens';

interface CardProps {
  children: React.ReactNode;
  index?: number;
  style?: ViewStyle | ViewStyle[];
  dark?: boolean;
}

export default function Card({ children, index = 0, style, dark }: CardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70)
        .springify()
        .damping(18)
        .stiffness(220)
        .mass(0.9)}
      style={[
        {
          backgroundColor: dark ? palette.dark1 : palette.card,
          borderRadius: radius.xl,
          padding: space.xl,
          borderWidth: dark ? 0 : 1,
          borderColor: dark ? 'transparent' : 'rgba(255,255,255,0.7)',
          ...shadow.card,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

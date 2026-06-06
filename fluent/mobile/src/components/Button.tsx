import React from 'react';
import { Text, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';
import { palette, radius, shadow, space } from '@/theme/tokens';
import { font } from '@/theme/typography';

type ButtonVariant = 'accent' | 'dark' | 'light' | 'ghost';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  onPress?: () => void;
  icon?: string;
  style?: any; // Allow style overrides
  disabled?: boolean;
}

export default function Button({
  label,
  variant = 'accent',
  size = 'md',
  onPress,
  icon,
  style,
  disabled,
}: ButtonProps) {
  const isAccent = variant === 'accent';

  const bg: ViewStyle =
    variant === 'dark'
      ? { backgroundColor: palette.ink }
      : variant === 'light'
        ? { backgroundColor: palette.paper }
        : variant === 'ghost'
          ? {
              backgroundColor: palette.card,
              borderWidth: 1,
              borderColor: palette.line,
            }
          : {};

  const textColor =
    variant === 'dark'
      ? palette.paper
      : variant === 'accent'
        ? '#FFFFFF'
        : palette.ink;

  const sizeStyle: ViewStyle = size === 'sm'
    ? { paddingVertical: 8, paddingHorizontal: space.md, borderRadius: radius.sm }
    : { paddingVertical: 14, paddingHorizontal: space.xl, borderRadius: radius.md };

  const inner = (
    <>
      <Text style={[styles.label, { color: textColor, fontSize: size === 'sm' ? 12 : 14 }]}>
        {label}
        {icon ? `  ${icon}` : ''}
      </Text>
    </>
  );

  if (isAccent) {
    return (
      <PressableScale
        onPress={onPress}
        style={style}
        disabled={disabled}
      >
        <LinearGradient
          colors={[palette.accent2, palette.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, sizeStyle, shadow.raised, disabled ? styles.disabled : null, style] as any}
        >
          {inner}
        </LinearGradient>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.base,
        bg,
        sizeStyle,
        variant === 'dark' ? shadow.card : null,
        disabled ? styles.disabled : null,
        style,
      ] as any}
      disabled={disabled}
    >
      {inner}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    fontFamily: font.sansSemi,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  },
});

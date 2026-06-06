import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import PressableScale from './PressableScale';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export default function Header({ title, showBack = true, right }: HeaderProps) {
  const navigation = useNavigation();

  return (
    <Animated.View
      entering={FadeInLeft.duration(400).springify().damping(20)}
      style={styles.container}
    >
      {showBack && navigation.canGoBack() ? (
        <PressableScale onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backIcon}>‹</Text>
        </PressableScale>
      ) : (
        <View style={styles.backSpacer} />
      )}

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {right ?? <View style={styles.backSpacer} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    gap: space.md,
  },
  back: {
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
  backIcon: {
    fontSize: 24,
    lineHeight: 26,
    color: palette.ink,
    fontFamily: font.sansMed,
    marginTop: -2,
  },
  backSpacer: {
    width: 42,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.serifMed,
    fontSize: 21,
    color: palette.ink,
  },
});

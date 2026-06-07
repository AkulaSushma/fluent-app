import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { palette, radius, space } from '../theme/tokens';
import { font } from '../theme/typography';
import PressableScale from './PressableScale';
import type { WordFamilyOut, VocabularyNodeOut } from '../api/client';

interface Props {
  family: WordFamilyOut;
  onWordPress: (node: VocabularyNodeOut) => void;
}

export default function WordIntensityLadder({ family, onWordPress }: Props) {
  // Sort from highest intensity (top of screen) to lowest intensity (bottom of screen)
  // so the intensity rises bottom-up
  const sortedWords = [...family.words].sort(
    (a, b) => (b.intensity ?? 0) - (a.intensity ?? 0)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.familyName}>{family.name}</Text>
      {family.base_meaning ? (
        <Text style={styles.familyMeaning}>{family.base_meaning}</Text>
      ) : null}

      <View style={styles.ladder}>
        {sortedWords.map((node, index) => {
          const intensityVal = node.intensity ?? 0.5;
          const leftOffset = intensityVal * 40; // horizontal indent based on intensity

          return (
            <Animated.View
              key={node.id}
              entering={FadeInDown.delay(index * 80).springify()}
              style={[styles.row, { paddingLeft: leftOffset }]}
            >
              <PressableScale
                onPress={() => onWordPress(node)}
                style={styles.card}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: mixHeat(intensityVal) },
                  ]}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.wordText}>{node.word}</Text>
                  {node.definition ? (
                    <Text style={styles.defText} numberOfLines={1}>
                      {node.definition}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.intensityBadge}>
                  <Text style={styles.intensityText}>
                    {Math.round(intensityVal * 100)}%
                  </Text>
                </View>
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

function mixHeat(intensity: number): string {
  // Blend from palette.accent (#37563D = rgb(55, 86, 61)) to terracotta (#C0392B = rgb(192, 57, 43))
  const r = Math.round(55 + (192 - 55) * intensity);
  const g = Math.round(86 + (57 - 86) * intensity);
  const b = Math.round(61 + (43 - 61) * intensity);
  return `rgb(${r}, ${g}, ${b})`;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: space.md,
  },
  familyName: {
    fontFamily: font.serifBold,
    fontSize: 22,
    color: palette.ink,
    marginBottom: space.xs,
  },
  familyMeaning: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink2,
    marginBottom: space.md,
  },
  ladder: {
    gap: space.sm,
    borderLeftWidth: 2,
    borderLeftColor: palette.line,
    paddingLeft: space.xs,
  },
  row: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: palette.line,
    shadowColor: palette.ink,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: space.md,
  },
  textContainer: {
    flex: 1,
    marginRight: space.sm,
  },
  wordText: {
    fontFamily: font.serifMed,
    fontSize: 16,
    color: palette.ink,
  },
  defText: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    marginTop: 2,
  },
  intensityBadge: {
    backgroundColor: palette.paper,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  intensityText: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.ink2,
  },
});

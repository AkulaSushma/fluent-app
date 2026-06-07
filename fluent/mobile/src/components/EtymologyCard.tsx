import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { VocabularyNodeOut } from '../api/client';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import Button from './Button';

interface EtymologyCardProps {
  node: VocabularyNodeOut;
  onEnqueue?: () => void;
  onJournal?: () => void;
}

export default function EtymologyCard({ node, onEnqueue, onJournal }: EtymologyCardProps) {
  const chips = [
    { type: 'PREFIX', part: node.prefix, color: '#FF7C9C' },
    { type: 'ROOT', part: node.root, color: '#37563D' },
    { type: 'SUFFIX', part: node.suffix, color: '#5CD2C6' },
  ].filter(c => c.part !== null);

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      style={styles.card}
    >
      <Text style={styles.word}>{node.word}</Text>
      
      {node.definition && (
        <Text style={styles.definition}>{node.definition}</Text>
      )}

      {chips.length > 0 && (
        <View style={styles.chipsRow}>
          {chips.map((chip, idx) => (
            <Animated.View
              key={chip.type}
              entering={FadeIn.delay(idx * 90)}
              style={[
                styles.chip,
                {
                  backgroundColor: `${chip.color}15`,
                  borderColor: `${chip.color}44`,
                },
              ]}
            >
              <Text style={[styles.chipLabel, { color: chip.color }]}>
                {chip.type}
              </Text>
              <Text style={styles.morpheme}>
                {chip.type === 'PREFIX' ? `${chip.part!.morpheme}-` : chip.type === 'SUFFIX' ? `-${chip.part!.morpheme}` : chip.part!.morpheme}
              </Text>
              <Text style={styles.meaning}>{chip.part!.meaning}</Text>
            </Animated.View>
          ))}
        </View>
      )}

      {node.context_sentence && (
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            "{node.context_sentence}"
          </Text>
        </View>
      )}

      <View style={styles.actionsRow}>
        {onEnqueue && (
          <Button
            label="Add to Memory Loop"
            variant="accent"
            size="sm"
            onPress={onEnqueue}
            style={styles.actionBtn}
          />
        )}
        {onJournal && (
          <Button
            label="Write in Journal"
            variant="ghost"
            size="sm"
            onPress={onJournal}
            style={styles.actionBtn}
          />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...shadow.card,
  },
  word: {
    fontFamily: font.serifBold,
    fontSize: 28,
    color: palette.ink,
    marginBottom: space.xs,
  },
  definition: {
    fontFamily: font.sansReg,
    fontSize: 14.5,
    lineHeight: 20,
    color: palette.ink2,
    marginBottom: space.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.lg,
    flexWrap: 'wrap',
  },
  chip: {
    flex: 1,
    minWidth: 90,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'flex-start',
  },
  chipLabel: {
    fontFamily: font.sansBold,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
  },
  morpheme: {
    fontFamily: font.sansBold,
    fontSize: 16,
    color: palette.ink,
    marginBottom: 2,
  },
  meaning: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink2,
  },
  quoteBox: {
    backgroundColor: palette.line2,
    padding: space.md,
    borderRadius: radius.md,
    marginBottom: space.lg,
    borderLeftWidth: 3,
    borderLeftColor: palette.accent,
  },
  quoteText: {
    fontFamily: font.sansReg,
    fontStyle: 'italic',
    fontSize: 13.5,
    lineHeight: 19,
    color: palette.ink2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  actionBtn: {
    flex: 1,
  },
});

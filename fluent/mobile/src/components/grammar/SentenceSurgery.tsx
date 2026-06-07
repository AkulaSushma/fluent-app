import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';

interface WordToken {
  word: string;
  role: 'Subject' | 'Verb' | 'Object' | 'Auxiliary' | 'Modifier' | 'Negation' | 'Other';
  explanation: string;
}

interface SentenceSurgeryProps {
  sentenceData?: WordToken[];
}

const DEFAULT_SURGERY: WordToken[] = [
  { word: 'The', role: 'Modifier', explanation: 'Definite article defining the subject.' },
  { word: 'engineer', role: 'Subject', explanation: 'The Doer (Noun) performing the action.' },
  { word: 'quickly', role: 'Modifier', explanation: 'Adverb describing the speed of the action.' },
  { word: 'resolved', role: 'Verb', explanation: 'The primary Action Verb in Past Tense.' },
  { word: 'the', role: 'Modifier', explanation: 'Definite article defining the object.' },
  { word: 'critical', role: 'Modifier', explanation: 'Adjective qualifying the object.' },
  { word: 'bug.', role: 'Object', explanation: 'The Receiver (Noun) affected by the action.' }
];

export default function SentenceSurgery({
  sentenceData = DEFAULT_SURGERY,
}: SentenceSurgeryProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const getRoleColor = (role: WordToken['role']) => {
    switch (role) {
      case 'Subject':
        return palette.accent;
      case 'Verb':
        return palette.amber;
      case 'Object':
        return '#6B7FD7';
      case 'Auxiliary':
        return palette.ink3;
      case 'Modifier':
        return palette.gold;
      case 'Negation':
        return '#C75450';
      default:
        return palette.ink3;
    }
  };

  const handleSelectWord = (idx: number) => {
    if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      setSelectedIdx(idx);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>INTERACTIVE DISSECTION</Text>
      <Text style={styles.title}>Sentence Surgery Table</Text>
      <Text style={styles.description}>
        Tap any word capsule to dissect the sentence structure and reveal its grammatical function.
      </Text>

      {/* Surgery Operating Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>OPERATING TABLE</Text>
          <View style={styles.greenLight} />
        </View>

        <View style={styles.sentenceRow}>
          {sentenceData.map((item, idx) => {
            const isSelected = selectedIdx === idx;
            const color = getRoleColor(item.role);
            
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.wordCapsule,
                  { borderColor: isSelected ? color : palette.line },
                  isSelected && {
                    backgroundColor: `${color}15`,
                    shadowColor: color,
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 4,
                  }
                ]}
                onPress={() => handleSelectWord(idx)}
                activeOpacity={0.8}
              >
                <Text style={[styles.wordText, isSelected && { color }]}>
                  {item.word}
                </Text>
                {isSelected && (
                  <View style={[styles.roleBadge, { backgroundColor: color }]}>
                    <Text style={styles.roleBadgeText}>{item.role}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: palette.accent }]} />
            <Text style={styles.legendText}>Subject</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: palette.amber }]} />
            <Text style={styles.legendText}>Verb</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6B7FD7' }]} />
            <Text style={styles.legendText}>Object</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: palette.gold }]} />
            <Text style={styles.legendText}>Modifier</Text>
          </View>
        </View>
      </View>

      {/* Dissection Tooltip Box */}
      <View style={styles.diagnosisBox}>
        {selectedIdx !== null ? (
          <View>
            <View style={styles.diagnosisHeader}>
              <Text style={styles.diagnosisTitle}>DISSECTION DIAGNOSIS</Text>
              <Text style={[styles.diagnosisBadge, { color: getRoleColor(sentenceData[selectedIdx].role) }]}>
                {sentenceData[selectedIdx].role.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.diagnosisWord}>
              "{sentenceData[selectedIdx].word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")}"
            </Text>
            <Text style={styles.diagnosisExplanation}>
              {sentenceData[selectedIdx].explanation}
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholderDiagnosis}>
            Select a word above to analyze its role.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.card,
    padding: space.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.line2,
    ...shadow.card,
    overflow: 'hidden',
  },
  kicker: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.accent,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
    marginBottom: space.sm,
  },
  description: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 18,
    marginBottom: space.xl,
  },
  table: {
    backgroundColor: palette.paper,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: palette.line,
    marginBottom: space.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  tableHeaderText: {
    fontFamily: font.sansBold,
    fontSize: 9,
    color: palette.ink3,
    letterSpacing: 1,
  },
  greenLight: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent,
    shadowColor: palette.accent,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  sentenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: space.sm,
    paddingVertical: space.sm,
  },
  wordCapsule: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    ...shadow.card,
  },
  wordText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.ink,
  },
  roleBadge: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  roleBadgeText: {
    fontFamily: font.sansBold,
    fontSize: 7,
    color: '#FFFFFF',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderColor: palette.line,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontFamily: font.sansReg,
    fontSize: 10,
    color: palette.ink3,
  },
  diagnosisBox: {
    backgroundColor: palette.paper,
    borderRadius: radius.md,
    padding: space.md,
    minHeight: 90,
    borderWidth: 1,
    borderColor: palette.line,
    justifyContent: 'center',
  },
  diagnosisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  diagnosisTitle: {
    fontFamily: font.sansBold,
    fontSize: 9,
    color: palette.accent,
    letterSpacing: 0.8,
  },
  diagnosisBadge: {
    fontFamily: font.sansBold,
    fontSize: 10,
  },
  diagnosisWord: {
    fontFamily: font.serifBold,
    fontSize: 18,
    color: palette.ink,
    marginBottom: 6,
  },
  diagnosisExplanation: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink2,
    lineHeight: 16,
  },
  placeholderDiagnosis: {
    fontFamily: font.sansReg,
    fontStyle: 'italic',
    fontSize: 12,
    color: palette.ink3,
    textAlign: 'center',
  },
});

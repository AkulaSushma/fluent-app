import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import ProgressRing from './ProgressRing';
import PaceRing from './PaceRing';
import Ionicons from '@expo/vector-icons/Ionicons';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import type { PronunciationResult } from '@/api/client';
import PressableScale from './PressableScale';

interface ResultCardProps {
  result: PronunciationResult;
  targetWpm: number;
  onRetry: () => void;
  onNewText: () => void;
}

export default function ResultCard({
  result,
  targetWpm,
  onRetry,
  onNewText,
}: ResultCardProps) {
  const accuracy = result.accuracy;
  const actualWpm = result.fluency_wpm || 0;
  const problemPhonemes = result.problem_phonemes || [];
  const problemWords = result.problem_words || [];

  return (
    <View style={styles.container}>
      {/* Overview Card */}
      <Card index={0} style={styles.card}>
        <Text style={styles.title}>Session Summary</Text>
        
        <View style={styles.statsRow}>
          {/* Accuracy Ring */}
          <View style={styles.statBox}>
            <ProgressRing progress={accuracy / 100} size={88} strokeWidth={8}>
              <Text style={styles.accuracyText}>{accuracy}%</Text>
            </ProgressRing>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>

          {/* Pace Ring */}
          <View style={styles.statBox}>
            <PaceRing actualWpm={actualWpm} targetWpm={targetWpm} size={88} strokeWidth={8} />
            <Text style={styles.statLabel}>Speech Pace</Text>
          </View>
        </View>

        {/* Motivation Delta Alert */}
        {result.motivation ? (
          <View style={styles.motivationBox}>
            <Ionicons name="trending-up" size={18} color={palette.accent} />
            <Text style={styles.motivationText}>{result.motivation}</Text>
          </View>
        ) : null}
      </Card>

      {/* Tricky Phonemes & Tips */}
      {problemPhonemes.length > 0 ? (
        <Card index={1} style={styles.phonemeCard}>
          <Text style={styles.subTitle}>Tricky Sounds Detected</Text>
          <Text style={styles.subDesc}>We noticed some speech patterns that could use a bit of practice:</Text>
          
          <View style={styles.phonemeList}>
            {problemPhonemes.map((ph, idx) => (
              <View key={idx} style={styles.phonemeItem}>
                <View style={styles.phonemeBadge}>
                  <Text style={styles.phonemeSymbol}>/{ph.sound}/</Text>
                </View>
                <View style={styles.phonemeDetails}>
                  <Text style={styles.phonemeExample}>
                    Example: <Text style={styles.boldText}>{ph.examples.join(', ')}</Text>
                  </Text>
                  <Text style={styles.phonemeTip}>{ph.tip}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {/* Problem Words */}
      {problemWords.length > 0 ? (
        <Card index={2} style={styles.wordCard}>
          <Text style={styles.subTitle}>Words to Practice</Text>
          <View style={styles.wordsContainer}>
            {problemWords.map((word, idx) => (
              <View key={idx} style={styles.wordBadge}>
                <Text style={styles.wordText}>{word}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {/* Action Row */}
      <View style={styles.actionRow}>
        <PressableScale onPress={onRetry} style={[styles.actionBtn, styles.retryBtn]}>
          <Ionicons name="refresh" size={18} color={palette.accent} />
          <Text style={[styles.btnText, styles.retryBtnText]}>Read Again</Text>
        </PressableScale>

        <PressableScale onPress={onNewText} style={[styles.actionBtn, styles.nextBtn]}>
          <Text style={[styles.btnText, styles.nextBtnText]}>Next Passage</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.md,
  },
  card: {
    padding: space.lg,
  },
  title: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
    textAlign: 'center',
    marginBottom: space.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: space.sm,
  },
  statBox: {
    alignItems: 'center',
    gap: space.xs,
  },
  accuracyText: {
    fontFamily: font.sansBold,
    fontSize: 18,
    color: palette.accent,
  },
  statLabel: {
    fontFamily: font.sansSemi,
    fontSize: 12,
    color: palette.ink3,
    marginTop: space.xs,
  },
  motivationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    padding: space.md,
    borderRadius: radius.md,
    gap: space.sm,
    marginTop: space.md,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  motivationText: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink,
    flex: 1,
    lineHeight: 18,
  },
  subTitle: {
    fontFamily: font.serifMed,
    fontSize: 16,
    color: palette.ink,
    marginBottom: space.xs,
  },
  subDesc: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink3,
    marginBottom: space.md,
  },
  phonemeCard: {
    borderLeftWidth: 4,
    borderLeftColor: palette.amber,
  },
  phonemeList: {
    gap: space.md,
  },
  phonemeItem: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
  },
  phonemeBadge: {
    backgroundColor: palette.amberSoft,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.sm,
    minWidth: 48,
    alignItems: 'center',
  },
  phonemeSymbol: {
    fontFamily: font.sansSemi,
    fontSize: 13,
    color: palette.amber,
  },
  phonemeDetails: {
    flex: 1,
    gap: 2,
  },
  phonemeExample: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
  },
  boldText: {
    fontFamily: font.sansSemi,
    color: palette.ink,
  },
  phonemeTip: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    lineHeight: 17,
  },
  wordCard: {
    padding: space.md,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  wordBadge: {
    backgroundColor: palette.line2,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
  },
  wordText: {
    fontFamily: font.sansSemi,
    fontSize: 13,
    color: palette.ink,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.sm,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    ...shadow.card,
  },
  retryBtn: {
    backgroundColor: palette.card,
    borderWidth: 1.5,
    borderColor: palette.accent,
  },
  nextBtn: {
    backgroundColor: palette.accent,
  },
  btnText: {
    fontFamily: font.sansSemi,
    fontSize: 14,
  },
  retryBtnText: {
    color: palette.accent,
  },
  nextBtnText: {
    color: '#FFFFFF',
  },
});

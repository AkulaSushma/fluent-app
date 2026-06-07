import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import PressableScale from './PressableScale';
import Button from './Button';
import { useStore } from '../store/useStore';
import { scheduleSpeakReminder } from '../utils/notifications';
import type { VocabularyNodeOut } from '../api/client';

interface Props {
  node: VocabularyNodeOut;
  onClose: () => void;
}

const STEPS = ['Meaning', 'Origin', 'Personal Sentence'] as const;

export default function ThreeLevelCapture({ node, onClose }: Props) {
  const [step, setStep] = useState<number>(0);
  const [sentence, setSentence] = useState<string>('');
  const [emotion, setEmotion] = useState<string>('curiosity');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const createJournalEntry = useStore((s) => s.createJournalEntry);
  const enqueueCognitiveWord = useStore((s) => s.enqueueCognitiveWord);

  const emotions = [
    { label: 'Curiosity', emoji: '🧐', tag: 'curiosity' },
    { label: 'Melancholy', emoji: '😔', tag: 'melancholy' },
    { label: 'Gratitude', emoji: '🙏', tag: 'gratitude' },
    { label: 'Joy', emoji: '✨', tag: 'joy' },
    { label: 'Determination', emoji: '💪', tag: 'determination' },
  ];

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      if (!sentence.trim()) {
        return;
      }
      setIsSaving(true);
      try {
        // Save to word journal
        await createJournalEntry(node.id, sentence.trim(), emotion);
        // Automatically enqueue in Memory Loop (SRS)
        await enqueueCognitiveWord(node.id);
        // Schedule Speak Reminder (24-Hour Rule)
        await scheduleSpeakReminder(node.word, node.id);
        
        onClose();
      } catch (err) {
        console.error('Failed to save 3-level capture:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const chips = [
    { type: 'PREFIX', part: node.prefix, color: '#FF7C9C' },
    { type: 'ROOT', part: node.root, color: '#37563D' },
    { type: 'SUFFIX', part: node.suffix, color: '#5CD2C6' },
  ].filter((c) => c.part !== null);

  return (
    <View style={styles.sheetContainer}>
      {/* Step Progress Header */}
      <View style={styles.header}>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { width: `${((step + 1) / 3) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.stepsTextRow}>
          {STEPS.map((name, i) => (
            <Text
              key={name}
              style={[
                styles.stepText,
                i === step && styles.stepTextActive,
                i < step && styles.stepTextPassed,
              ]}
            >
              {name}
            </Text>
          ))}
        </View>
      </View>

      {/* Step 1: Meaning */}
      {step === 0 && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepBody}>
          <Text style={styles.titleKicker}>LEVEL 1: MEANING</Text>
          <Text style={styles.word}>{node.word}</Text>
          <Text style={styles.definition}>
            {node.definition || 'No definition available.'}
          </Text>

          {node.context_sentence ? (
            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>"{node.context_sentence}"</Text>
            </View>
          ) : null}
        </Animated.View>
      )}

      {/* Step 2: Origin / Root */}
      {step === 1 && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepBody}>
          <Text style={styles.titleKicker}>LEVEL 2: ETYMO-DECODE</Text>
          <Text style={styles.subTitle}>Deconstruct the word's building blocks</Text>

          <View style={styles.chipsRow}>
            {chips.map((chip, idx) => (
              <View
                key={chip.type}
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
                  {chip.type === 'PREFIX'
                    ? `${chip.part!.morpheme}-`
                    : chip.type === 'SUFFIX'
                    ? `-${chip.part!.morpheme}`
                    : chip.part!.morpheme}
                </Text>
                <Text style={styles.meaning}>{chip.part!.meaning}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.originHint}>
            Knowing root words allows you to easily deduce the definitions of dozens of related terms in context.
          </Text>
        </Animated.View>
      )}

      {/* Step 3: Sentence / Journal */}
      {step === 2 && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.stepBody}>
          <Text style={styles.titleKicker}>LEVEL 3: ANCHOR IN MEMORY</Text>
          <Text style={styles.subTitle}>
            Write a sentence reflecting a personal memory or vivid feeling.
          </Text>

          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            value={sentence}
            onChangeText={setSentence}
            placeholder={`e.g. When I watched the sunset, I felt a benevolent warmth.`}
            placeholderTextColor={palette.ink3}
          />

          <Text style={styles.emotionKicker}>SELECT EMOTIONAL ANCHOR</Text>
          <View style={styles.emotionRow}>
            {emotions.map((e) => (
              <PressableScale
                key={e.tag}
                onPress={() => setEmotion(e.tag)}
                style={[
                  styles.emotionPill,
                  emotion === e.tag && styles.emotionPillActive,
                ]}
              >
                <Text style={styles.emotionEmoji}>{e.emoji}</Text>
                <Text
                  style={[
                    styles.emotionLabel,
                    emotion === e.tag && styles.emotionLabelActive,
                  ]}
                >
                  {e.label}
                </Text>
              </PressableScale>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {step > 0 && (
          <Button
            label="Back"
            variant="ghost"
            style={styles.backBtn}
            onPress={() => setStep(step - 1)}
          />
        )}
        <Button
          label={
            isSaving ? (
              'Saving...'
            ) : step < 2 ? (
              'Continue'
            ) : (
              'Save & Schedule'
            )
          }
          variant="accent"
          style={styles.nextBtn}
          onPress={handleNext}
          disabled={isSaving || (step === 2 && !sentence.trim())}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: palette.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.xl,
    shadowColor: palette.ink,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    marginBottom: space.lg,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: palette.line2,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: space.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.accent,
  },
  stepsTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepText: {
    fontFamily: font.sansMed,
    fontSize: 11,
    color: palette.ink3,
  },
  stepTextActive: {
    color: palette.accent,
    fontFamily: font.sansBold,
  },
  stepTextPassed: {
    color: palette.accent2,
  },
  stepBody: {
    minHeight: 220,
    justifyContent: 'center',
  },
  titleKicker: {
    fontFamily: font.sansBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: palette.accent,
    marginBottom: space.xs,
  },
  subTitle: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.ink2,
    marginBottom: space.md,
  },
  word: {
    fontFamily: font.serifBold,
    fontSize: 32,
    color: palette.ink,
    marginBottom: space.xs,
  },
  definition: {
    fontFamily: font.sansReg,
    fontSize: 15,
    lineHeight: 22,
    color: palette.ink2,
    marginBottom: space.md,
  },
  quoteBox: {
    backgroundColor: palette.line2,
    padding: space.md,
    borderRadius: radius.md,
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
  chipsRow: {
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.md,
  },
  chip: {
    flex: 1,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
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
  originHint: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink3,
    lineHeight: 18,
  },
  input: {
    backgroundColor: palette.line2,
    borderRadius: radius.md,
    padding: space.md,
    fontFamily: font.sansReg,
    fontSize: 15,
    color: palette.ink,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: space.md,
  },
  emotionKicker: {
    fontFamily: font.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: palette.ink2,
    marginBottom: space.xs,
  },
  emotionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  emotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.line2,
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emotionPillActive: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
  },
  emotionEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  emotionLabel: {
    fontFamily: font.sansMed,
    fontSize: 12,
    color: palette.ink2,
  },
  emotionLabelActive: {
    color: palette.accent,
    fontFamily: font.sansBold,
  },
  footer: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.xl,
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});

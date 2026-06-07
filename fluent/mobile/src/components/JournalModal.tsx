import React, { useState } from 'react';
import { View, Text, Modal, TextInput, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useStore } from '../store/useStore';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import Button from './Button';
import PressableScale from './PressableScale';

interface JournalModalProps {
  visible: boolean;
  vocabularyNodeId: string | null;
  wordString: string | null;
  onClose: () => void;
}

const EMOTIONS = [
  { emoji: '😊', tag: 'joy' },
  { emoji: '😔', tag: 'melancholy' },
  { emoji: '🔥', tag: 'excitement' },
  { emoji: '🎯', tag: 'determination' },
  { emoji: '🧐', tag: 'curiosity' },
  { emoji: '🙏', tag: 'gratitude' },
  { emoji: '😤', tag: 'frustration' },
  { emoji: '✨', tag: 'wonder' },
];

export default function JournalModal({ visible, vocabularyNodeId, wordString, onClose }: JournalModalProps) {
  const [sentence, setSentence] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('curiosity');
  const [submitting, setSubmitting] = useState(false);
  const createJournalEntry = useStore((s) => s.createJournalEntry);

  const handleSave = async () => {
    if (!sentence.trim()) return;
    setSubmitting(true);
    try {
      await createJournalEntry(vocabularyNodeId, sentence.trim(), selectedEmotion);
      setSentence('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>New Journal Entry</Text>
            {wordString && (
              <Text style={styles.wordSub}>Reflecting on: "{wordString}"</Text>
            )}
          </View>

          <TextInput
            multiline
            numberOfLines={4}
            value={sentence}
            onChangeText={setSentence}
            placeholder="Write a personal sentence using the word to calibrate it in your memory..."
            placeholderTextColor={palette.ink3}
            style={styles.textInput}
          />

          <Text style={styles.sectionTitle}>HOW DOES THIS WORD FEEL?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emotionScroll}
          >
            {EMOTIONS.map((item) => {
              const isSelected = selectedEmotion === item.tag;
              return (
                <PressableScale
                  key={item.tag}
                  onPress={() => setSelectedEmotion(item.tag)}
                  style={[
                    styles.emotionPill,
                    isSelected && styles.emotionPillSelected,
                  ]}
                >
                  <Text style={styles.emotionEmoji}>{item.emoji}</Text>
                  <Text
                    style={[
                      styles.emotionLabel,
                      isSelected && styles.emotionLabelSelected,
                    ]}
                  >
                    {item.tag}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="ghost"
              onPress={onClose}
              style={styles.actionBtn}
            />
            <Button
              label={submitting ? "Saving..." : "Save Entry"}
              variant="accent"
              onPress={handleSave}
              disabled={submitting || !sentence.trim()}
              style={styles.actionBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(23, 21, 17, 0.4)',
  },
  modalContent: {
    backgroundColor: palette.paper,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.xl,
    paddingBottom: space.xxl + 10,
    ...shadow.fab,
  },
  header: {
    marginBottom: space.lg,
  },
  title: {
    fontFamily: font.serifMed,
    fontSize: 22,
    color: palette.ink,
  },
  wordSub: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.accent,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: palette.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.line,
    padding: space.md,
    fontFamily: font.sansReg,
    fontSize: 15,
    color: palette.ink,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: space.lg,
  },
  sectionTitle: {
    fontFamily: font.sansBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: palette.ink3,
    marginBottom: space.sm,
  },
  emotionScroll: {
    gap: space.sm,
    paddingBottom: space.lg,
  },
  emotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 4,
  },
  emotionPillSelected: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
  },
  emotionEmoji: {
    fontSize: 16,
  },
  emotionLabel: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink2,
  },
  emotionLabelSelected: {
    color: palette.accentInk,
    fontFamily: font.sansSemi,
  },
  actions: {
    flexDirection: 'row',
    gap: space.md,
  },
  actionBtn: {
    flex: 1,
  },
});

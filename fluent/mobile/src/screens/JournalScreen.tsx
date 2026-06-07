import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import Button from '../components/Button';
import Header from '../components/Header';
import Card from '../components/Card';
import PressableScale from '../components/PressableScale';

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

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [sentence, setSentence] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('curiosity');
  const [submitting, setSubmitting] = useState(false);

  const journalEntries = useStore((s) => s.journalEntries);
  const fetchJournal = useStore((s) => s.fetchJournal);
  const createJournalEntry = useStore((s) => s.createJournalEntry);

  useEffect(() => {
    fetchJournal();
  }, [fetchJournal]);

  const handleSave = async () => {
    if (!sentence.trim()) return;
    setSubmitting(true);
    try {
      await createJournalEntry(null, sentence.trim(), selectedEmotion);
      setSentence('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getEmotionEmoji = (tag: string) => {
    return EMOTIONS.find((e) => e.tag === tag)?.emoji || '📝';
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Word Journal" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* New Entry Card */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(18)} style={styles.formCard}>
          <Text style={styles.sectionKicker}>WRITE REFLECTION</Text>
          <Text style={styles.sectionTitle}>New Entry</Text>
          
          <TextInput
            multiline
            numberOfLines={4}
            value={sentence}
            onChangeText={setSentence}
            placeholder="Write a personal reflection or build a sentence using newly learned vocabulary..."
            placeholderTextColor={palette.ink3}
            style={styles.textInput}
          />

          <Text style={styles.label}>EMOTIONAL TONE</Text>
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

          <Button
            label={submitting ? "Saving..." : "Save Entry"}
            variant="accent"
            onPress={handleSave}
            disabled={submitting || !sentence.trim()}
          />
        </Animated.View>

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionKicker}>REFLECTION ARCHIVE</Text>
          <Text style={styles.historyTitle}>Past Entries</Text>

          {journalEntries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>Your journal is empty.</Text>
              <Text style={styles.emptySub}>
                Write a sentence above or explore the Library to highlight word origins.
              </Text>
            </View>
          ) : (
            <View style={styles.entriesList}>
              {journalEntries.map((entry, idx) => (
                <Card key={entry.id} index={idx + 2} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryWordRow}>
                      <Text style={styles.entryEmoji}>
                        {getEmotionEmoji(entry.emotion_tag || '')}
                      </Text>
                      {entry.word ? (
                        <Text style={styles.entryWord}>{entry.word.word}</Text>
                      ) : (
                        <Text style={styles.entryGeneral}>General Entry</Text>
                      )}
                    </View>
                    <Text style={styles.entryDate}>
                      {new Date(entry.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>

                  <Text style={styles.entrySentence}>
                    "{entry.personal_sentence}"
                  </Text>
                  
                  {entry.word && entry.word.definition && (
                    <Text style={styles.entryDefinition} numberOfLines={1}>
                      {entry.word.definition}
                    </Text>
                  )}

                  {entry.word && (
                    <View style={styles.spokenRow}>
                      {entry.spoken_aloud ? (
                        <View style={[styles.spokenBadge, styles.spokenBadgeActive]}>
                          <Text style={styles.spokenBadgeTextActive}>🗣️ Spoken Aloud</Text>
                        </View>
                      ) : (
                        <PressableScale
                          onPress={() => useStore.getState().markJournalEntrySpoken(entry.id)}
                          style={styles.speakButton}
                        >
                          <Text style={styles.speakButtonText}>🎙️ Practice Speaking Aloud</Text>
                        </PressableScale>
                      )}
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  scrollContent: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl + 40,
  },
  formCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...shadow.card,
    marginBottom: space.xxl,
  },
  sectionKicker: {
    fontFamily: font.sansBold,
    fontSize: 9.5,
    letterSpacing: 1.2,
    color: palette.ink3,
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: font.serifMed,
    fontSize: 20,
    color: palette.ink,
    marginBottom: space.md,
  },
  textInput: {
    backgroundColor: palette.paper,
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
  label: {
    fontFamily: font.sansBold,
    fontSize: 10.5,
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
    backgroundColor: palette.paper,
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
  historySection: {
    marginTop: space.sm,
  },
  historyTitle: {
    fontFamily: font.serifMed,
    fontSize: 20,
    color: palette.ink,
    marginBottom: space.md,
  },
  entriesList: {
    gap: space.md,
  },
  entryCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...shadow.card,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  entryWordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  entryEmoji: {
    fontSize: 18,
  },
  entryWord: {
    fontFamily: font.serifBold,
    fontSize: 17,
    color: palette.ink,
  },
  entryGeneral: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.ink2,
  },
  entryDate: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
  },
  entrySentence: {
    fontFamily: font.sansReg,
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 21,
    color: palette.ink,
    marginBottom: space.sm,
  },
  entryDefinition: {
    fontFamily: font.sansReg,
    fontSize: 12.5,
    color: palette.ink3,
  },
  spokenRow: {
    marginTop: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spokenBadge: {
    backgroundColor: palette.line2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  spokenBadgeActive: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent + '30',
    borderWidth: 1,
  },
  spokenBadgeTextActive: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: palette.accent,
  },
  speakButton: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
    borderWidth: 1,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  speakButtonText: {
    fontFamily: font.sansBold,
    fontSize: 11.5,
    color: palette.accent,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxl * 2,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.line,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: space.md,
  },
  emptyText: {
    fontFamily: font.serifBold,
    fontSize: 18,
    color: palette.ink,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink3,
    textAlign: 'center',
    paddingHorizontal: space.xxl,
    lineHeight: 18,
  },
});

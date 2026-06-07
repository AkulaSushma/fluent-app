import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import EtymologyCard from './EtymologyCard';
import JournalModal from './JournalModal';

interface TappableTextProps {
  passage: string;
}

export function TappableText({ passage }: TappableTextProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fetchEtymology = useStore((s) => s.fetchEtymology);
  const activeEtymology = useStore((s) => s.activeEtymology);
  const enqueueCognitiveWord = useStore((s) => s.enqueueCognitiveWord);

  const [journalVisible, setJournalVisible] = useState(false);

  const handleWordPress = useCallback(async (word: string) => {
    // Strip punctuation
    const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!cleanWord) return;

    // Toggle active state
    if (selectedWord === cleanWord) {
      setSelectedWord(null);
      useStore.setState({ activeEtymology: null });
      return;
    }

    setSelectedWord(cleanWord);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      await fetchEtymology(cleanWord);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedWord, fetchEtymology]);

  // Split passage into words and whitespace/punctuation
  const words = passage.split(/(\s+)/);

  return (
    <Animated.View layout={LinearTransition.springify().damping(20)} style={styles.container}>
      <Text style={styles.passage}>
        {words.map((part, index) => {
          const clean = part.replace(/[^a-zA-Z]/g, '').toLowerCase();
          const isWord = clean.length > 0;
          const isSelected = selectedWord === clean;

          if (!isWord) {
            return <Text key={index}>{part}</Text>;
          }

          return (
            <Text
              key={index}
              onPress={() => handleWordPress(part)}
              style={[
                styles.word,
                isSelected && styles.wordSelected,
              ]}
            >
              {part}
            </Text>
          );
        })}
      </Text>

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={palette.accent} size="small" />
          <Text style={styles.loaderText}>Decomposing origins...</Text>
        </View>
      )}

      {!loading && selectedWord && (
        <View style={styles.cardContainer}>
          {activeEtymology ? (
            <Animated.View entering={FadeInDown.springify().damping(18)} exiting={FadeOut}>
              <EtymologyCard
                node={activeEtymology}
                onEnqueue={() => enqueueCognitiveWord(activeEtymology.id)}
                onJournal={() => setJournalVisible(true)}
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown} exiting={FadeOut} style={styles.noInfoCard}>
              <Text style={styles.noInfoText}>
                No etymology data found for "{selectedWord}". Try tapping words like "benevolent", "incredible", "transparent", or "restructure".
              </Text>
            </Animated.View>
          )}
        </View>
      )}

      {activeEtymology && (
        <Modal
          visible={journalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setJournalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <Pressable style={styles.backdrop} onPress={() => setJournalVisible(false)} />
            <ThreeLevelCapture
              node={activeEtymology}
              onClose={() => setJournalVisible(false)}
            />
          </KeyboardAvoidingView>
        </Modal>
      )}
    </Animated.View>
  );
}

// Add these imports at the top
import { Modal, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import ThreeLevelCapture from './ThreeLevelCapture';

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
  },
  passage: {
    fontFamily: font.serifReg,
    fontSize: 18,
    lineHeight: 30,
    color: palette.ink,
  },
  word: {
    paddingHorizontal: 1,
  },
  wordSelected: {
    color: palette.accent,
    backgroundColor: palette.accentSoft,
    fontFamily: font.serifBold,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    justifyContent: 'center',
    padding: space.md,
    backgroundColor: palette.line2,
    borderRadius: radius.md,
  },
  loaderText: {
    fontFamily: font.sansMed,
    fontSize: 13,
    color: palette.ink2,
  },
  cardContainer: {
    marginTop: space.sm,
  },
  noInfoCard: {
    padding: space.lg,
    borderRadius: radius.md,
    backgroundColor: palette.line2,
    borderWidth: 1,
    borderColor: palette.line,
  },
  noInfoText: {
    fontFamily: font.sansReg,
    fontSize: 13.5,
    lineHeight: 19,
    color: palette.ink2,
    textAlign: 'center',
  },
  modalOverlay: {
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
});

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import PressableScale from '../components/PressableScale';
import Header from '../components/Header';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  
  const favorites = useStore((s) => s.favorites);
  const fetchFavorites = useStore((s) => s.fetchFavorites);
  const toggleFavoriteMastered = useStore((s) => s.toggleFavoriteMastered);

  const [selectedLetter, setSelectedLetter] = useState<string>('S'); // Default to 'S' as recommended

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const letterFiltered = favorites.filter(
    (f) => f.letter.toUpperCase() === selectedLetter
  );

  const masteredCount = favorites.filter((f) => f.mastered).length;
  const totalCount = favorites.length;
  const targetPct = Math.min(totalCount / 100, 1);
  const masterPct = totalCount > 0 ? masteredCount / totalCount : 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Favorite Words" showBack={true} />

      {/* Progress Cards */}
      <View style={styles.statsContainer}>
        <Card index={0} style={styles.statCard}>
          <View style={styles.statInfo}>
            <Text style={styles.statKicker}>LIST METRIC</Text>
            <Text style={styles.statTitle}>Collection</Text>
            <Text style={styles.statSub}>Target: 100 words</Text>
            <Text style={styles.statHighlight}>{totalCount} / 100 Words</Text>
          </View>
          <ProgressRing progress={targetPct} size={64} strokeWidth={6}>
            <Text style={styles.ringText}>{totalCount}%</Text>
          </ProgressRing>
        </Card>

        <Card index={1} style={styles.statCard}>
          <View style={styles.statInfo}>
            <Text style={styles.statKicker}>MASTERY RATE</Text>
            <Text style={styles.statTitle}>Mastered</Text>
            <Text style={styles.statSub}>Fully memorized</Text>
            <Text style={styles.statHighlight}>
              {masteredCount} of {totalCount} words
            </Text>
          </View>
          <ProgressRing progress={masterPct} size={64} strokeWidth={6}>
            <Text style={styles.ringText}>
              {totalCount > 0 ? Math.round(masterPct * 100) : 0}%
            </Text>
          </ProgressRing>
        </Card>
      </View>

      {/* Alphabet Horizontal Scroll Selector */}
      <View style={styles.alphabetBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.alphabetScroll}
        >
          {ALPHABET.map((letter) => {
            const hasWords = favorites.some((f) => f.letter.toUpperCase() === letter);
            const isSelected = selectedLetter === letter;

            return (
              <PressableScale
                key={letter}
                onPress={() => setSelectedLetter(letter)}
                style={[
                  styles.letterPill,
                  isSelected && styles.letterPillActive,
                  hasWords && !isSelected && styles.letterPillHasWords,
                ]}
              >
                <Text
                  style={[
                    styles.letterText,
                    isSelected && styles.letterTextActive,
                    hasWords && !isSelected && styles.letterTextHasWords,
                  ]}
                >
                  {letter}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      {/* Word List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.listTitle}>Words Starting with '{selectedLetter}'</Text>

        {letterFiltered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>⭐</Text>
            <Text style={styles.emptyText}>
              No favorite words captured under '{selectedLetter}' yet.
            </Text>
            <Text style={styles.emptyHint}>
              Tap words in story passages to add them to your collection!
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {letterFiltered.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 60).springify()}
                style={styles.listItem}
              >
                <PressableScale
                  onPress={() => toggleFavoriteMastered(item.id)}
                  style={[
                    styles.wordRow,
                    item.mastered && styles.wordRowMastered,
                  ]}
                >
                  <View style={styles.checkboxContainer}>
                    <View
                      style={[
                        styles.checkbox,
                        item.mastered && styles.checkboxChecked,
                      ]}
                    >
                      {item.mastered && <Text style={styles.check}>✓</Text>}
                    </View>
                  </View>
                  <View style={styles.wordInfo}>
                    <Text
                      style={[
                        styles.wordText,
                        item.mastered && styles.wordTextMastered,
                      ]}
                    >
                      {item.word}
                    </Text>
                    {item.node?.definition ? (
                      <Text style={styles.defText} numberOfLines={2}>
                        {item.node.definition}
                      </Text>
                    ) : null}
                  </View>
                </PressableScale>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.xl,
    marginTop: space.sm,
    marginBottom: space.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: palette.line,
  },
  statInfo: {
    flex: 1,
    marginRight: space.xs,
  },
  statKicker: {
    fontFamily: font.sansBold,
    fontSize: 8,
    letterSpacing: 1,
    color: palette.ink3,
    marginBottom: 2,
  },
  statTitle: {
    fontFamily: font.serifMed,
    fontSize: 15,
    color: palette.ink,
  },
  statSub: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
    marginTop: 1,
  },
  statHighlight: {
    fontFamily: font.sansBold,
    fontSize: 12.5,
    color: palette.accent,
    marginTop: 4,
  },
  ringText: {
    fontFamily: font.sansBold,
    fontSize: 12,
    color: palette.accent,
  },
  alphabetBar: {
    backgroundColor: palette.line2,
    paddingVertical: space.sm,
  },
  alphabetScroll: {
    paddingHorizontal: space.xl,
    gap: space.xs,
  },
  letterPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.line,
  },
  letterPillActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  letterPillHasWords: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent2 + '30',
  },
  letterText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.ink3,
  },
  letterTextActive: {
    color: '#FFFFFF',
  },
  letterTextHasWords: {
    color: palette.accent,
  },
  scrollContent: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxl + 40,
    paddingTop: space.md,
  },
  listTitle: {
    fontFamily: font.serifBold,
    fontSize: 18,
    color: palette.ink,
    marginBottom: space.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: space.xxl,
    gap: space.sm,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.ink2,
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    textAlign: 'center',
  },
  list: {
    gap: space.sm,
  },
  listItem: {
    width: '100%',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: palette.line,
  },
  wordRowMastered: {
    backgroundColor: palette.paper + '60',
    borderColor: palette.line2,
  },
  checkboxContainer: {
    marginRight: space.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: palette.ink3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  check: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontFamily: font.serifMed,
    fontSize: 17,
    color: palette.ink,
  },
  wordTextMastered: {
    color: palette.ink3,
    textDecorationLine: 'line-through',
  },
  defText: {
    fontFamily: font.sansReg,
    fontSize: 12.5,
    color: palette.ink2,
    marginTop: 2,
  },
});

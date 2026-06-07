import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '../components/Header';
import WordIntensityLadder from '../components/WordIntensityLadder';
import ThreeLevelCapture from '../components/ThreeLevelCapture';
import { useStore } from '../store/useStore';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import type { VocabularyNodeOut } from '../api/client';

export default function WordFamiliesScreen() {
  const insets = useSafeAreaInsets();
  const wordFamilies = useStore((s) => s.wordFamilies);
  const fetchWordFamilies = useStore((s) => s.fetchWordFamilies);
  const isLoading = useStore((s) => s.isLoadingData);

  const [selectedNode, setSelectedNode] = useState<VocabularyNodeOut | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchWordFamilies();
  }, [fetchWordFamilies]);

  const handleWordPress = (node: VocabularyNodeOut) => {
    setSelectedNode(node);
    setModalVisible(true);
  };

  // Group word families by theme name
  const themesMap = wordFamilies.reduce((acc: Record<string, typeof wordFamilies>, fam) => {
    const themeName = fam.theme ? fam.theme.toUpperCase() : 'GENERAL';
    if (!acc[themeName]) {
      acc[themeName] = [];
    }
    acc[themeName].push(fam);
    return acc;
  }, {});

  const themeKeys = Object.keys(themesMap).sort();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Word Families" showBack={true} />

      {isLoading && wordFamilies.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.accent} size="large" />
          <Text style={styles.loadingText}>Fetching semantic families...</Text>
        </View>
      ) : wordFamilies.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No word families available.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + space.xxl }]}
        >
          <View style={styles.heroSection}>
            <Text style={styles.heroKicker}>SEMANTIC INTENSITIES</Text>
            <Text style={styles.heroTitle}>Explore Word Families</Text>
            <Text style={styles.heroSub}>
              Don't just learn random words. Master entire families of varying intensities grouped by Latin and Greek roots.
            </Text>
          </View>

          {themeKeys.map((themeName, tIdx) => {
            const familiesInTheme = themesMap[themeName];
            return (
              <Animated.View
                key={themeName}
                entering={FadeInDown.delay(tIdx * 100).springify().damping(18)}
                style={styles.themeSection}
              >
                <View style={styles.themeHeader}>
                  <Text style={styles.themeLabel}>THEME</Text>
                  <Text style={styles.themeTitle}>{themeName}</Text>
                </View>

                <View style={styles.familiesContainer}>
                  {familiesInTheme.map((fam) => (
                    <WordIntensityLadder
                      key={fam.id}
                      family={fam}
                      onWordPress={handleWordPress}
                    />
                  ))}
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      {selectedNode && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)} />
            <ThreeLevelCapture
              node={selectedNode}
              onClose={() => setModalVisible(false)}
            />
          </KeyboardAvoidingView>
        </Modal>
      )}
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
    paddingTop: space.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
  },
  loadingText: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.ink2,
  },
  emptyText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink2,
  },
  heroSection: {
    marginBottom: space.xl,
  },
  heroKicker: {
    fontFamily: font.sansBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: palette.accent,
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: font.serifBold,
    fontSize: 28,
    color: palette.ink,
    marginBottom: 6,
  },
  heroSub: {
    fontFamily: font.sansReg,
    fontSize: 14,
    lineHeight: 20,
    color: palette.ink2,
  },
  themeSection: {
    marginBottom: space.xxl,
  },
  themeHeader: {
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
    paddingBottom: space.xs,
    marginBottom: space.md,
  },
  themeLabel: {
    fontFamily: font.sansBold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: palette.ink3,
    marginBottom: 2,
  },
  themeTitle: {
    fontFamily: font.serifBold,
    fontSize: 18,
    color: palette.accent,
  },
  familiesContainer: {
    gap: space.lg,
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

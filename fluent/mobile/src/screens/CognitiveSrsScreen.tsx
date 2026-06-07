import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Modal, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import Button from '../components/Button';
import Header from '../components/Header';
import EtymologyCard from '../components/EtymologyCard';
import Confetti from '../components/Confetti';
import ThreeLevelCapture from '../components/ThreeLevelCapture';

export default function CognitiveSrsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const cognitiveSrsDue = useStore((s) => s.cognitiveSrsDue);
  const fetchCognitiveSrsDue = useStore((s) => s.fetchCognitiveSrsDue);
  const reviewCognitiveSrs = useStore((s) => s.reviewCognitiveSrs);
  const isLoading = useStore((s) => s.isLoadingData);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [journalVisible, setJournalVisible] = useState(false);

  useEffect(() => {
    fetchCognitiveSrsDue();
  }, [fetchCognitiveSrsDue]);

  const currentItem = cognitiveSrsDue[currentIndex];

  const handleReview = async (quality: number) => {
    if (!currentItem) return;
    
    // Call review action in store with quality score (1, 3, 4, 5)
    await reviewCognitiveSrs(currentItem.vocabulary_node_id, quality);
    
    // Move to next item
    if (currentIndex + 1 < cognitiveSrsDue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowCompletion(true);
      useStore.setState({ cognitiveSrsDue: [] });
    }
  };

  const getLadderDots = (currentStage: number) => {
    const intervals = ['1d', '3d', '7d', '14d', '30d'];
    return (
      <View style={styles.ladderContainer}>
        <Text style={styles.ladderLabel}>INTERVAL STAGE:</Text>
        <View style={styles.ladderLineContainer}>
          {intervals.map((label, idx) => {
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;
            return (
              <React.Fragment key={label}>
                <View
                  style={[
                    styles.ladderDot,
                    isCompleted && styles.ladderDotCompleted,
                    isCurrent && styles.ladderDotCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.ladderDotText,
                      (isCompleted || isCurrent) && styles.ladderDotTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
                {idx < intervals.length - 1 && (
                  <View
                    style={[
                      styles.ladderConnector,
                      idx < currentStage && styles.ladderConnectorActive,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };

  if (isLoading && cognitiveSrsDue.length === 0) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator color={palette.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Etymology Review" showBack={true} />

      {showCompletion && <Confetti />}

      {showCompletion || cognitiveSrsDue.length === 0 ? (
        <Animated.View entering={FadeInDown} style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🧠</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySub}>
            Your memory pathways are consolidated for today. Explore the library to build more loops.
          </Text>
          <Button
            label="Back to Learn Hub"
            variant="accent"
            onPress={() => navigation.goBack()}
            style={styles.emptyBtn}
          />
        </Animated.View>
      ) : (
        <View style={styles.content}>
          <View style={styles.counterRow}>
            <Text style={styles.counterText}>
              CARD {currentIndex + 1} OF {cognitiveSrsDue.length}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {currentItem && currentItem.word && (
              <Animated.View key={currentItem.id} entering={FadeInDown.springify().damping(18)} exiting={FadeOut}>
                <EtymologyCard
                  node={currentItem.word}
                  onJournal={() => setJournalVisible(true)}
                />
              </Animated.View>
            )}

            {currentItem && getLadderDots(currentItem.stage)}
          </ScrollView>

          {/* SM-2 Upgraded Footer (4 difficulty grades) */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + space.lg }]}>
            <Button
              label="Forgot"
              variant="ghost"
              onPress={() => handleReview(1)}
              style={styles.footerBtn}
            />
            <Button
              label="Hard"
              variant="ghost"
              onPress={() => handleReview(3)}
              style={[styles.footerBtn, styles.borderBtn]}
            />
            <Button
              label="Good"
              variant="accent"
              onPress={() => handleReview(4)}
              style={styles.footerBtn}
            />
            <Button
              label="Easy"
              variant="accent"
              onPress={() => handleReview(5)}
              style={[styles.footerBtn, styles.easyBtn]}
            />
          </View>
        </View>
      )}

      {currentItem && currentItem.word && (
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
              node={currentItem.word}
              onClose={() => setJournalVisible(false)}
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
  content: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterRow: {
    paddingHorizontal: space.xl,
    paddingVertical: space.xs,
    marginBottom: space.sm,
  },
  counterText: {
    fontFamily: font.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: palette.ink3,
  },
  scrollContent: {
    paddingHorizontal: space.xl,
    paddingBottom: 160,
  },
  ladderContainer: {
    marginTop: space.xl,
    padding: space.xl,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.line,
    ...shadow.card,
    alignItems: 'center',
  },
  ladderLabel: {
    fontFamily: font.sansBold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: palette.ink3,
    marginBottom: space.md,
  },
  ladderLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ladderDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.paper,
    borderWidth: 2,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ladderDotCurrent: {
    borderColor: palette.accent,
    backgroundColor: palette.accentSoft,
  },
  ladderDotCompleted: {
    borderColor: palette.accent,
    backgroundColor: palette.accent,
  },
  ladderDotText: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: palette.ink2,
  },
  ladderDotTextActive: {
    color: '#FFFFFF',
  },
  ladderConnector: {
    flex: 1,
    height: 3,
    backgroundColor: palette.line,
  },
  ladderConnectorActive: {
    backgroundColor: palette.accent,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: space.lg,
    backgroundColor: palette.paper,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    gap: space.xs,
  },
  footerBtn: {
    flex: 1,
  },
  borderBtn: {
    borderWidth: 1,
    borderColor: palette.line,
  },
  easyBtn: {
    backgroundColor: palette.accent2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: space.lg,
  },
  emptyTitle: {
    fontFamily: font.serifBold,
    fontSize: 26,
    color: palette.ink,
    marginBottom: space.sm,
  },
  emptySub: {
    fontFamily: font.sansReg,
    fontSize: 14.5,
    color: palette.ink2,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: space.xl,
  },
  emptyBtn: {
    width: '100%',
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

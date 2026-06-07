import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '../components/Header';
import Card from '../components/Card';
import { TappableText } from '../components/TappableText';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import { api } from '../api/client';

export default function BookReaderScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const { book } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [passageText, setPassageText] = useState('');

  useEffect(() => {
    let active = true;
    const loadBookContent = async () => {
      if (!book) return;
      try {
        setLoading(true);
        // Call the GET /cognitive/library/{book_id} endpoint
        const details = await api.getCognitiveBook(book.id);
        if (active) {
          setPassageText(details.content_url || 'No content available.');
        }
      } catch (err) {
        console.error('Failed to load book content:', err);
        if (active) {
          setPassageText(book.content_url || 'Failed to load content.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadBookContent();
    return () => {
      active = false;
    };
  }, [book]);

  if (!book) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header title="Reader" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>No book selected.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Book Reader" showBack={true} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInDown.delay(100).springify().damping(18)}
          style={styles.bookHeaderContainer}
        >
          <Text style={styles.trackKicker}>
            {book.track === 'mastery' ? '🏅 PREMIUM MASTERY' : '🎨 VISUAL STORYTELLING'}
          </Text>
          <Text style={styles.bookTitle}>{book.title}</Text>
          {book.author && (
            <Text style={styles.bookAuthor}>by {book.author}</Text>
          )}
        </Animated.View>

        <Card index={0} style={styles.passageCard}>
          <Text style={styles.instructionsKicker}>ETIMOLOGY EXPLORER</Text>
          <Text style={styles.instructionsText}>
            Tap any word in the passage below to instantly inspect its Greek or Latin morphemic origins.
          </Text>
          <View style={styles.divider} />
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={palette.accent} size="small" />
              <Text style={styles.loadingText}>Fetching text from library...</Text>
            </View>
          ) : (
            <TappableText passage={passageText} />
          )}
        </Card>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink2,
  },
  bookHeaderContainer: {
    marginBottom: space.lg,
    marginTop: space.sm,
  },
  trackKicker: {
    fontFamily: font.sansBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: palette.accent,
    marginBottom: 4,
  },
  bookTitle: {
    fontFamily: font.serifBold,
    fontSize: 26,
    color: palette.ink,
    marginBottom: 2,
  },
  bookAuthor: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.ink2,
  },
  passageCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...shadow.card,
  },
  instructionsKicker: {
    fontFamily: font.sansBold,
    fontSize: 9.5,
    letterSpacing: 1,
    color: palette.ink3,
    marginBottom: 2,
  },
  instructionsText: {
    fontFamily: font.sansReg,
    fontSize: 12,
    lineHeight: 16,
    color: palette.ink2,
  },
  divider: {
    height: 1,
    backgroundColor: palette.line,
    marginVertical: space.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.xl,
  },
  loadingText: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.ink2,
  },
});

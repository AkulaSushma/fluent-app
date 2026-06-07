import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStore } from '../store/useStore';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import PressableScale from '../components/PressableScale';
import Header from '../components/Header';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  
  const libraryBooks = useStore((s) => s.libraryBooks);
  const fetchLibrary = useStore((s) => s.fetchLibrary);
  const stories = useStore((s) => s.stories);
  const fetchStories = useStore((s) => s.fetchStories);
  const isLoading = useStore((s) => s.isLoadingData);

  useEffect(() => {
    fetchLibrary();
    fetchStories();
  }, [fetchLibrary, fetchStories]);

  const masteryBooks = libraryBooks.filter((b) => b.track === 'mastery');
  const literatureBooks = libraryBooks.filter((b) => b.track === 'storytelling');

  const renderBookCard = (book: any, width: number, height: number, isLandscape: boolean) => {
    return (
      <PressableScale
        key={book.id}
        onPress={() => navigation.navigate('BookReader', { book })}
        style={[
          styles.bookCard,
          {
            width,
            height,
            backgroundColor: book.accent_color || palette.accent,
          },
          shadow.card,
        ]}
      >
        <View style={styles.bookCardInner}>
          <Text style={styles.bookTitle} numberOfLines={isLandscape ? 2 : 3}>
            {book.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {book.author || 'Unknown Author'}
          </Text>
        </View>
        <View style={styles.bookBadge}>
          <Text style={styles.bookBadgeText}>
            {book.chapter_count} Chapters
          </Text>
        </View>
      </PressableScale>
    );
  };

  const renderStoryCard = (story: any, width: number, height: number) => {
    // Determine card background color based on title hash
    const colors = ['#2C3E50', '#8E44AD', '#2980B9', '#D35400', '#27AE60'];
    const idx = Math.abs(story.title.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % colors.length;
    const color = colors[idx];

    return (
      <PressableScale
        key={story.id}
        onPress={() => navigation.navigate('StoryReader', { storyId: story.id })}
        style={[
          styles.bookCard,
          {
            width,
            height,
            backgroundColor: color,
          },
          shadow.card,
        ]}
      >
        <View style={styles.bookCardInner}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {story.title}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            Illustrated Fable
          </Text>
        </View>
        <View style={styles.bookBadge}>
          <Text style={styles.bookBadgeText}>
            Tappable Text
          </Text>
        </View>
      </PressableScale>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Digital Library" showBack={true} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroKicker}>CURATED SELECTION</Text>
          <Text style={styles.heroTitle}>Your Personal Library</Text>
          <Text style={styles.heroSub}>
            Read deeply. Read widely. Expand your vocabulary through etymology analysis and illustrated fables.
          </Text>
        </View>

        {/* Section 1: Premium Mastery Books */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionKicker}>ETYMOLOGY & ROOTS</Text>
            <Text style={styles.sectionTitle}>Premium Mastery Books</Text>
            <Text style={styles.sectionSub}>Norman Lewis · Strunk & White</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {masteryBooks.map((book) => renderBookCard(book, 150, 220, false))}
          </ScrollView>
        </View>

        {/* Section 2: Illustrated Fables */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionKicker}>ILLUSTRATED NARRATIVES</Text>
            <Text style={styles.sectionTitle}>Visual Storytelling Fables</Text>
            <Text style={styles.sectionSub}>Simple public domain tales with interactive lookups</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {stories.map((story) => renderStoryCard(story, 240, 160))}
          </ScrollView>
        </View>

        {/* Section 3: Classic Literature */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionKicker}>CLASSICS & NARRATIVE</Text>
            <Text style={styles.sectionTitle}>Classic Literature</Text>
            <Text style={styles.sectionSub}>Timeless prose for vocabulary expansion</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {literatureBooks.map((book) => renderBookCard(book, 240, 160, true))}
          </ScrollView>
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
    paddingBottom: space.xxl + 40,
  },
  heroSection: {
    paddingHorizontal: space.xl,
    marginBottom: space.xl,
    marginTop: space.sm,
  },
  heroKicker: {
    fontFamily: font.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.5,
    color: palette.accent,
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: font.serifBold,
    fontSize: 30,
    color: palette.ink,
    marginBottom: 8,
  },
  heroSub: {
    fontFamily: font.sansReg,
    fontSize: 14.5,
    lineHeight: 21,
    color: palette.ink2,
  },
  section: {
    marginBottom: space.xxl,
  },
  sectionHeader: {
    paddingHorizontal: space.xl,
    marginBottom: space.md,
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
  },
  sectionSub: {
    fontFamily: font.sansReg,
    fontSize: 12.5,
    color: palette.ink3,
    marginTop: 2,
  },
  horizontalScroll: {
    paddingHorizontal: space.xl,
    gap: space.md,
  },
  bookCard: {
    borderRadius: radius.xl,
    padding: space.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bookCardInner: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bookTitle: {
    fontFamily: font.serifBold,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bookAuthor: {
    fontFamily: font.sansMed,
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  bookBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  bookBadgeText: {
    fontFamily: font.sansSemi,
    fontSize: 10,
    color: '#FFFFFF',
  },
});

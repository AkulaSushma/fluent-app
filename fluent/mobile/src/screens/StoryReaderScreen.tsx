import React, { useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '../components/Header';
import Card from '../components/Card';
import { TappableText } from '../components/TappableText';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import { useStore } from '../store/useStore';

export default function StoryReaderScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { storyId } = route.params || {};

  const stories = useStore((s) => s.stories);
  const fetchStories = useStore((s) => s.fetchStories);

  useEffect(() => {
    if (stories.length === 0) {
      fetchStories();
    }
  }, [stories, fetchStories]);

  const story = stories.find((s) => s.id === storyId);

  if (!story) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header title="Fable Reader" showBack={true} />
        <View style={styles.centered}>
          <ActivityIndicator color={palette.accent} size="large" />
          <Text style={styles.loadingText}>Fetching story...</Text>
        </View>
      </View>
    );
  }

  // Set default illustrations based on story title
  let illustrationUrl = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800';
  if (story.title.includes('Wolf')) {
    illustrationUrl = 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800';
  } else if (story.title.includes('Rabbit')) {
    illustrationUrl = 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800';
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title={story.title} showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify().damping(18)}
          style={styles.illustrationContainer}
        >
          <Image
            source={{ uri: illustrationUrl }}
            style={styles.illustration}
            resizeMode="cover"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify().damping(18)}
          style={styles.textContainer}
        >
          <Text style={styles.instruction}>
            💡 Tap any word to see definitions, etymology components, synonyms, and to record personal memory sentences!
          </Text>

          <Card index={0} style={styles.passageCard}>
            <TappableText passage={story.body} />
          </Card>
        </Animated.View>

        {story.links && story.links.length > 0 ? (
          <Animated.View
            entering={FadeInDown.delay(300).springify().damping(18)}
            style={styles.highlightsContainer}
          >
            <Text style={styles.highlightsTitle}>TARGET VOCABULARY</Text>
            <View style={styles.keywordList}>
              {story.links.map((link) => (
                <View key={link.node_id} style={styles.keywordBadge}>
                  <Text style={styles.keywordText}>{link.highlighted_phrase}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        ) : null}
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
    gap: space.md,
  },
  loadingText: {
    fontFamily: font.sansMed,
    fontSize: 14,
    color: palette.ink2,
  },
  illustrationContainer: {
    marginVertical: space.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: palette.ink,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  illustration: {
    width: '100%',
    height: 200,
  },
  textContainer: {
    marginBottom: space.lg,
  },
  instruction: {
    fontFamily: font.sansMed,
    fontSize: 12,
    lineHeight: 17,
    color: palette.ink3,
    marginBottom: space.sm,
    backgroundColor: palette.line2,
    padding: space.sm,
    borderRadius: radius.sm,
  },
  passageCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...shadow.card,
  },
  highlightsContainer: {
    marginTop: space.md,
  },
  highlightsTitle: {
    fontFamily: font.sansBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: palette.accent,
    marginBottom: space.sm,
  },
  keywordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  keywordBadge: {
    backgroundColor: palette.accentSoft,
    paddingHorizontal: space.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.accent2 + '20',
  },
  keywordText: {
    fontFamily: font.sansBold,
    fontSize: 12,
    color: palette.accent,
  },
});

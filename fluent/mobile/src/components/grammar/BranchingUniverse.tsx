import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';

interface UniverseData {
  title: string;
  type: 'real' | 'hypothetical' | 'impossible';
  formula: string;
  exampleIf: string;
  exampleResult: string;
  explanation: string;
  probability: string;
}

const UNIVERSES: UniverseData[] = [
  {
    title: 'REAL UNIVERSE',
    type: 'real',
    formula: 'If + Present Simple ➔ Will/Can + Verb',
    exampleIf: 'If you deploy the code now,',
    exampleResult: 'it will run in production.',
    explanation: 'High probability. Real scenario in the present or future.',
    probability: '95% Likelihood',
  },
  {
    title: 'HYPOTHETICAL UNIVERSE',
    type: 'hypothetical',
    formula: 'If + Past Simple ➔ Would/Could + Verb',
    exampleIf: 'If I won the hackathon,',
    exampleResult: 'I would buy a new server.',
    explanation: 'Low probability. Imaginary or unlikely scenario.',
    probability: '10% Likelihood',
  },
  {
    title: 'IMPOSSIBLE UNIVERSE',
    type: 'impossible',
    formula: 'If + Past Perfect ➔ Would Have + Past Participle',
    exampleIf: 'If we had run the test suite,',
    exampleResult: 'we would have caught the bug.',
    explanation: 'Zero probability. Past regret or alternative past that never happened.',
    probability: '0% (Too Late)',
  },
];

export default function BranchingUniverse() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const opacity = useSharedValue(1);

  const switchTab = (index: number) => {
    opacity.value = withTiming(0, { duration: 150 }, () => {
      opacity.value = withTiming(1, { duration: 150 });
    });
    // Give a minor delay to sync state change with opacity fade
    setTimeout(() => {
      setActiveTab(index);
    }, 150);
  };

  const current = UNIVERSES[activeTab];

  // Animated style for universe card fading
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Define visual themes per universe
  const getThemeStyles = () => {
    switch (current.type) {
      case 'real':
        return {
          borderColor: palette.accent,
          bgColor: palette.accentSoft,
          kickerColor: palette.accent,
          badgeBg: palette.accent,
          badgeText: '#FFFFFF',
          consequenceColor: palette.accent,
          branchColor: palette.accent,
        };
      case 'hypothetical':
        return {
          borderColor: palette.amber,
          bgColor: palette.amberSoft,
          kickerColor: palette.amber,
          badgeBg: palette.amber,
          badgeText: '#FFFFFF',
          consequenceColor: palette.amber,
          branchColor: palette.gold,
        };
      case 'impossible':
        return {
          borderColor: palette.line,
          bgColor: palette.line2,
          kickerColor: palette.ink3,
          badgeBg: palette.ink3,
          badgeText: '#FFFFFF',
          consequenceColor: palette.ink3,
          branchColor: palette.ink3,
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>MULTIVERSE TABS</Text>
      <Text style={styles.title}>Branching Universe (Conditionals)</Text>
      <Text style={styles.description}>
        Conditionals split reality. Tap the tabs below to explore the probability shift and visual saturation.
      </Text>

      {/* Universe Switcher Tabs */}
      <View style={styles.tabBar}>
        {UNIVERSES.map((uni, idx) => {
          const isActive = idx === activeTab;
          const tabColor = idx === 0 ? palette.accent : idx === 1 ? palette.amber : palette.ink3;
          return (
            <TouchableOpacity
              key={uni.type}
              style={[
                styles.tabButton,
                isActive && styles.activeTabButton,
                isActive && { borderColor: tabColor }
              ]}
              onPress={() => switchTab(idx)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  isActive && styles.activeTabButtonText,
                  isActive && { color: tabColor }
                ]}
              >
                {uni.type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Multiverse Card */}
      <Animated.View
        style={[
          styles.universeCard,
          cardAnimatedStyle,
          {
            borderColor: theme.borderColor,
            backgroundColor: theme.bgColor,
          },
        ]}
      >
        {/* Saturation / Status indicator */}
        <View style={styles.cardHeader}>
          <Text style={[styles.universeKicker, { color: theme.kickerColor }]}>
            {current.title}
          </Text>
          <View style={[styles.probabilityBadge, { backgroundColor: theme.badgeBg }]}>
            <Text style={[styles.probabilityText, { color: theme.badgeText }]}>{current.probability}</Text>
          </View>
        </View>

        {/* Dynamic Formula Symbol */}
        <View style={styles.formulaBox}>
          <Text style={styles.formulaText}>{current.formula}</Text>
        </View>

        {/* Visual Branch Diagram */}
        <View style={styles.diagramArea}>
          <View style={[styles.lineBranch, { backgroundColor: theme.branchColor }]} />
          <View style={styles.cardContent}>
            <Text style={styles.conditionText}>{current.exampleIf}</Text>
            <Text style={[styles.consequenceText, { color: theme.consequenceColor }]}>{current.exampleResult}</Text>
          </View>
        </View>

        <Text style={styles.explanationText}>{current.explanation}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.card,
    padding: space.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.line2,
    ...shadow.card,
    overflow: 'hidden',
  },
  kicker: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.accent,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
    marginBottom: space.sm,
  },
  description: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
    lineHeight: 18,
    marginBottom: space.lg,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.paper,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: space.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: space.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: palette.card,
    ...shadow.card,
  },
  tabButtonText: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.ink3,
  },
  activeTabButtonText: {
    color: palette.ink,
  },
  universeCard: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: space.lg,
    minHeight: 190,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  universeKicker: {
    fontFamily: font.sansBold,
    fontSize: 11,
    letterSpacing: 1,
  },
  probabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  probabilityText: {
    fontFamily: font.sansBold,
    fontSize: 9,
  },
  formulaBox: {
    backgroundColor: palette.paper,
    borderRadius: radius.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    marginVertical: space.md,
    borderWidth: 1,
    borderColor: palette.line2,
  },
  formulaText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 10,
    color: palette.ink2,
    textAlign: 'center',
  },
  diagramArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: space.xs,
  },
  lineBranch: {
    width: 3,
    height: 40,
    backgroundColor: palette.accent,
    borderRadius: 1.5,
    marginRight: space.md,
  },
  cardContent: {
    flex: 1,
  },
  conditionText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.ink,
  },
  consequenceText: {
    fontFamily: font.sansBold,
    fontSize: 14,
    color: palette.accent,
    marginTop: 2,
  },
  explanationText: {
    fontFamily: font.sansReg,
    fontStyle: 'italic',
    fontSize: 11,
    color: palette.ink3,
    marginTop: space.sm,
  },
});

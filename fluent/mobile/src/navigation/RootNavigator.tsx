import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, Pressable, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import VocabScreen from '../screens/VocabScreen';
import GrammarScreen from '../screens/GrammarScreen';
import GrammarHubScreen from '../screens/GrammarHubScreen';
import TeleprompterScreen from '../screens/TeleprompterScreen';
import PlanScreen from '../screens/PlanScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReviewScreen from '../screens/ReviewScreen';
import LearningPathScreen from '../screens/LearningPathScreen';
import TutorScreen from '../screens/TutorScreen';
import ObjectNamingScreen from '../screens/ObjectNamingScreen';
import TechArticleScreen from '../screens/TechArticleScreen';
import TongueTwisterScreen from '../screens/TongueTwisterScreen';
import CorporateCoachScreen from '../screens/CorporateCoachScreen';

import { palette, radius, space, shadow, spring } from '../theme/tokens';
import { font } from '../theme/typography';
import PressableScale from '../components/PressableScale';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const { width: SCREEN_W } = Dimensions.get('window');

/* ------------------------------------------------------------------ */
/*  Stacks                                                             */
/* ------------------------------------------------------------------ */

function TodayStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Plan" component={PlanScreen} />
    </Stack.Navigator>
  );
}

// Simple placeholder/menu screen for the Learn tab
function LearnMenuScreen({ navigation }: any) {
  return (
    <View style={styles.learnScreen}>
      <LinearGradient
        colors={[palette.paper, palette.line2]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.learnHeader}>
          <Text style={styles.learnKicker}>CHOOSE A PATH</Text>
          <Text style={styles.learnTitle}>Interactive Drills</Text>
        </View>

        <View style={styles.learnGrid}>
          {/* 1. Grammar Engine */}
          <PressableScale
            onPress={() => navigation.navigate('GrammarStack', { screen: 'Grammar' })}
            style={[styles.learnCard, shadow.card]}
          >
            <Text style={styles.learnEmoji}>🧩</Text>
            <Text style={styles.learnCardTitle}>Grammar Engine</Text>
            <Text style={styles.learnCardSub}>Polish sentence syntax</Text>
          </PressableScale>

          {/* 2. Tongue Twisters */}
          <PressableScale
            onPress={() => navigation.navigate('TongueTwister')}
            style={[styles.learnCard, shadow.card]}
          >
            <Text style={styles.learnEmoji}>🗣️</Text>
            <Text style={styles.learnCardTitle}>Tongue Twisters</Text>
            <Text style={styles.learnCardSub}>Train speech muscles for English fluency</Text>
          </PressableScale>

          {/* 3. Pronunciation */}
          <PressableScale
            onPress={() => navigation.navigate('TeleprompterStack', { screen: 'Teleprompter' })}
            style={[styles.learnCard, shadow.card]}
          >
            <Text style={styles.learnEmoji}>🎙️</Text>
            <Text style={styles.learnCardTitle}>Pronunciation</Text>
            <Text style={styles.learnCardSub}>Real-time speech evaluation</Text>
          </PressableScale>

          {/* 4. Vocabulary */}
          <PressableScale
            onPress={() => navigation.navigate('VocabStack', { screen: 'Vocab' })}
            style={[styles.learnCard, shadow.card]}
          >
            <Text style={styles.learnEmoji}>💼</Text>
            <Text style={styles.learnCardTitle}>Vocabulary</Text>
            <Text style={styles.learnCardSub}>Master corporate terminology</Text>
          </PressableScale>

          {/* 5. AI Tutor Chat */}
          <PressableScale
            onPress={() => navigation.navigate('TutorStack')}
            style={[styles.learnCard, shadow.card]}
          >
            <Text style={styles.learnEmoji}>🤖</Text>
            <Text style={styles.learnCardTitle}>AI Tutor Chat</Text>
            <Text style={styles.learnCardSub}>Interactive speech & writing coach</Text>
          </PressableScale>

          {/* 6. Corporate Coach */}
          <PressableScale
            onPress={() => navigation.navigate('CorporateCoach')}
            style={[styles.learnCard, shadow.card]}
          >
            <Text style={styles.learnEmoji}>💼</Text>
            <Text style={styles.learnCardTitle}>Corporate Coach</Text>
            <Text style={styles.learnCardSub}>Speak with professional assertiveness</Text>
          </PressableScale>

          {/* 7. Executive Reader */}
          <PressableScale
            onPress={() => navigation.navigate('TechArticle')}
            style={[styles.learnCard, shadow.card]}
          >
            <Text style={styles.learnEmoji}>📰</Text>
            <Text style={styles.learnCardTitle}>Executive Reader</Text>
            <Text style={styles.learnCardSub}>Analyze daily trade-offs & summaries</Text>
          </PressableScale>

          {/* 8. Object Naming */}
          <PressableScale
            onPress={() => navigation.navigate('ObjectNamingStack')}
            style={[styles.learnCard, shadow.card]}
          >
            <Text style={styles.learnEmoji}>🖼️</Text>
            <Text style={styles.learnCardTitle}>Object Naming</Text>
            <Text style={styles.learnCardSub}>Identify everyday advanced objects</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
}

function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LearnHome" component={LearnMenuScreen} />
    </Stack.Navigator>
  );
}

function ProgressStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Progress" component={ProgressScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

const GrammarStackNav = createNativeStackNavigator();

function GrammarNavigator() {
  return (
    <GrammarStackNav.Navigator screenOptions={{ headerShown: false }}>
      <GrammarStackNav.Screen name="Grammar" component={GrammarHubScreen} />
      <GrammarStackNav.Screen name="GrammarLesson" component={GrammarScreen} />
    </GrammarStackNav.Navigator>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom Tab Bar Item                                                */
/* ------------------------------------------------------------------ */

interface TabItemProps {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

function TabItem({ focused, icon, label }: TabItemProps) {
  const lift = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    lift.value = withSpring(focused ? -3 : 0, spring);
    opacity.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused, lift, opacity]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  return (
    <View style={styles.tabItem}>
      <Animated.View style={[styles.dot, dotStyle]} />
      <Animated.View style={iconStyle}>
        <Ionicons
          name={icon}
          size={24}
          color={focused ? palette.accent : palette.ink3}
        />
      </Animated.View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Conic-Glow Animated FAB                                           */
/* ------------------------------------------------------------------ */

function SpeakFAB({ onPress }: { onPress: () => void }) {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(360, {
        duration: 4000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [spin]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  return (
    <View style={styles.fabContainer}>
      {/* Glow Ring Behind */}
      <Animated.View style={[styles.glowRing, spinStyle]}>
        <LinearGradient
          colors={[palette.accent2, palette.gold, palette.accent2]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Actual FAB */}
      <PressableScale onPress={onPress} style={[styles.fab, shadow.fab]}>
        <LinearGradient
          colors={[palette.dark1, palette.dark2]}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.fabInner}>
            <Ionicons name="mic" size={26} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </PressableScale>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Tab Navigator                                                 */
/* ------------------------------------------------------------------ */

function MainTabNavigator({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 84,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
      tabBar={(props) => (
        <BlurView
          intensity={85}
          tint="light"
          style={styles.tabBarContainer}
        >
          <View style={styles.tabBarInner}>
            {props.state.routes.map((route, index) => {
              const isFocused = props.state.index === index;
              const onPress = () => {
                const event = props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name);
                }
              };

              if (route.name === 'SpeakTab') {
                return (
                  <SpeakFAB
                    key={route.key}
                    onPress={() =>
                      navigation.navigate('TeleprompterStack', {
                        screen: 'Teleprompter',
                      })
                    }
                  />
                );
              }

              let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
              let label = 'Today';

              if (route.name === 'TodayTab') {
                iconName = isFocused ? 'home' : 'home-outline';
                label = 'Today';
              } else if (route.name === 'LearnTab') {
                iconName = isFocused ? 'book' : 'book-outline';
                label = 'Learn';
              } else if (route.name === 'ProgressTab') {
                iconName = isFocused ? 'stats-chart' : 'stats-chart-outline';
                label = 'Progress';
              } else if (route.name === 'ProfileTab') {
                iconName = isFocused ? 'person' : 'person-outline';
                label = 'Profile';
              }

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  style={styles.tabPressable}
                >
                  <TabItem
                    focused={isFocused}
                    icon={iconName}
                    label={label}
                  />
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      )}
    >
      <Tab.Screen name="TodayTab" component={TodayStack} />
      <Tab.Screen name="LearnTab" component={LearnStack} />
      <Tab.Screen name="SpeakTab" component={View} />
      <Tab.Screen name="ProgressTab" component={ProgressStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}

/* ------------------------------------------------------------------ */
/*  Root Navigation Stack                                              */
/* ------------------------------------------------------------------ */

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="VocabStack" component={VocabScreen} />
      <Stack.Screen name="GrammarStack" component={GrammarNavigator} />
      <Stack.Screen name="TeleprompterStack" component={TeleprompterScreen} />
      <Stack.Screen name="ReviewStack" component={ReviewScreen} />
      <Stack.Screen name="LearningPath" component={LearningPathScreen} />
      <Stack.Screen name="TutorStack" component={TutorScreen} />
      <Stack.Screen name="ObjectNamingStack" component={ObjectNamingScreen} />
      <Stack.Screen name="TechArticle" component={TechArticleScreen} />
      <Stack.Screen name="TongueTwister" component={TongueTwisterScreen} />
      <Stack.Screen name="CorporateCoach" component={CorporateCoachScreen} />
    </Stack.Navigator>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 88,
    borderTopWidth: 1,
    borderTopColor: 'rgba(232, 227, 218, 0.4)',
    paddingBottom: 16,
  },
  tabBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
  },
  tabPressable: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  dot: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.accent,
  },
  tabLabel: {
    fontFamily: font.sansMed,
    fontSize: 10,
    color: palette.ink3,
    marginTop: 4,
  },
  tabLabelActive: {
    color: palette.accent,
    fontFamily: font.sansSemi,
  },

  /* FAB Styles */
  fabContainer: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  glowRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    opacity: 0.35,
    overflow: 'hidden',
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
  },
  fabInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Learn Tab Placeholder */
  learnScreen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: space.xl,
    paddingTop: 64,
    paddingBottom: 110, // scroll past absolute tab bar
  },
  learnHeader: {
    marginBottom: space.xxl,
  },
  learnKicker: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: palette.ink3,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  learnTitle: {
    fontFamily: font.serifMed,
    fontSize: 32,
    color: palette.ink,
  },
  learnGrid: {
    gap: space.lg,
  },
  learnCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: space.xs,
  },
  learnEmoji: {
    fontSize: 32,
    marginBottom: space.xs,
  },
  learnCardTitle: {
    fontFamily: font.serifMed,
    fontSize: 18,
    color: palette.ink,
  },
  learnCardSub: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
  },
});

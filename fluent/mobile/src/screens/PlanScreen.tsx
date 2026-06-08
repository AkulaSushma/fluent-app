import React, { useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PressableScale from '@/components/PressableScale';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';
import type { CurriculumTaskOut } from '@/api/client';

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();

  const {
    morningTasks,
    eveningTasks,
    curriculumDay,
    curriculumPhase,
    dailyPlanProgress,
    fetchCurriculumToday,
    completeCurriculumTask,
    isLoadingData,
  } = useStore();

  useEffect(() => {
    fetchCurriculumToday();
  }, []);

  const handleTaskPress = (task: CurriculumTaskOut) => {
    // If already completed, just toggle it (or do nothing)
    if (task.completed) {
      completeCurriculumTask(task.id);
      return;
    }

    // Determine target route name
    let targetStack = '';
    let targetScreen = '';
    let params: any = {};

    if (task.type === 'vocab') {
      targetStack = 'VocabStack';
      targetScreen = 'Vocab';
      params = { theme: task.theme };
    } else if (task.type === 'grammar') {
      targetStack = 'GrammarStack';
      targetScreen = 'Grammar';
      params = { topic: task.topic };
    } else if (task.type === 'pronunciation' || task.type === 'speaking' || task.type === 'reading') {
      targetStack = 'TeleprompterStack';
      targetScreen = 'Teleprompter';
      params = { level: task.level, type: task.type };
    } else if (task.type === 'srs' || task.type === 'review' || task.type === 'vocab_review') {
      targetStack = 'ReviewStack';
      targetScreen = 'Review';
    } else if (task.type === 'tutor' || task.type === 'speaking_tutor' || task.type === 'chat') {
      targetStack = 'TutorStack';
      targetScreen = 'Tutor';
    }

    // Mark as completed in backend
    completeCurriculumTask(task.id);

    // Navigate to the drill screen
    if (targetStack) {
      (nav as any).navigate(targetStack, { screen: targetScreen, params });
    }
  };

  const sections = [
    { title: '☀️ Morning Routine', tasks: morningTasks, slot: 'morning' },
    { title: '🌙 Evening Review', tasks: eveningTasks, slot: 'evening' },
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Daily Missions" />

      {isLoadingData && morningTasks.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Structuring daily tasks...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <Animated.View
            entering={FadeInDown.delay(50).springify().damping(18)}
            style={[styles.headerCard, shadow.card]}
          >
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.headerKicker}>
                  DAY {curriculumDay} · {curriculumPhase.toUpperCase()}
                </Text>
                <Text style={styles.headerTitle}>Daily Objectives</Text>
              </View>
              <Text style={styles.progressPercent}>
                {Math.round(dailyPlanProgress * 100)}%
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${dailyPlanProgress * 100}%` as any },
                ]}
              />
            </View>
          </Animated.View>

          {/* List of Tasks grouped by Morning/Evening */}
          {sections.map((sect, sIdx) => {
            if (sect.tasks.length === 0) return null;

            return (
              <Animated.View
                key={sect.slot}
                entering={FadeInDown.delay(100 + sIdx * 100)
                  .springify()
                  .damping(18)}
                style={styles.sectionArea}
              >
                <Text style={styles.sectionTitle}>{sect.title}</Text>
                <Card index={sIdx}>
                  {sect.tasks.map((task, idx) => (
                    <PressableScale
                      key={task.id}
                      onPress={() => handleTaskPress(task)}
                      style={[
                        styles.taskRow,
                        idx < sect.tasks.length - 1 ? styles.taskBorder : undefined,
                      ] as any}
                    >
                      {/* Check mark indicator */}
                      <View
                        style={[
                          styles.checkCircle,
                          task.completed && styles.checkCircleCompleted,
                        ]}
                      >
                        {task.completed && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </View>

                      {/* Text details */}
                      <View style={styles.taskTextCol}>
                        <Text
                          style={[
                            styles.taskTitleText,
                            task.completed && styles.taskCompletedText,
                          ]}
                        >
                          {task.title}
                        </Text>
                        <Text style={styles.taskSubText}>{task.subtitle}</Text>
                      </View>

                      {/* Info & action indicator */}
                      <View style={styles.rightCol}>
                        <Text style={styles.xpReward}>+{task.xp_reward} XP</Text>
                        <Ionicons
                          name={task.completed ? 'checkmark-circle-outline' : 'chevron-forward'}
                          size={18}
                          color={task.completed ? palette.accent : palette.ink3}
                        />
                      </View>
                    </PressableScale>
                  ))}
                </Card>
              </Animated.View>
            );
          })}

          <Animated.View
            entering={FadeInDown.delay(350).springify().damping(18)}
            style={styles.btnArea}
          >
            <Button
              label="Syllabus Journey map"
              variant="ghost"
              onPress={() => nav.navigate('LearningPath' as never)}
              style={styles.pathBtn}
            />
            <Button
              label="Back to dashboard"
              variant="dark"
              onPress={() => nav.goBack()}
            />
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink3,
    marginTop: space.md,
  },
  content: {
    paddingHorizontal: space.xl,
    gap: space.lg,
  },
  headerCard: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  headerKicker: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.ink3,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontFamily: font.serifBold,
    fontSize: 22,
    color: palette.ink,
    marginTop: 4,
  },
  progressPercent: {
    fontFamily: font.sansBold,
    fontSize: 24,
    color: palette.accent,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.line2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.accent,
  },
  sectionArea: {
    gap: space.sm,
  },
  sectionTitle: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.ink2,
    marginLeft: space.xs,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    gap: space.md,
  },
  taskBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.line2,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  taskTextCol: {
    flex: 1,
  },
  taskTitleText: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink,
  },
  taskCompletedText: {
    textDecorationLine: 'line-through',
    color: palette.ink3,
  },
  taskSubText: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
    marginTop: 2,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  xpReward: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: palette.accent2,
    marginRight: 4,
  },
  btnArea: {
    marginTop: space.sm,
    gap: space.sm,
  },
  pathBtn: {
    borderWidth: 1,
    borderColor: palette.line,
  },
});

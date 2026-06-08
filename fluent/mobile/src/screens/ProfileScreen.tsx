import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import Header from '@/components/Header';
import Card from '@/components/Card';
import PressableScale from '@/components/PressableScale';
import Button from '@/components/Button';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { useStore } from '@/store/useStore';
import { requestNotificationPermissions } from '@/utils/notifications';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const {
    name,
    initials,
    level,
    streak,
    fluency,
    words,
    userSettings,
    fetchProgress,
    fetchSettings,
    updateSettings,
    isLoadingData,
    showToast,
    logout,
  } = useStore();

  const [loading, setLoading] = useState(true);

  // Reminders toggle state
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  
  // API key states
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [openrouterKeyInput, setOpenrouterKeyInput] = useState('');
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [isSavingKeys, setIsSavingKeys] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      Promise.all([fetchProgress(), fetchSettings()]).finally(() => {
        setLoading(false);
      });
    }
  }, [isFocused]);

  useEffect(() => {
    if (userSettings) {
      setRemindersEnabled(userSettings.reminders_enabled);
      setGeminiKeyInput(userSettings.gemini_api_key || '');
      setOpenrouterKeyInput(userSettings.openrouter_api_key || '');
      setGroqKeyInput(userSettings.groq_api_key || '');
    }
  }, [userSettings]);

  // Adjust morning timing: hour between 6 and 11
  const adjustMorningHour = (direction: 'up' | 'down') => {
    if (!userSettings) return;
    const timeParts = userSettings.morning_reminder_time.split(':');
    let hour = parseInt(timeParts[0]);
    const min = timeParts[1];

    if (direction === 'up') {
      hour = hour >= 11 ? 6 : hour + 1;
    } else {
      hour = hour <= 6 ? 11 : hour - 1;
    }

    const newTime = `${hour.toString().padStart(2, '0')}:${min}`;
    updateSettings({ morning_reminder_time: newTime });
  };

  const adjustMorningMinute = (direction: 'up' | 'down') => {
    if (!userSettings) return;
    const timeParts = userSettings.morning_reminder_time.split(':');
    const hour = timeParts[0];
    let minute = parseInt(timeParts[1]);

    if (direction === 'up') {
      minute = minute >= 45 ? 0 : minute + 15;
    } else {
      minute = minute <= 0 ? 45 : minute - 15;
    }

    const newTime = `${hour}:${minute.toString().padStart(2, '0')}`;
    updateSettings({ morning_reminder_time: newTime });
  };

  // Adjust evening timing: hour between 15 (3 PM) and 23 (11 PM)
  const adjustEveningHour = (direction: 'up' | 'down') => {
    if (!userSettings) return;
    const timeParts = userSettings.evening_reminder_time.split(':');
    let hour = parseInt(timeParts[0]);
    const min = timeParts[1];

    if (direction === 'up') {
      hour = hour >= 23 ? 15 : hour + 1;
    } else {
      hour = hour <= 15 ? 23 : hour - 1;
    }

    const newTime = `${hour.toString().padStart(2, '0')}:${min}`;
    updateSettings({ evening_reminder_time: newTime });
  };

  const adjustEveningMinute = (direction: 'up' | 'down') => {
    if (!userSettings) return;
    const timeParts = userSettings.evening_reminder_time.split(':');
    const hour = timeParts[0];
    let minute = parseInt(timeParts[1]);

    if (direction === 'up') {
      minute = minute >= 45 ? 0 : minute + 15;
    } else {
      minute = minute <= 0 ? 45 : minute - 15;
    }

    const newTime = `${hour}:${minute.toString().padStart(2, '0')}`;
    updateSettings({ evening_reminder_time: newTime });
  };

  // Adjust daily practice target minutes
  const adjustGoalMinutes = (direction: 'up' | 'down') => {
    if (!userSettings) return;
    let mins = userSettings.daily_goal_minutes;
    if (direction === 'up') {
      mins = Math.min(120, mins + 15);
    } else {
      mins = Math.max(15, mins - 15);
    }
    updateSettings({ daily_goal_minutes: mins });
  };

  const toggleReminders = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        showToast('⚠️', 'Please enable notifications in system settings.');
        setRemindersEnabled(false);
        updateSettings({ reminders_enabled: false });
        return;
      }
    }
    setRemindersEnabled(val);
    updateSettings({ reminders_enabled: val });
  };

  // Helper to format 24h to 12h
  const format12h = (time24: string) => {
    const parts = time24.split(':');
    const hour = parseInt(parts[0]);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${parts[1]} ${ampm}`;
  };

  if (loading && !userSettings) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={palette.accent} />
        <Text style={styles.loadingText}>Fetching profile...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Profile" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <Card index={0}>
          <View style={styles.profileRow}>
            <LinearGradient
              colors={[palette.accent2, palette.accent]}
              style={styles.avatarLarge}
            >
              <Text style={styles.avatarLargeText}>{initials}</Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileSub}>
                Advanced learner · Level {level}
              </Text>
            </View>
          </View>

          {/* stats */}
          <View style={styles.profileStats}>
            <View style={styles.profileStatCol}>
              <Text style={styles.profileStatValue}>{streak}</Text>
              <Text style={styles.profileStatLabel}>Streak</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.profileStatCol}>
              <Text style={styles.profileStatValue}>{fluency}</Text>
              <Text style={styles.profileStatLabel}>Fluency</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.profileStatCol}>
              <Text style={styles.profileStatValue}>
                {words >= 1000 ? `${(words / 1000).toFixed(1)}k` : words}
              </Text>
              <Text style={styles.profileStatLabel}>Words</Text>
            </View>
          </View>
        </Card>

        {/* Daily Goals */}
        {userSettings && (
          <Card index={1}>
            <Text style={styles.cardHeader}>Daily Study Target</Text>
            <View style={styles.settingAdjustRow}>
              <View style={styles.settingDetailsCol}>
                <Text style={styles.settingLabelText}>Target Minutes</Text>
                <Text style={styles.settingValueDesc}>
                  {userSettings.daily_goal_minutes} mins practice / day
                </Text>
              </View>
              <View style={styles.adjustButtonsRow}>
                <PressableScale
                  onPress={() => adjustGoalMinutes('down')}
                  style={styles.adjustBtn}
                >
                  <Ionicons name="remove" size={18} color={palette.ink} />
                </PressableScale>
                <PressableScale
                  onPress={() => adjustGoalMinutes('up')}
                  style={styles.adjustBtn}
                >
                  <Ionicons name="add" size={18} color={palette.ink} />
                </PressableScale>
              </View>
            </View>
          </Card>
        )}

        {/* Push Notifications Settings */}
        {userSettings && (
          <Card index={2}>
            <View style={styles.reminderToggleHeader}>
              <Text style={styles.cardHeader}>Daily Reminder Alerts</Text>
              <Switch
                value={remindersEnabled}
                onValueChange={toggleReminders}
                trackColor={{ false: palette.line2, true: palette.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            {remindersEnabled && (
              <View style={styles.remindersArea}>
                <View style={styles.horizontalDivider} />

                {/* Morning Select */}
                <View style={styles.reminderSettingItem}>
                  <View style={styles.settingDetailsCol}>
                    <Text style={styles.reminderLabelText}>🌅 Morning session</Text>
                    <Text style={styles.timeValueText}>
                      {format12h(userSettings.morning_reminder_time)}
                    </Text>
                    <Text style={styles.timeBoundHint}>Range: 6:00 AM - 11:59 AM</Text>
                  </View>
                  <View style={styles.timeButtonsGrid}>
                    <View style={styles.adjustBtnCol}>
                      <Text style={styles.unitHint}>Hour</Text>
                      <View style={styles.btnDouble}>
                        <PressableScale onPress={() => adjustMorningHour('down')} style={styles.miniBtn}>
                          <Ionicons name="chevron-down" size={14} color={palette.ink} />
                        </PressableScale>
                        <PressableScale onPress={() => adjustMorningHour('up')} style={styles.miniBtn}>
                          <Ionicons name="chevron-up" size={14} color={palette.ink} />
                        </PressableScale>
                      </View>
                    </View>
                    <View style={styles.adjustBtnCol}>
                      <Text style={styles.unitHint}>Min</Text>
                      <View style={styles.btnDouble}>
                        <PressableScale onPress={() => adjustMorningMinute('down')} style={styles.miniBtn}>
                          <Ionicons name="chevron-down" size={14} color={palette.ink} />
                        </PressableScale>
                        <PressableScale onPress={() => adjustMorningMinute('up')} style={styles.miniBtn}>
                          <Ionicons name="chevron-up" size={14} color={palette.ink} />
                        </PressableScale>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.horizontalDivider} />

                {/* Evening Select */}
                <View style={styles.reminderSettingItem}>
                  <View style={styles.settingDetailsCol}>
                    <Text style={styles.reminderLabelText}>🌙 Evening review</Text>
                    <Text style={styles.timeValueText}>
                      {format12h(userSettings.evening_reminder_time)}
                    </Text>
                    <Text style={styles.timeBoundHint}>Range: 3:00 PM - 11:59 PM</Text>
                  </View>
                  <View style={styles.timeButtonsGrid}>
                    <View style={styles.adjustBtnCol}>
                      <Text style={styles.unitHint}>Hour</Text>
                      <View style={styles.btnDouble}>
                        <PressableScale onPress={() => adjustEveningHour('down')} style={styles.miniBtn}>
                          <Ionicons name="chevron-down" size={14} color={palette.ink} />
                        </PressableScale>
                        <PressableScale onPress={() => adjustEveningHour('up')} style={styles.miniBtn}>
                          <Ionicons name="chevron-up" size={14} color={palette.ink} />
                        </PressableScale>
                      </View>
                    </View>
                    <View style={styles.adjustBtnCol}>
                      <Text style={styles.unitHint}>Min</Text>
                      <View style={styles.btnDouble}>
                        <PressableScale onPress={() => adjustEveningMinute('down')} style={styles.miniBtn}>
                          <Ionicons name="chevron-down" size={14} color={palette.ink} />
                        </PressableScale>
                        <PressableScale onPress={() => adjustEveningMinute('up')} style={styles.miniBtn}>
                          <Ionicons name="chevron-up" size={14} color={palette.ink} />
                        </PressableScale>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </Card>
        )}

        {/* AI API Credentials Card */}
        {userSettings && (
          <Card index={3}>
            <Text style={styles.cardHeader}>AI Engine Credentials</Text>
            <Text style={styles.sectionDescText}>
              Provide your personal API keys to run advanced learning models dynamically. Leaving a key empty falls back to the server defaults.
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Google Gemini API Key</Text>
              <TextInput
                style={styles.keyTextInput}
                value={geminiKeyInput}
                onChangeText={setGeminiKeyInput}
                placeholder="gemini-... (Optional)"
                placeholderTextColor={palette.ink3}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>OpenRouter API Key</Text>
              <TextInput
                style={styles.keyTextInput}
                value={openrouterKeyInput}
                onChangeText={setOpenrouterKeyInput}
                placeholder="sk-or-... (Optional)"
                placeholderTextColor={palette.ink3}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Groq API Key</Text>
              <TextInput
                style={styles.keyTextInput}
                value={groqKeyInput}
                onChangeText={setGroqKeyInput}
                placeholder="gsk_... (Optional)"
                placeholderTextColor={palette.ink3}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>

            <Button
              label={isSavingKeys ? "Saving..." : "Save Credentials"}
              variant="dark"
              onPress={async () => {
                setIsSavingKeys(true);
                try {
                  await updateSettings({
                    gemini_api_key: geminiKeyInput.trim() || null,
                    openrouter_api_key: openrouterKeyInput.trim() || null,
                    groq_api_key: groqKeyInput.trim() || null,
                  });
                  showToast('🔑', 'API keys updated successfully!');
                } catch (err) {
                  showToast('❌', 'Failed to update keys.');
                } finally {
                  setIsSavingKeys(false);
                }
              }}
              style={styles.saveKeysBtn}
            />
          </Card>
        )}

        {/* Sign out */}
        <Animated.View
          entering={FadeInDown.delay(200).springify().damping(18)}
        >
          <PressableScale
            onPress={async () => {
              await logout();
              showToast('👋', 'Signed out successfully.');
            }}
            style={styles.signOutBtn}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </PressableScale>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  content: {
    paddingHorizontal: space.xl,
    gap: space.lg,
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

  /* profile large row */
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
    marginBottom: space.xl,
  },
  avatarLarge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    fontFamily: font.sansBold,
    fontSize: 26,
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: font.serifMed,
    fontSize: 23,
    color: palette.ink,
    marginBottom: 3,
  },
  profileSub: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink3,
  },

  /* stat counters */
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: palette.line2,
    paddingTop: space.xl,
  },
  profileStatCol: {
    alignItems: 'center',
    flex: 1,
  },
  profileStatValue: {
    fontFamily: font.serifBold,
    fontSize: 24,
    color: palette.ink,
    marginBottom: 2,
  },
  profileStatLabel: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.ink3,
  },
  verticalDivider: {
    width: 1,
    height: 36,
    backgroundColor: palette.line2,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: palette.line2,
    marginVertical: space.md,
  },

  /* Card settings headers */
  cardHeader: {
    fontFamily: font.serifMed,
    fontSize: 17,
    color: palette.ink,
    marginBottom: space.md,
  },

  /* Adjust styles */
  settingAdjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingDetailsCol: {
    flex: 1,
  },
  settingLabelText: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.ink,
  },
  settingValueDesc: {
    fontFamily: font.sansReg,
    fontSize: 12.5,
    color: palette.ink3,
    marginTop: 2,
  },
  adjustButtonsRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  adjustBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.line2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.line,
  },

  /* reminder selections */
  reminderToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remindersArea: {
    marginTop: space.xs,
  },
  reminderSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.sm,
  },
  reminderLabelText: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.ink,
  },
  timeValueText: {
    fontFamily: font.serifBold,
    fontSize: 22,
    color: palette.accent,
    marginVertical: 4,
  },
  timeBoundHint: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
  },
  timeButtonsGrid: {
    flexDirection: 'row',
    gap: space.sm,
  },
  adjustBtnCol: {
    alignItems: 'center',
    gap: 4,
  },
  unitHint: {
    fontFamily: font.sansReg,
    fontSize: 10,
    color: palette.ink3,
  },
  btnDouble: {
    flexDirection: 'column',
    gap: 4,
  },
  miniBtn: {
    width: 32,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: palette.line2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.line,
  },

  /* sign out button */
  signOutBtn: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.amberSoft,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.amber,
  },
  sectionDescText: {
    fontFamily: font.sansReg,
    fontSize: 12.5,
    color: palette.ink3,
    lineHeight: 18,
    marginBottom: space.md,
  },
  inputContainer: {
    gap: space.xs,
    marginBottom: space.md,
  },
  inputLabel: {
    fontFamily: font.sansSemi,
    fontSize: 13,
    color: palette.ink2,
  },
  keyTextInput: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    backgroundColor: palette.paper,
  },
  saveKeysBtn: {
    marginTop: space.xs,
  },
});

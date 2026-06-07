import { Platform } from 'react-native';
import { NativeModulesProxy } from 'expo-modules-core';

// Stub missing ExpoTopicSubscriptionModule in NativeModulesProxy for Expo Go compatibility.
// This avoids attempting to write directly to the native JSI expo.modules HostObject (which throws).
if (NativeModulesProxy && !NativeModulesProxy.ExpoTopicSubscriptionModule) {
  NativeModulesProxy.ExpoTopicSubscriptionModule = {
    addListener: () => {},
    removeListeners: () => {},
    subscribeToTopicAsync: () => Promise.resolve(null),
    unsubscribeFromTopicAsync: () => Promise.resolve(null),
  };
}


let Notifications: any = null;
let isNotificationsSupported = false;

try {
  // Dynamically require expo-notifications so that any native module failures (like ExpoTopicSubscriptionModule)
  // are caught gracefully and do not crash the app in environments like Expo Go.
  Notifications = require('expo-notifications');
  isNotificationsSupported = true;

  // Set up default notification presentation behavior if successfully imported
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.log(
    '[Notifications] expo-notifications is not supported in this environment (e.g. Expo Go SDK 56):',
    e
  );
}

/**
 * Request permissions for push/local notifications and set up Android channels.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web' || !isNotificationsSupported || !Notifications) {
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Setup Android high importance notification channel
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
        });
      } catch (channelErr) {
        console.log('[Notifications] Channel setup skipped (Expo Go compatibility):', channelErr);
      }
    }

    return true;
  } catch (err) {
    console.log('[Notifications] Failed to request permissions:', err);
    return false;
  }
}

/**
 * Cancels all scheduled alerts and registers new morning/evening daily triggers.
 */
export async function scheduleDailyReminders(
  morningTimeStr: string, // "HH:MM" e.g., "08:00"
  eveningTimeStr: string, // "HH:MM" e.g., "20:00"
  remindersEnabled: boolean
) {
  if (Platform.OS === 'web' || !isNotificationsSupported || !Notifications) {
    return;
  }

  try {
    // 1. Clear all existing alerts to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!remindersEnabled) {
      console.log('[Notifications] Reminders are disabled. All scheduled alerts cancelled.');
      return;
    }

    // Verify permissions are active
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('[Notifications] Permission not granted. Skipping scheduling.');
      return;
    }

    // 2. Schedule Daily Morning Learning reminder
    try {
      const morningParts = morningTimeStr.split(':');
      const morningHour = parseInt(morningParts[0], 10);
      const morningMinute = parseInt(morningParts[1], 10);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Good morning! 🌅',
          body: "Ready for today's English dose? 8 new words and a grammar topic await you!",
          sound: true,
          data: { screen: 'Plan' },
        },
        trigger: Platform.OS === 'ios' ? {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: morningHour,
          minute: morningMinute,
          repeats: true,
        } : {
          hour: morningHour,
          minute: morningMinute,
          repeats: true,
        },
      });
      console.log(`[Notifications] Scheduled daily morning reminder at ${morningTimeStr}`);
    } catch (err) {
      console.error('[Notifications] Failed to schedule morning reminder:', err);
    }

    // 3. Schedule Daily Evening Review reminder
    try {
      const eveningParts = eveningTimeStr.split(':');
      const eveningHour = parseInt(eveningParts[0], 10);
      const eveningMinute = parseInt(eveningParts[1], 10);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Evening review time! 🌙',
          body: "Let's reinforce the vocabulary cards you learned this morning to lock them in.",
          sound: true,
          data: { screen: 'Review' },
        },
        trigger: Platform.OS === 'ios' ? {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: eveningHour,
          minute: eveningMinute,
          repeats: true,
        } : {
          hour: eveningHour,
          minute: eveningMinute,
          repeats: true,
        },
      });
      console.log(`[Notifications] Scheduled daily evening reminder at ${eveningTimeStr}`);
    } catch (err) {
      console.error('[Notifications] Failed to schedule evening reminder:', err);
    }
  } catch (err) {
    console.error('[Notifications] scheduleDailyReminders error:', err);
  }
}

/**
 * Schedules a local push reminder for the 24-Hour Rule.
 */
export async function scheduleSpeakReminder(word: string, nodeId: string) {
  if (Platform.OS === 'web' || !isNotificationsSupported || !Notifications) {
    return;
  }

  try {
    const fireAt = new Date(Date.now() + 20 * 60 * 60 * 1000); // 20 hours later
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Say it out loud ✦',
        body: `You learned "${word}" yesterday. Use it in a sentence today to lock it in.`,
        sound: true,
        data: { screen: 'Teleprompter', word }, // navigates to Speak/Teleprompter tab
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    });
    console.log(`[Notifications] Scheduled 24h speak reminder for "${word}"`);
  } catch (err) {
    console.error('[Notifications] Failed to schedule speak reminder:', err);
  }
}


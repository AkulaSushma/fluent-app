// Monkey-patch expo-notifications warning to prevent crashing in Expo Go on Android
try {
  const warnModule = require('expo-notifications/build/warnOfExpoGoPushUsage');
  if (warnModule && warnModule.warnOfExpoGoPushUsage) {
    warnModule.warnOfExpoGoPushUsage = () => {
      console.log('[expo-notifications] Suppressed Expo Go push notification warning to prevent Android crash.');
    };
  }
} catch (e) {
  // Silent fallback
}

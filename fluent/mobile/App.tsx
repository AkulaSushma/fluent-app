import React from 'react';
import { View, StyleSheet, ActivityIndicator, LogBox } from 'react-native';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '[Notifications] expo-notifications is not supported',
  'setLayoutAnimationEnabledExperimental is currently a no-op',
]);
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import RootNavigator from './src/navigation/RootNavigator';
import { palette } from './src/theme/tokens';
import Toast from './src/components/Toast';
import { useStore } from './src/store/useStore';
import { requestNotificationPermissions } from './src/utils/notifications';

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const autoAuthenticate = useStore((s) => s.autoAuthenticate);
  const isLoadingAuth = useStore((s) => s.isLoadingAuth);

  React.useEffect(() => {
    const initializeApp = async () => {
      if (fontsLoaded) {
        try {
          await requestNotificationPermissions();
        } catch (e) {
          console.warn('Failed to request notification permissions on startup:', e);
        }
        await autoAuthenticate();
      }
    };
    initializeApp();
  }, [fontsLoaded, autoAuthenticate]);

  if (!fontsLoaded || isLoadingAuth) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={palette.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
          <Toast />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: palette.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

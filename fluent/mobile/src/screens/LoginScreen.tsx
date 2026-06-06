import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

import Button from '../components/Button';
import PressableScale from '../components/PressableScale';
import { palette, radius, space, shadow } from '../theme/tokens';
import { font } from '../theme/typography';
import { useStore } from '../store/useStore';

const { width: SCREEN_W } = Dimensions.get('window');

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const storeLogin = useStore((s) => s.login);
  const storeRegister = useStore((s) => s.register);
  const showToast = useStore((s) => s.showToast);

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const toggleTab = (isLogin: boolean) => {
    if (loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoginTab(isLogin);
    setErrorMsg(null);
    setEmail('');
    setName('');
    setPassword('');
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (!isLoginTab && !name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isLoginTab) {
        await storeLogin(email.trim(), password.trim());
        showToast('✨', 'Welcome back!');
      } else {
        await storeRegister(email.trim(), name.trim(), password.trim());
        showToast('🎉', 'Account created successfully!');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    showToast('⚙️', 'Logging into demo account...');

    try {
      // Try login first
      await storeLogin('demo@fluent.app', 'demo123');
      showToast('✨', 'Logged in as Demo User');
    } catch (err: any) {
      // If demo account doesn't exist, register it
      if (err.status === 401 || err.status === 404 || err.status === 0 || err.status === 422) {
        try {
          await storeRegister('demo@fluent.app', 'Aarav Kapoor', 'demo123');
          showToast('🎉', 'Demo account created and logged in!');
        } catch (regErr: any) {
          setErrorMsg(regErr.message || 'Demo access failed.');
        }
      } else {
        setErrorMsg(err.message || 'Demo connection failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={[palette.paper, palette.line2]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Branding */}
          <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <LinearGradient
                colors={[palette.accent2, palette.accent]}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="sparkles" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Fluent</Text>
            <Text style={styles.brandSub}>Elevate your corporate communication presence</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            layout={Layout.springify().damping(22)}
            style={[styles.card, shadow.card]}
          >
            {/* Tabs Selector */}
            <View style={styles.tabsRow}>
              <PressableScale
                onPress={() => toggleTab(true)}
                style={[styles.tabBtn, isLoginTab && styles.tabBtnActive]}
              >
                <Text style={[styles.tabLabel, isLoginTab && styles.tabLabelActive]}>
                  Log In
                </Text>
              </PressableScale>
              <PressableScale
                onPress={() => toggleTab(false)}
                style={[styles.tabBtn, !isLoginTab && styles.tabBtnActive]}
              >
                <Text style={[styles.tabLabel, !isLoginTab && styles.tabLabelActive]}>
                  Sign Up
                </Text>
              </PressableScale>
            </View>

            {/* Error Message */}
            {errorMsg && (
              <Animated.View entering={FadeInDown} style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={palette.amber} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </Animated.View>
            )}

            {/* Input fields */}
            <View style={styles.form}>
              {!isLoginTab && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>YOUR NAME</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={18} color={palette.ink3} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Aarav Kapoor"
                      placeholderTextColor={palette.ink3}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      editable={!loading}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={palette.ink3} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="name@company.com"
                    placeholderTextColor={palette.ink3}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={palette.ink3} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••"
                    placeholderTextColor={palette.ink3}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <PressableScale
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                      size={18}
                      color={palette.ink3}
                    />
                  </PressableScale>
                </View>
              </View>

              {/* Submit Button */}
              <View style={styles.submitContainer}>
                {loading ? (
                  <View style={styles.loadingSpinner}>
                    <ActivityIndicator size="small" color={palette.accent} />
                  </View>
                ) : (
                  <Button
                    label={isLoginTab ? 'Access Your Workspace' : 'Initialize Account'}
                    variant="accent"
                    onPress={handleAuth}
                    style={styles.submitBtn}
                  />
                )}
              </View>
            </View>
          </Animated.View>

          {/* Quick Demo Shortcut */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.demoContainer}>
            <Text style={styles.demoLabel}>Just testing the interface?</Text>
            <PressableScale
              onPress={handleDemoLogin}
              disabled={loading}
              style={[styles.demoCard, shadow.card]}
            >
              <View style={styles.demoLeft}>
                <View style={styles.demoBadgeCircle}>
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.demoTextCol}>
                  <Text style={styles.demoTitle}>One-Click Demo Account</Text>
                  <Text style={styles.demoSub}>Instantly access all features without credentials</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={16} color={palette.accent} />
            </PressableScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: space.xxl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
    shadowColor: palette.accent,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  brandTitle: {
    fontFamily: font.serifBold,
    fontSize: 34,
    color: palette.ink,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink2,
    textAlign: 'center',
    marginTop: space.xs,
    paddingHorizontal: space.xl,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(232, 227, 218, 0.4)',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: palette.line2,
    marginBottom: space.lg,
  },
  tabBtn: {
    flex: 1,
    paddingBottom: space.md,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: palette.accent,
  },
  tabLabel: {
    fontFamily: font.sansMed,
    fontSize: 15,
    color: palette.ink3,
  },
  tabLabelActive: {
    color: palette.accent,
    fontFamily: font.sansBold,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.amberSoft,
    padding: space.md,
    borderRadius: radius.sm,
    marginBottom: space.lg,
    gap: space.sm,
  },
  errorText: {
    fontFamily: font.sansReg,
    fontSize: 12,
    color: palette.amber,
    flex: 1,
  },
  form: {
    gap: space.md,
  },
  inputContainer: {
    gap: space.xs,
  },
  inputLabel: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.ink3,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.line2,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(23, 21, 17, 0.05)',
  },
  inputIcon: {
    marginRight: space.sm,
  },
  textInput: {
    flex: 1,
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink,
    height: '100%',
  },
  eyeBtn: {
    padding: space.sm,
  },
  submitContainer: {
    marginTop: space.md,
  },
  submitBtn: {
    height: 52,
    borderRadius: radius.md,
  },
  loadingSpinner: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoContainer: {
    alignItems: 'center',
    marginTop: space.xxl,
    gap: space.sm,
  },
  demoLabel: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink2,
  },
  demoCard: {
    backgroundColor: palette.card,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(232, 227, 218, 0.4)',
  },
  demoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flex: 1,
  },
  demoBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTextCol: {
    flex: 1,
    gap: 2,
  },
  demoTitle: {
    fontFamily: font.sansSemi,
    fontSize: 14,
    color: palette.ink,
  },
  demoSub: {
    fontFamily: font.sansReg,
    fontSize: 11,
    color: palette.ink3,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import PressableScale from '@/components/PressableScale';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';
import { api } from '@/api/client';
import { useStore } from '@/store/useStore';
import { speakSweetly } from '@/utils/speech';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_SUGGESTIONS = [
  '💬 Tell me a motivational quote!',
  '☕ Let\'s talk about morning routines.',
  '💼 Practice for a job interview.',
  '🧩 Correct my English grammar.',
];

/* ------------------------------------------------------------------ */
/*  Typing Indicator Bubble                                            */
/* ------------------------------------------------------------------ */
function TypingIndicator() {
  const dot1 = useSharedValue(0.4);
  const dot2 = useSharedValue(0.4);
  const dot3 = useSharedValue(0.4);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.4, { duration: 300 })
      ),
      -1,
      true
    );
    // Delay subsequent dots to create a wave effect
    setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.4, { duration: 300 })
        ),
        -1,
        true
      );
    }, 150);
    setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.4, { duration: 300 })
        ),
        -1,
        true
      );
    }, 300);
  }, []);

  const d1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const d2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const d3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
      <Animated.View style={[styles.typingDot, d1Style]} />
      <Animated.View style={[styles.typingDot, d2Style]} />
      <Animated.View style={[styles.typingDot, d3Style]} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function TutorScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const { showToast, logPracticeSession, fireConfetti } = useStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hello! I am your Engura AI Coach. 🤖 Let's practice speaking and writing English together today! What topic would you like to chat about?",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [hasLoggedSession, setHasLoggedSession] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  // Auto-speak welcome message on mount if voice is enabled
  useEffect(() => {
    const timer = setTimeout(() => {
      if (voiceEnabled) {
        speakSweetly("Hello! I am your Engura AI Coach. Let's practice speaking and writing English together today! What topic would you like to chat about?");
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      try {
        const Speech = require('expo-speech');
        Speech.stop().catch(() => {});
      } catch (e) {}
    };
  }, []);

  const toggleVoice = () => {
    const nextVal = !voiceEnabled;
    setVoiceEnabled(nextVal);
    if (!nextVal) {
      try {
        const Speech = require('expo-speech');
        Speech.stop().catch(() => {});
      } catch (e) {}
      showToast('🔇', 'Voice output muted');
    } else {
      showToast('🔊', 'Voice output enabled');
      speakSweetly('Voice enabled');
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Load conversation history on mount
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const history = await api.getTutorHistory();
        if (isMounted && history && history.length > 0) {
          const mapped: Message[] = history.map((m, idx) => ({
            id: `hist_${idx}_${Date.now()}`,
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));
          setMessages(mapped);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 200);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessageText = textToSend.trim();
    setInputText('');

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageText,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    scrollToBottom();
    setIsTyping(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Map Message history format to backend history schema format
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await api.tutorChat(history, userMessageText);

      const newTutorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, newTutorMsg]);
      scrollToBottom();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (voiceEnabled) {
        speakSweetly(res.reply);
      }
    } catch (err) {
      console.error('Tutor chat failed:', err);
      setIsTyping(false);
      showToast('⚠️', 'Connection timed out. Retrying...');
    }
  };

  const handleEndSession = async () => {
    if (hasLoggedSession) {
      nav.goBack();
      return;
    }

    setIsEnding(true);
    showToast('💾', 'Saving conversational progress...');

    try {
      // Award XP for 3 minutes conversation (approx. 90 XP reward)
      await logPracticeSession('tutor', 3, 90);
      setHasLoggedSession(true);
      fireConfetti();
      showToast('🎉', 'Chat Session complete! +90 XP Awarded.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        nav.goBack();
      }, 1500);
    } catch (err) {
      console.error('Failed to log tutor session:', err);
      setIsEnding(false);
      nav.goBack();
    }
  };

  const renderMessageItem = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.role === 'user';
    return (
      <Animated.View
        entering={FadeInDown.delay(50).springify().damping(20)}
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.assistantRow,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarIcon}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {item.content}
          </Text>
        </View>
        {!isUser && (
          <PressableScale
            onPress={() => speakSweetly(item.content)}
            style={styles.tutorSpeakBtn}
          >
            <Ionicons name="volume-medium-outline" size={16} color={palette.accent} />
          </PressableScale>
        )}
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <Header
          title="Conversation Tutor"
          right={
            <View style={styles.headerRightRow}>
              <PressableScale onPress={toggleVoice} style={styles.voiceToggleBtn}>
                <Ionicons
                  name={voiceEnabled ? 'volume-high' : 'volume-mute'}
                  size={18}
                  color={voiceEnabled ? palette.accent : palette.ink3}
                />
              </PressableScale>
              <Button
                label="End Chat"
                variant="accent"
                size="sm"
                onPress={handleEndSession}
                disabled={isEnding}
              />
            </View>
          }
        />
        <View style={styles.onlineBanner}>
          <View style={styles.onlineIndicator} />
          <Text style={styles.onlineText}>Engura AI Assistant Active</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messageList}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            horizontal
            data={QUICK_SUGGESTIONS}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
            renderItem={({ item }) => (
              <PressableScale
                onPress={() => handleSendMessage(item.substring(2))}
                style={styles.suggestionChip}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </PressableScale>
            )}
          />
        </View>
      )}

      {/* Input area */}
      <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Speak to your Engura Coach..."
          placeholderTextColor={palette.ink3}
          style={styles.textInput}
          onSubmitEditing={() => handleSendMessage(inputText)}
        />
        <PressableScale
          onPress={() => handleSendMessage(inputText)}
          style={[styles.sendBtn, !inputText.trim() ? styles.sendBtnDisabled : null] as any}
          disabled={!inputText.trim() || isTyping}
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  headerContainer: {
    backgroundColor: palette.paper,
    borderBottomWidth: 1,
    borderBottomColor: palette.line2,
  },
  onlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingBottom: space.xs,
    marginTop: -space.xs,
  },
  onlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981', // Emerald green
  },
  onlineText: {
    fontFamily: font.sansReg,
    fontSize: 10,
    color: palette.ink2,
  },

  /* Message List */
  messageList: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.xl,
    gap: space.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.xs,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  assistantRow: {
    alignSelf: 'flex-start',
  },
  avatarIcon: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  messageBubble: {
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: palette.accent,
    borderBottomRightRadius: 2,
  },
  assistantBubble: {
    backgroundColor: palette.card,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: palette.line2,
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  userText: {
    fontFamily: font.sansReg,
    color: '#FFFFFF',
  },
  assistantText: {
    fontFamily: font.sansReg,
    color: palette.ink,
  },

  /* Typing Dots */
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 56,
    height: 36,
    alignSelf: 'flex-start',
    marginLeft: 24, // aligned with bubbles next to avatar
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: palette.ink2,
  },

  /* Suggestion Chips */
  suggestionsContainer: {
    paddingVertical: space.sm,
    backgroundColor: palette.paper,
  },
  suggestionsList: {
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
  },
  suggestionText: {
    fontFamily: font.sansMed,
    fontSize: 12,
    color: palette.ink2,
  },

  /* Input Panel */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    backgroundColor: palette.paper,
    borderTopWidth: 1,
    borderTopColor: palette.line2,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    paddingHorizontal: space.lg,
    fontFamily: font.sansReg,
    fontSize: 14,
    color: palette.ink,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: palette.ink3,
    opacity: 0.5,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  voiceToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  tutorSpeakBtn: {
    padding: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.accentSoft,
    alignSelf: 'center',
    marginLeft: 6,
  },
});

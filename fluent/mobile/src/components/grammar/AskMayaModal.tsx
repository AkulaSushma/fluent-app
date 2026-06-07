import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { api } from '@/api/client';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';

interface AskMayaModalProps {
  visible: boolean;
  onClose: () => void;
  userAnswer: string;
  correctAnswer: string;
  concept: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AskMayaModal({
  visible,
  onClose,
  userAnswer,
  correctAnswer,
  concept,
}: AskMayaModalProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [userLockInAnswer, setUserLockInAnswer] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [tutorReply, setTutorReply] = useState<string>('');
  const [gradingLoading, setGradingLoading] = useState(false);
  const [gradingResult, setGradingResult] = useState<string>('');

  const loadedRef = useRef(false);

  useEffect(() => {
    if (visible && userAnswer && correctAnswer && !loadedRef.current) {
      fetchExplanation();
      loadedRef.current = true;
    }
  }, [visible, userAnswer, correctAnswer]);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!visible) {
      setExplanation('');
      setUserLockInAnswer('');
      setTutorReply('');
      setGradingResult('');
      setChatHistory([]);
      loadedRef.current = false;
    }
  }, [visible]);

  const fetchExplanation = async () => {
    setLoading(true);
    setExplanation('');
    try {
      const prompt = `You are Maya, a senior English tutor for tech professionals.
The user wrote: "${userAnswer}"
The correct answer was: "${correctAnswer}"
The grammar concept: "${concept}"

Respond in EXACTLY this format:
1. One-line empathetic acknowledgment (no "great question" filler)
2. Show the difference in a code-block format:
 ❌ ${userAnswer}
 ✅ ${correctAnswer}
3. Explain WHY in 2 sentences, using a workplace analogy
4. Give 1 mini-exercise to lock it in

Tone: peer-level, warm, never patronizing. Max 80 words total.`;

      // Call API
      const res = await api.tutorChat([], prompt);
      setExplanation(res.reply);
      setChatHistory([
        { role: 'user', content: prompt },
        { role: 'assistant', content: res.reply },
      ]);
    } catch (err) {
      console.error('Ask Maya tutor call failed:', err);
      setExplanation(
        `Hey there! Don't worry, mistakes are part of the process.\n\n❌ ${userAnswer}\n✅ ${correctAnswer}\n\nThink of this like passing the wrong parameter to a function; the compiler expects ${correctAnswer} in this context. Let's practice: try rewriting "${userAnswer}" correctly.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLockIn = async () => {
    if (!userLockInAnswer.trim()) return;
    setGradingLoading(true);
    setGradingResult('');
    try {
      const nextHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', content: `My answer to the lock-in exercise is: "${userLockInAnswer}"` },
      ];
      
      const prompt = `Grade my answer to your lock-in exercise. 
My answer: "${userLockInAnswer}"
Explain if it is correct or incorrect in 1 short sentence, keep it under 30 words, and encourage me.`;

      const res = await api.tutorChat(nextHistory.slice(-4), prompt);
      setGradingResult(res.reply);
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: `My answer: "${userLockInAnswer}"` },
        { role: 'assistant', content: res.reply },
      ]);
    } catch (err) {
      console.error('Ask Maya grading failed:', err);
      setGradingResult('Looks good! Keep pushing code and learning.');
    } finally {
      setGradingLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.avoidingView}
        >
          <View style={styles.sheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandleRow}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleGroup}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>🤖</Text>
                </View>
                <View>
                  <Text style={styles.title}>Ask Maya</Text>
                  <Text style={styles.subtitle}>AI Tutor • Senior Dev Coach</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content Area */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={palette.accent} />
                  <Text style={styles.loaderText}>Maya is analyzing your response...</Text>
                </View>
              ) : (
                <View style={styles.explanationBody}>
                  {/* Response container */}
                  <View style={styles.bubble}>
                    <Text style={styles.bubbleText}>{explanation}</Text>
                  </View>

                  {/* Interactive input for Lock-in Exercise */}
                  {explanation && !gradingResult && (
                    <View style={styles.lockInContainer}>
                      <Text style={styles.lockInTitle}>TRY THE LOCK-IN EXERCISE:</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Type your exercise answer here..."
                        placeholderTextColor={palette.ink3}
                        value={userLockInAnswer}
                        onChangeText={setUserLockInAnswer}
                        multiline
                      />
                      <TouchableOpacity
                        style={[
                          styles.verifyButton,
                          !userLockInAnswer.trim() && styles.disabledButton,
                        ]}
                        onPress={handleVerifyLockIn}
                        disabled={!userLockInAnswer.trim() || gradingLoading}
                      >
                        {gradingLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.verifyButtonText}>Submit Answer</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Grading Feedback */}
                  {gradingResult && (
                    <View style={styles.feedbackContainer}>
                      <Text style={styles.feedbackHeader}>FEEDBACK FROM MAYA</Text>
                      <Text style={styles.feedbackText}>{gradingResult}</Text>
                      <TouchableOpacity
                        style={styles.doneButton}
                        onPress={onClose}
                      >
                        <Text style={styles.doneButtonText}>Got it, thanks!</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 21, 17, 0.45)',
    justifyContent: 'flex-end',
  },
  avoidingView: {
    width: '100%',
    maxHeight: '85%',
  },
  sheetContainer: {
    backgroundColor: palette.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.fab,
  },
  dragHandleRow: {
    alignItems: 'center',
    paddingTop: space.md,
    paddingBottom: space.xs,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.line,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.line2,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: space.md,
  },
  avatarText: {
    fontSize: 18,
  },
  title: {
    fontFamily: font.serifMed,
    fontSize: 20,
    color: palette.ink,
  },
  subtitle: {
    fontFamily: font.sansReg,
    fontSize: 10,
    color: palette.ink3,
  },
  closeButton: {
    padding: space.sm,
  },
  closeText: {
    color: palette.ink3,
    fontSize: 16,
    fontFamily: font.sansBold,
  },
  scrollContent: {
    padding: space.lg,
  },
  loaderContainer: {
    paddingVertical: space.xxl,
    alignItems: 'center',
  },
  loaderText: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink3,
    marginTop: space.md,
    textAlign: 'center',
  },
  explanationBody: {
    gap: space.lg,
  },
  bubble: {
    backgroundColor: palette.paper,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: palette.line2,
  },
  bubbleText: {
    fontFamily: font.sansReg,
    fontSize: 13.5,
    color: palette.ink,
    lineHeight: 20,
  },
  lockInContainer: {
    backgroundColor: palette.accentSoft,
    borderWidth: 1,
    borderColor: palette.accent2,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  lockInTitle: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.accent,
    letterSpacing: 1.5,
    marginBottom: space.md,
  },
  input: {
    backgroundColor: palette.card,
    borderRadius: radius.md,
    padding: space.md,
    color: palette.ink,
    fontFamily: font.sansReg,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: palette.line,
  },
  verifyButton: {
    backgroundColor: palette.accent,
    paddingVertical: space.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontFamily: font.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  feedbackContainer: {
    backgroundColor: palette.amberSoft,
    borderWidth: 1,
    borderColor: palette.gold,
    borderRadius: radius.lg,
    padding: space.lg,
    alignItems: 'center',
  },
  feedbackHeader: {
    fontFamily: font.sansBold,
    fontSize: 10,
    color: palette.amber,
    letterSpacing: 1.5,
    marginBottom: space.sm,
  },
  feedbackText: {
    fontFamily: font.sansBold,
    fontSize: 13.5,
    color: palette.ink,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: space.lg,
  },
  doneButton: {
    backgroundColor: palette.accent,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.md,
  },
  doneButtonText: {
    fontFamily: font.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});

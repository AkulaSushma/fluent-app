import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';

interface CameraFlipProps {
  activeSentence?: string; // e.g. "The developer wrote the code"
  passiveSentence?: string; // e.g. "The code was written by the developer"
  subject?: string; // e.g. "The developer"
  verb?: string; // e.g. "wrote" (or "was written")
  object?: string; // e.g. "the code"
}

export default function CameraFlip({
  activeSentence = "The developer wrote the code.",
  passiveSentence = "The code was written by the developer.",
  subject = "The developer",
  verb = "wrote",
  object = "the code",
}: CameraFlipProps) {
  const [isPassive, setIsPassive] = useState(false);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    rotateY.value = withTiming(isPassive ? 180 : 0, { duration: 600 });
  }, [isPassive]);

  // Animated styles for Front (Active) and Back (Passive)
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      rotateY.value,
      [0, 180],
      [0, 180],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      rotateY.value,
      [0, 180],
      [180, 360],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>CAMERA METAPHOR</Text>
      <Text style={styles.title}>Camera Flip (Active vs. Passive)</Text>
      <Text style={styles.description}>
        Active voice focuses on the <Text style={styles.highlightSubject}>Doer (Subject)</Text>. 
        Passive voice flips the camera focus to the <Text style={styles.highlightObject}>Receiver (Object)</Text>.
      </Text>

      {/* Card Container */}
      <View style={styles.cardContainer}>
        {/* Front Card: Active */}
        <Animated.View style={[styles.card, styles.frontCard, frontAnimatedStyle]}>
          <Text style={styles.cardHeader}>ACTIVE VOICE</Text>
          <View style={styles.visualGroup}>
            {/* Subject - Focused (Glow) */}
            <View style={[styles.entityBox, styles.focusedSubject]}>
              <Text style={styles.entityLabel}>DOER (SUBJECT)</Text>
              <Text style={styles.entityText}>{subject}</Text>
            </View>

            {/* Action Arrow */}
            <View style={styles.actionArrowContainer}>
              <Text style={styles.actionText}>{verb}</Text>
              <Text style={styles.arrowIcon}>➔</Text>
            </View>

            {/* Object - Unfocused */}
            <View style={[styles.entityBox, styles.unfocusedEntity]}>
              <Text style={styles.entityLabel}>RECEIVER</Text>
              <Text style={styles.entityText}>{object}</Text>
            </View>
          </View>
          
          <View style={styles.sentenceOverlay}>
            <Text style={styles.sentenceText}>
              <Text style={styles.boldSubject}>{subject}</Text> <Text style={styles.boldVerb}>{verb}</Text> {object}.
            </Text>
          </View>
        </Animated.View>

        {/* Back Card: Passive */}
        <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
          <Text style={[styles.cardHeader, { color: palette.amber }]}>PASSIVE VOICE</Text>
          <View style={styles.visualGroup}>
            {/* Object - Focused (Glow) */}
            <View style={[styles.entityBox, styles.focusedObject]}>
              <Text style={styles.entityLabel}>RECEIVER (OBJECT)</Text>
              <Text style={styles.entityText}>{object}</Text>
            </View>

            {/* Action Arrow Backwards */}
            <View style={styles.actionArrowContainer}>
              <Text style={styles.actionText}>was written by</Text>
              <Text style={styles.arrowIcon}>➔</Text>
            </View>

            {/* Subject - Unfocused */}
            <View style={[styles.entityBox, styles.unfocusedEntity]}>
              <Text style={styles.entityLabel}>DOER</Text>
              <Text style={styles.entityText}>{subject}</Text>
            </View>
          </View>

          <View style={styles.sentenceOverlay}>
            <Text style={styles.sentenceText}>
              <Text style={styles.boldObject}>{object}</Text> <Text style={[styles.boldVerb, { color: palette.amber }]}>was written by</Text> {subject}.
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Control Switch */}
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsPassive(prev => !prev)}
        activeOpacity={0.8}
      >
        <Text style={styles.switchButtonText}>
          Flip Camera to {isPassive ? "Active Voice" : "Passive Voice"}
        </Text>
      </TouchableOpacity>
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
    marginBottom: space.xl,
  },
  highlightSubject: {
    color: palette.accent,
    fontFamily: font.sansBold,
  },
  highlightObject: {
    color: palette.amber,
    fontFamily: font.sansBold,
  },
  cardContainer: {
    height: 200,
    position: 'relative',
    marginBottom: space.lg,
    zIndex: 1,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  frontCard: {
    backgroundColor: palette.card,
    borderColor: palette.accentSoft,
    ...shadow.card,
  },
  backCard: {
    backgroundColor: palette.card,
    borderColor: palette.amberSoft,
    ...shadow.card,
  },
  cardHeader: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: palette.accent,
    letterSpacing: 1,
    alignSelf: 'flex-start',
  },
  visualGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: space.md,
  },
  entityBox: {
    flex: 1,
    padding: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedSubject: {
    backgroundColor: palette.accentSoft,
    borderColor: palette.accent,
    shadowColor: palette.accent,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  focusedObject: {
    backgroundColor: palette.amberSoft,
    borderColor: palette.amber,
    shadowColor: palette.amber,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  unfocusedEntity: {
    backgroundColor: 'transparent',
    borderColor: palette.line,
  },
  entityLabel: {
    fontFamily: font.sansBold,
    fontSize: 8,
    color: palette.ink3,
    marginBottom: 4,
    textAlign: 'center',
  },
  entityText: {
    fontFamily: font.sansBold,
    fontSize: 13,
    color: palette.ink,
    textAlign: 'center',
  },
  actionArrowContainer: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: font.sansReg,
    fontStyle: 'italic',
    fontSize: 9,
    color: palette.ink3,
    textAlign: 'center',
    marginBottom: 2,
  },
  arrowIcon: {
    color: palette.amber,
    fontSize: 16,
  },
  sentenceOverlay: {
    backgroundColor: palette.paper,
    padding: space.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  sentenceText: {
    fontFamily: font.sansReg,
    fontSize: 13,
    color: palette.ink,
  },
  boldSubject: {
    fontFamily: font.sansBold,
    color: palette.accent,
  },
  boldObject: {
    fontFamily: font.sansBold,
    color: palette.amber,
  },
  boldVerb: {
    fontFamily: font.sansBold,
    color: palette.gold,
  },
  switchButton: {
    backgroundColor: palette.accent,
    paddingVertical: space.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.accent2,
  },
  switchButtonText: {
    fontFamily: font.sansBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});

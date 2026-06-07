import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, radius, space, shadow } from '@/theme/tokens';
import { font } from '@/theme/typography';

interface RiverOfTimeProps {
  shape: string; // 'dot' | 'line' | 'two_dots' | 'line_to_dot' | 'pulse' | 'line_now' | 'arrow_now' | 'line_arrow_now' | 'future_dot' | 'future_line' | 'future_two_dots' | 'future_line_to_dot'
  labelLeft?: string;
  labelRight?: string;
  marker?: string;
}

export default function RiverOfTime({
  shape,
  labelLeft = 'Past',
  labelRight = 'Future',
  marker = 'Now',
}: RiverOfTimeProps) {
  // Animation values
  const lineProgress = useSharedValue(0);
  const dotScale = useSharedValue(0);
  const nowPulse = useSharedValue(1);

  useEffect(() => {
    // Reset
    lineProgress.value = 0;
    dotScale.value = 0;

    // Trigger animations
    lineProgress.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.quad),
    });

    dotScale.value = withDelay(
      600,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.back(1.4)),
      })
    );

    nowPulse.value = withRepeat(
      withTiming(1.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [shape]);

  const animatedLineStyle = useAnimatedStyle(() => ({
    width: `${lineProgress.value * 100}%` as any,
  }));

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: nowPulse.value }],
    opacity: 1 - (nowPulse.value - 1) / 0.4,
  }));

  // Render visual shape elements inside the timeline
  const renderShapeElements = () => {
    switch (shape) {
      case 'dot': // Simple Past
        return (
          <Animated.View style={[styles.timeShapeDot, { left: '25%' }, animatedDotStyle]} />
        );
      case 'line': // Past Continuous
        return (
          <Animated.View style={[styles.timeShapeSegment, { left: '10%', width: '35%' }, animatedLineStyle]} />
        );
      case 'two_dots': // Past Perfect
        return (
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.timeShapeDot, { left: '15%' }, animatedDotStyle]} />
            <Animated.View style={[styles.timeShapeDot, { left: '35%' }, animatedDotStyle]} />
            <Animated.View style={[styles.timeShapeArrow, { left: '20%', width: '12%' }, animatedLineStyle]}>
              <Text style={styles.arrowText}>→</Text>
            </Animated.View>
          </View>
        );
      case 'line_to_dot': // Past Perfect Continuous
        return (
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.timeShapeSegment, { left: '10%', width: '22%' }, animatedLineStyle]} />
            <Animated.View style={[styles.timeShapeDot, { left: '32%' }, animatedDotStyle]} />
            <Animated.View style={[styles.timeShapeArrow, { left: '20%', width: '12%' }, animatedLineStyle]}>
              <Text style={styles.arrowText}>→</Text>
            </Animated.View>
          </View>
        );
      case 'pulse': // Simple Present
        return (
          <Animated.View style={[styles.timeShapeDot, { left: '50%', backgroundColor: palette.amber }, animatedDotStyle]} />
        );
      case 'line_now': // Present Continuous
        return (
          <Animated.View style={[styles.timeShapeSegment, { left: '38%', width: '24%', backgroundColor: palette.amber }, animatedLineStyle]} />
        );
      case 'arrow_now': // Present Perfect
        return (
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.timeShapeSegment, { left: '20%', width: '30%', backgroundColor: palette.gold }]} />
            <Animated.View style={[styles.timeShapeDot, { left: '50%', backgroundColor: palette.gold }, animatedDotStyle]} />
          </View>
        );
      case 'line_arrow_now': // Present Perfect Continuous
        return (
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.timeShapeSegment, { left: '15%', width: '35%', backgroundColor: palette.gold }, animatedLineStyle]} />
            <Animated.View style={[styles.timeShapeDot, { left: '50%', backgroundColor: palette.gold }, animatedDotStyle]} />
          </View>
        );
      case 'future_dot': // Simple Future
        return (
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.timeShapeArrow, { left: '50%', width: '22%' }, animatedLineStyle]}>
              <Text style={styles.arrowText}>→</Text>
            </Animated.View>
            <Animated.View style={[styles.timeShapeDot, { left: '72%', backgroundColor: palette.accent }, animatedDotStyle]} />
          </View>
        );
      case 'future_line': // Future Continuous
        return (
          <Animated.View style={[styles.timeShapeSegment, { left: '60%', width: '30%', backgroundColor: palette.accent }, animatedLineStyle]} />
        );
      case 'future_two_dots': // Future Perfect
        return (
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.timeShapeDot, { left: '60%', backgroundColor: palette.accent }, animatedDotStyle]} />
            <Animated.View style={[styles.timeShapeDot, { left: '80%', backgroundColor: palette.accent }, animatedDotStyle]} />
            <Animated.View style={[styles.timeShapeArrow, { left: '65%', width: '12%' }, animatedLineStyle]}>
              <Text style={styles.arrowText}>→</Text>
            </Animated.View>
          </View>
        );
      case 'future_line_to_dot': // Future Perfect Continuous
        return (
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.timeShapeSegment, { left: '60%', width: '20%', backgroundColor: palette.accent }, animatedLineStyle]} />
            <Animated.View style={[styles.timeShapeDot, { left: '80%', backgroundColor: palette.accent }, animatedDotStyle]} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>VISUAL THEATRE</Text>
      <Text style={styles.title}>The River of Time</Text>
      
      {/* Universal Timeline Canvas */}
      <View style={styles.canvas}>
        <View style={styles.timelineTrack}>
          {/* Warm Gradient Line */}
          <LinearGradient
            colors={[palette.accentSoft, palette.accent2, palette.amber, palette.amberSoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.timelineLine}
          />
          
          {/* Left Arrow */}
          <Text style={[styles.arrowHead, { left: 8 }]}>◀</Text>
          
          {/* Right Arrow */}
          <Text style={[styles.arrowHead, { right: 8 }]}>▶</Text>

          {/* Pulsing NOW indicator */}
          <View style={styles.nowIndicatorContainer}>
            <Animated.View style={[styles.nowPulse, animatedPulseStyle]} />
            <View style={styles.nowDot} />
          </View>
          
          {/* Render Active Tense Shapes */}
          {renderShapeElements()}
        </View>

        {/* Labels Row */}
        <View style={styles.labelsRow}>
          <Text style={styles.label}>{labelLeft}</Text>
          <Text style={styles.nowLabel}>{marker}</Text>
          <Text style={styles.label}>{labelRight}</Text>
        </View>
      </View>
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
    marginBottom: space.lg,
  },
  canvas: {
    paddingVertical: space.xl,
  },
  timelineTrack: {
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  timelineLine: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 20,
  },
  arrowHead: {
    position: 'absolute',
    color: palette.ink3,
    fontSize: 12,
  },
  
  /* Now Pulsing Indicator */
  nowIndicatorContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.accent,
  },
  nowPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.accent,
    opacity: 0.4,
  },

  /* Shapes */
  timeShapeDot: {
    position: 'absolute',
    top: 30 - 7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.gold,
    borderWidth: 2,
    borderColor: palette.card,
    zIndex: 10,
    shadowColor: palette.gold,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  timeShapeSegment: {
    position: 'absolute',
    top: 30 - 3,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.gold,
    zIndex: 9,
    shadowColor: palette.gold,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  timeShapeArrow: {
    position: 'absolute',
    top: 30 - 8,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 8,
  },
  arrowText: {
    color: palette.amber,
    fontSize: 14,
    fontFamily: font.sansBold,
  },

  /* Labels */
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: space.sm,
  },
  label: {
    color: palette.ink3,
    fontFamily: font.sansMed,
    fontSize: 12,
  },
  nowLabel: {
    color: palette.accent,
    fontFamily: font.sansBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

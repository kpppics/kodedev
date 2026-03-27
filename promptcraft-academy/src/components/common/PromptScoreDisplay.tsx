import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface SubScore {
  label: string;
  value: number;
}

interface PromptScoreDisplayProps {
  overallScore: number;
  subScores?: {
    clarity: number;
    creativity: number;
    context: number;
    result: number;
  };
  feedback?: string;
  improvements?: string[];
  animated?: boolean;
}

const getScoreColor = (score: number): string => {
  if (score < 40) return COLORS.error;
  if (score <= 70) return COLORS.warning;
  return COLORS.success;
};

const ScoreCircle: React.FC<{
  score: number;
  size: number;
  label?: string;
  animated?: boolean;
  delay?: number;
}> = ({ score, size, label, animated = true, delay = 0 }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(animated ? 0.5 : 1)).current;

  useEffect(() => {
    if (animated) {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animValue, {
            toValue: score,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.spring(scaleValue, {
            toValue: 1,
            friction: 4,
            tension: 60,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      animValue.setValue(score);
    }
  }, [score, animated, delay, animValue, scaleValue]);

  const color = getScoreColor(score);
  const borderWidth = size > 60 ? 6 : 4;

  const displayScore = animated
    ? animValue.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 100],
      })
    : score;

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], alignItems: 'center' }}>
      <View
        style={[
          styles.scoreCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: color,
          },
        ]}
      >
        {animated ? (
          <AnimatedScoreText animValue={animValue} size={size} color={color} />
        ) : (
          <Text
            style={[
              styles.scoreText,
              {
                fontSize: size > 60 ? FONTS.sizes.xxl : FONTS.sizes.md,
                color,
              },
            ]}
          >
            {score}
          </Text>
        )}
      </View>
      {label && <Text style={styles.scoreLabel}>{label}</Text>}
    </Animated.View>
  );
};

const AnimatedScoreText: React.FC<{
  animValue: Animated.Value;
  size: number;
  color: string;
}> = ({ animValue, size, color }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    const listenerId = animValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });
    return () => animValue.removeListener(listenerId);
  }, [animValue]);

  return (
    <Text
      style={[
        styles.scoreText,
        {
          fontSize: size > 60 ? FONTS.sizes.xxl : FONTS.sizes.md,
          color,
        },
      ]}
    >
      {displayValue}
    </Text>
  );
};

const PromptScoreDisplay: React.FC<PromptScoreDisplayProps> = ({
  overallScore,
  subScores,
  feedback,
  improvements,
  animated = true,
}) => {
  const subScoreItems: SubScore[] = subScores
    ? [
        { label: 'Clarity', value: subScores.clarity },
        { label: 'Creativity', value: subScores.creativity },
        { label: 'Context', value: subScores.context },
        { label: 'Result', value: subScores.result },
      ]
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.mainScoreSection}>
        <ScoreCircle score={overallScore} size={100} animated={animated} />
        <Text style={styles.overallLabel}>Overall Score</Text>
      </View>

      {subScoreItems.length > 0 && (
        <View style={styles.subScoresContainer}>
          {subScoreItems.map((item, index) => (
            <ScoreCircle
              key={item.label}
              score={item.value}
              size={56}
              label={item.label}
              animated={animated}
              delay={200 + index * 150}
            />
          ))}
        </View>
      )}

      {feedback && (
        <View style={styles.feedbackContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.primary} />
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {improvements && improvements.length > 0 && (
        <View style={styles.improvementsContainer}>
          <Text style={styles.improvementsTitle}>
            <Ionicons name="bulb-outline" size={16} color={COLORS.xpGold} /> How to Improve
          </Text>
          {improvements.map((tip, index) => (
            <View key={index} style={styles.improvementItem}>
              <Ionicons name="arrow-forward-circle" size={16} color={COLORS.primary} />
              <Text style={styles.improvementText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  mainScoreSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  overallLabel: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  scoreCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  scoreText: {
    fontWeight: FONTS.weights.extrabold,
  },
  scoreLabel: {
    marginTop: SPACING.xs,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  subScoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  feedbackText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  improvementsContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  improvementsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  improvementText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default PromptScoreDisplay;

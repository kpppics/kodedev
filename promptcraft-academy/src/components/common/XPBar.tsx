import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface XPBarProps {
  currentXP: number;
  xpForNextLevel: number;
  level: number;
  levelTitle?: string;
  animated?: boolean;
  style?: ViewStyle;
}

const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  xpForNextLevel,
  level,
  levelTitle = 'Prompt Explorer',
  animated = true,
  style,
}) => {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(animated ? 0 : 1)).current;

  const progress = Math.min(currentXP / xpForNextLevel, 1);

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fillAnim, {
          toValue: progress,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fillAnim.setValue(progress);
    }
  }, [progress, animated, fillAnim, badgeScale]);

  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.badge, { transform: [{ scale: badgeScale }] }]}>
        <Ionicons name="star" size={18} color={COLORS.xpGold} />
        <Text style={styles.levelText}>{level}</Text>
      </Animated.View>

      <View style={styles.barSection}>
        <View style={styles.labelRow}>
          <Text style={styles.levelTitle}>{levelTitle}</Text>
          <Text style={styles.xpText}>
            {currentXP} / {xpForNextLevel} XP
          </Text>
        </View>
        <View style={styles.barBackground}>
          <Animated.View style={[styles.barFill, { width: fillWidth }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.xpGold,
    marginRight: SPACING.md,
  },
  levelText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.xpGold,
    marginTop: -2,
  },
  barSection: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  levelTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  xpText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  barBackground: {
    height: 12,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.xpGold,
    borderRadius: RADIUS.full,
  },
});

export default XPBar;

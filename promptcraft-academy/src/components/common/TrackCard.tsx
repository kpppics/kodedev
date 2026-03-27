import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface TrackCardProps {
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  locked?: boolean;
  isPremium?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const TrackCard: React.FC<TrackCardProps> = ({
  name,
  description,
  icon,
  color,
  progress = 0,
  totalLessons = 0,
  completedLessons = 0,
  locked = false,
  isPremium = false,
  onPress,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={locked && !onPress}
        activeOpacity={0.9}
        style={[styles.container, { borderLeftColor: color, borderLeftWidth: 5 }]}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={12} color={COLORS.xpGold} />
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>

          <View style={styles.progressSection}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${clampedProgress * 100}%`, backgroundColor: color },
                ]}
              />
            </View>
            {totalLessons > 0 && (
              <Text style={styles.progressText}>
                {completedLessons}/{totalLessons}
              </Text>
            )}
          </View>
        </View>

        {locked && (
          <View style={styles.lockOverlay}>
            <View style={styles.lockIconContainer}>
              <Ionicons name="lock-closed" size={28} color="#FFFFFF" />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.xpGold}20`,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 2,
  },
  premiumText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.xpGold,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  progressText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TrackCard;

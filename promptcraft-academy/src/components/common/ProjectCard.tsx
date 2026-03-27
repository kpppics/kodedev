import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface ProjectCardProps {
  title: string;
  trackName: string;
  trackColor: string;
  previewText?: string;
  promptScore?: number;
  date: string;
  likesCount?: number;
  onPress?: () => void;
  onShare?: () => void;
  style?: ViewStyle;
}

const getScoreColor = (score: number): string => {
  if (score < 40) return COLORS.error;
  if (score <= 70) return COLORS.warning;
  return COLORS.success;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  trackName,
  trackColor,
  previewText,
  promptScore,
  date,
  likesCount = 0,
  onPress,
  onShare,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}
      style={[styles.container, style]}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.trackBadge, { backgroundColor: `${trackColor}20` }]}>
          <View style={[styles.trackDot, { backgroundColor: trackColor }]} />
          <Text style={[styles.trackName, { color: trackColor }]}>{trackName}</Text>
        </View>
      </View>

      {previewText && (
        <Text style={styles.preview} numberOfLines={3}>
          {previewText}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {promptScore !== undefined && (
            <View style={styles.scoreMini}>
              <View
                style={[
                  styles.scoreDot,
                  { backgroundColor: getScoreColor(promptScore) },
                ]}
              />
              <Text
                style={[styles.scoreText, { color: getScoreColor(promptScore) }]}
              >
                {promptScore}
              </Text>
            </View>
          )}

          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textLight} />
            <Text style={styles.dateText}>{date}</Text>
          </View>

          <View style={styles.likesContainer}>
            <Ionicons name="heart" size={12} color={COLORS.storyStudio} />
            <Text style={styles.likesText}>{likesCount}</Text>
          </View>
        </View>

        {onShare && (
          <TouchableOpacity onPress={onShare} style={styles.shareButton} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  trackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  trackDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trackName: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
  },
  preview: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  scoreMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  likesText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  shareButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
  },
});

export default ProjectCard;

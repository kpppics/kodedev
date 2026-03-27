// ==========================================
// PROMPTCRAFT ACADEMY - Track Detail Screen
// ==========================================
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import type { Lesson, TrackId, RootStackParamList } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'TrackDetail'>;

// Simulated track data for all tracks
const TRACK_DATA: Record<TrackId, { emoji: string; color: string; name: string; description: string }> = {
  'story-studio': { emoji: '📖', color: COLORS.storyStudio, name: 'Story Studio', description: 'Create amazing stories with AI! Learn how to write detailed prompts that bring characters and worlds to life.' },
  'web-builder': { emoji: '🌐', color: COLORS.webBuilder, name: 'Web Builder', description: 'Build beautiful webpages using your words. Learn to describe layouts, colors, and elements clearly.' },
  'game-maker': { emoji: '🎮', color: COLORS.gameMaker, name: 'Game Maker', description: 'Design and create your own games! Learn to describe game mechanics, characters, and rules.' },
  'art-factory': { emoji: '🎨', color: COLORS.artFactory, name: 'Art Factory', description: 'Create stunning AI artwork! Master the art of describing visual scenes, styles, and compositions.' },
  'music-maker': { emoji: '🎵', color: COLORS.musicMaker, name: 'Music Maker', description: 'Compose original music with AI! Learn to describe melodies, rhythms, and moods.' },
  'code-explainer': { emoji: '💻', color: COLORS.codeExplainer, name: 'Code Explainer', description: 'Understand and modify code using plain English. Learn to communicate with AI about programming.' },
};

const SIMULATED_LESSONS: Lesson[] = [
  { id: 'l1', trackId: 'story-studio', title: 'Your First Prompt', description: 'Learn the basics of writing a clear prompt.', difficulty: 1, xpReward: 50, challenge: 'Write a one-sentence prompt.', hints: ['Start simple!'], completedAt: '2026-03-20' },
  { id: 'l2', trackId: 'story-studio', title: 'Adding Details', description: 'Make your prompts more descriptive and specific.', difficulty: 2, xpReward: 75, challenge: 'Write a prompt with 3 details.', hints: ['Think about who, what, where.'], completedAt: '2026-03-22' },
  { id: 'l3', trackId: 'story-studio', title: 'Characters & Feelings', description: 'Learn to describe characters and emotions.', difficulty: 3, xpReward: 100, challenge: 'Create a character with feelings.', hints: ['How does your character feel?'], completedAt: '2026-03-24' },
  { id: 'l4', trackId: 'story-studio', title: 'Setting the Scene', description: 'Create vivid settings and environments.', difficulty: 4, xpReward: 100, challenge: 'Describe a world in detail.', hints: ['Use all 5 senses!'] },
  { id: 'l5', trackId: 'story-studio', title: 'Plot Twists & Surprises', description: 'Add unexpected turns to your stories.', difficulty: 5, xpReward: 125, challenge: 'Write a story with a twist.', hints: ['What if something unexpected happened?'] },
  { id: 'l6', trackId: 'story-studio', title: 'Dialogue & Conversation', description: 'Make characters talk to each other.', difficulty: 5, xpReward: 125, challenge: 'Write a prompt with dialogue.', hints: ['Think about how people really talk.'] },
  { id: 'l7', trackId: 'story-studio', title: 'Advanced Storytelling', description: 'Combine all techniques for epic stories.', difficulty: 7, xpReward: 200, challenge: 'Create a complete short story.', hints: ['Beginning, middle, and end!'] },
  { id: 'l8', trackId: 'story-studio', title: 'Master Prompter', description: 'Put everything together in a final challenge.', difficulty: 9, xpReward: 300, challenge: 'Create a masterpiece story.', hints: ['Use everything you have learned!'] },
];

export default function TrackDetailScreen({ route, navigation }: Props) {
  const trackId: TrackId = route?.params?.trackId ?? 'story-studio';
  const trackInfo = TRACK_DATA[trackId];
  const trackColor = trackInfo.color;
  const lessons = SIMULATED_LESSONS;
  const completedCount = lessons.filter(l => l.completedAt).length;
  const progress = completedCount / lessons.length;
  const nextLesson = lessons.find(l => !l.completedAt);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderDifficultyStars = (difficulty: number) => {
    const maxStars = 5;
    const filledStars = Math.ceil(difficulty / 2);
    return (
      <View style={styles.starsRow}>
        {Array.from({ length: maxStars }).map((_, i) => (
          <Text key={i} style={[styles.star, i < filledStars ? styles.starFilled : styles.starEmpty]}>
            ★
          </Text>
        ))}
      </View>
    );
  };

  const isLessonUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    return !!lessons[index - 1].completedAt;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Track Header */}
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: trackColor, opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] },
        ]}
      >
        <Text style={styles.headerEmoji}>{trackInfo.emoji}</Text>
        <Text style={[styles.headerTitle, trackId === 'game-maker' && { color: '#5D4E00' }]}>
          {trackInfo.name}
        </Text>
        <Text style={[styles.headerDescription, trackId === 'game-maker' && { color: '#5D4E00CC' }]}>
          {trackInfo.description}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={[styles.progressLabel, trackId === 'game-maker' && { color: '#5D4E00' }]}>
              Progress
            </Text>
            <Text style={[styles.progressPercent, trackId === 'game-maker' && { color: '#5D4E00' }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={[styles.progressDetail, trackId === 'game-maker' && { color: '#5D4E00CC' }]}>
            {completedCount} of {lessons.length} lessons completed
          </Text>
        </View>
      </Animated.View>

      {/* Start Next Lesson Button */}
      {nextLesson && (
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: trackColor }]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('LessonScreen', { trackId, lessonId: nextLesson.id })}
        >
          <Text style={[styles.startBtnLabel, trackId === 'game-maker' && { color: '#5D4E00AA' }]}>
            Up Next
          </Text>
          <Text style={[styles.startBtnTitle, trackId === 'game-maker' && { color: '#5D4E00' }]}>
            {nextLesson.title}
          </Text>
          <Text style={[styles.startBtnText, trackId === 'game-maker' && { color: '#5D4E00' }]}>
            Start Next Lesson →
          </Text>
        </TouchableOpacity>
      )}

      {/* Lesson List */}
      <Text style={styles.sectionTitle}>All Lessons</Text>
      {lessons.map((lesson, index) => {
        const unlocked = isLessonUnlocked(index);
        const completed = !!lesson.completedAt;
        return (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonCard,
              !unlocked && styles.lessonCardLocked,
              completed && { borderLeftColor: trackColor, borderLeftWidth: 4 },
            ]}
            disabled={!unlocked}
            activeOpacity={0.7}
            onPress={() => unlocked && navigation.navigate('LessonScreen', { trackId, lessonId: lesson.id })}
          >
            <View style={styles.lessonLeft}>
              {/* Lesson Number / Status */}
              <View
                style={[
                  styles.lessonNumber,
                  completed && { backgroundColor: trackColor },
                  !unlocked && { backgroundColor: COLORS.border },
                ]}
              >
                {completed ? (
                  <Text style={styles.lessonCheckmark}>✓</Text>
                ) : !unlocked ? (
                  <Text style={styles.lessonLock}>🔒</Text>
                ) : (
                  <Text style={styles.lessonNumText}>{index + 1}</Text>
                )}
              </View>

              {/* Lesson Info */}
              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonTitle, !unlocked && styles.lessonTitleLocked]}>
                  {lesson.title}
                </Text>
                <Text style={[styles.lessonDescription, !unlocked && styles.lessonDescLocked]}>
                  {lesson.description}
                </Text>
                <View style={styles.lessonMeta}>
                  {renderDifficultyStars(lesson.difficulty)}
                  <View style={styles.xpBadge}>
                    <Text style={styles.xpText}>{lesson.xpReward} XP</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Completion Status */}
            {completed && (
              <View style={[styles.completedBadge, { backgroundColor: trackColor + '20' }]}>
                <Text style={[styles.completedText, { color: trackColor }]}>Done!</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <View style={{ height: SPACING.huge }} />
    </ScrollView>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  headerDescription: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  progressSection: {
    width: '100%',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: '#FFF',
  },
  progressPercent: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: '#FFF',
  },
  progressBarBg: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 6,
  },
  progressDetail: {
    fontSize: FONTS.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  startBtn: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.large,
  },
  startBtnLabel: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FONTS.weights.medium,
  },
  startBtnTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: '#FFF',
    marginVertical: SPACING.xs,
  },
  startBtnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.extrabold,
    color: '#FFF',
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  lessonCardLocked: {
    opacity: 0.55,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  lessonCheckmark: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: FONTS.weights.bold,
  },
  lessonLock: {
    fontSize: 16,
  },
  lessonNumText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: '#FFF',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  lessonTitleLocked: {
    color: COLORS.textLight,
  },
  lessonDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  lessonDescLocked: {
    color: COLORS.textLight,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 14,
  },
  starFilled: {
    color: COLORS.xpGold,
  },
  starEmpty: {
    color: COLORS.border,
  },
  xpBadge: {
    backgroundColor: COLORS.xpGold + '20',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  xpText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: '#B8860B',
  },
  completedBadge: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  completedText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
});

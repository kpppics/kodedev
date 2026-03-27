import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { DailyQuest, TrackId } from '../../types';

// -------------------------------------------------------------------
// Track meta
// -------------------------------------------------------------------
const TRACK_META: Record<TrackId, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  'story-studio':   { color: COLORS.storyStudio,   icon: 'book',            label: 'Story Studio' },
  'web-builder':    { color: COLORS.webBuilder,     icon: 'globe',           label: 'Web Builder Jr' },
  'game-maker':     { color: COLORS.gameMaker,      icon: 'game-controller', label: 'Game Maker' },
  'art-factory':    { color: COLORS.artFactory,     icon: 'color-palette',   label: 'Art Factory' },
  'music-maker':    { color: COLORS.musicMaker,     icon: 'musical-notes',   label: 'Music Maker' },
  'code-explainer': { color: COLORS.codeExplainer,  icon: 'code-slash',      label: 'Code Explainer' },
};

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------
const DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'dq1',
    title: 'Story Spark',
    description: 'Write a creative story prompt with at least 3 characters',
    trackId: 'story-studio',
    xpReward: 50,
    isCompleted: true,
    expiresAt: '2026-03-26T23:59:59Z',
  },
  {
    id: 'dq2',
    title: 'Code Crafter',
    description: 'Use a prompt to explain how a loop works in code',
    trackId: 'code-explainer',
    xpReward: 60,
    isCompleted: false,
    expiresAt: '2026-03-26T23:59:59Z',
  },
  {
    id: 'dq3',
    title: 'Art Attack',
    description: 'Create an art prompt that includes colors, mood, and style',
    trackId: 'art-factory',
    xpReward: 55,
    isCompleted: false,
    expiresAt: '2026-03-26T23:59:59Z',
  },
];

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  total: number;
  endsAt: string;
}

const WEEKLY_CHALLENGE: WeeklyChallenge = {
  id: 'wc1',
  title: 'Prompt Marathon',
  description: 'Complete 10 prompts across any track this week',
  xpReward: 300,
  progress: 6,
  total: 10,
  endsAt: '2026-03-29T23:59:59Z',
};

const STREAK_DATA = {
  current: 5,
  best: 12,
  bonusXp: 25,
};

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
const useResetTimer = (expiresAt: string) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Resetting...');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return timeLeft;
};

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

const QuestCard: React.FC<{ quest: DailyQuest; index: number }> = ({ quest, index }) => {
  const trackMeta = quest.trackId ? TRACK_META[quest.trackId] : null;
  const trackColor = trackMeta?.color ?? COLORS.primary;

  return (
    <TouchableOpacity activeOpacity={0.85} style={[styles.questCard, quest.isCompleted && styles.questCardCompleted]}>
      {/* Left number indicator */}
      <View style={[styles.questNumber, { backgroundColor: quest.isCompleted ? COLORS.success : trackColor }]}>
        {quest.isCompleted ? (
          <Ionicons name="checkmark" size={20} color="#fff" />
        ) : (
          <Text style={styles.questNumberText}>{index + 1}</Text>
        )}
      </View>

      <View style={styles.questBody}>
        <View style={styles.questTitleRow}>
          <Text style={[styles.questTitle, quest.isCompleted && styles.questTitleCompleted]}>{quest.title}</Text>
          {trackMeta && (
            <View style={[styles.questTrackPill, { backgroundColor: trackColor + '20' }]}>
              <Ionicons name={trackMeta.icon} size={12} color={trackColor} />
              <Text style={[styles.questTrackText, { color: trackColor }]}>{trackMeta.label}</Text>
            </View>
          )}
        </View>
        <Text style={styles.questDescription}>{quest.description}</Text>

        {/* Progress bar */}
        <View style={styles.questProgressRow}>
          <View style={styles.questProgressBar}>
            <View
              style={[
                styles.questProgressFill,
                {
                  width: quest.isCompleted ? '100%' : '0%',
                  backgroundColor: quest.isCompleted ? COLORS.success : trackColor,
                },
              ]}
            />
          </View>
          <View style={styles.questReward}>
            <Ionicons name="star" size={14} color={COLORS.xpGold} />
            <Text style={styles.questRewardText}>+{quest.xpReward} XP</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const StreakDisplay: React.FC = () => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedDays = STREAK_DATA.current; // days from start of week

  return (
    <View style={styles.streakCard}>
      <View style={styles.streakHeader}>
        <View style={styles.streakTitleRow}>
          <Ionicons name="flame" size={24} color={COLORS.streak} />
          <Text style={styles.streakTitle}>{STREAK_DATA.current} Day Streak!</Text>
        </View>
        <View style={styles.streakBonusBadge}>
          <Ionicons name="star" size={12} color={COLORS.xpGold} />
          <Text style={styles.streakBonusText}>+{STREAK_DATA.bonusXp} XP/day</Text>
        </View>
      </View>

      {/* Week dots */}
      <View style={styles.streakDots}>
        {days.map((day, i) => {
          const isCompleted = i < completedDays;
          const isToday = i === completedDays - 1;
          return (
            <View key={i} style={styles.streakDotCol}>
              <View
                style={[
                  styles.streakDot,
                  isCompleted && styles.streakDotCompleted,
                  isToday && styles.streakDotToday,
                ]}
              >
                {isCompleted && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[styles.streakDayLabel, isCompleted && styles.streakDayLabelActive]}>{day}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.streakBestRow}>
        <Ionicons name="ribbon" size={16} color={COLORS.primary} />
        <Text style={styles.streakBestText}>Best streak: {STREAK_DATA.best} days</Text>
      </View>
    </View>
  );
};

const WeeklyChallengeCard: React.FC<{ challenge: WeeklyChallenge }> = ({ challenge }) => {
  const progress = challenge.progress / challenge.total;

  return (
    <View style={styles.weeklyCard}>
      <View style={styles.weeklyHeader}>
        <Ionicons name="calendar" size={20} color={COLORS.primary} />
        <Text style={styles.weeklyTitle}>Weekly Challenge</Text>
      </View>

      <Text style={styles.weeklyName}>{challenge.title}</Text>
      <Text style={styles.weeklyDescription}>{challenge.description}</Text>

      <View style={styles.weeklyProgressSection}>
        <View style={styles.weeklyProgressBar}>
          <View style={[styles.weeklyProgressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.weeklyProgressText}>
          {challenge.progress}/{challenge.total}
        </Text>
      </View>

      <View style={styles.weeklyFooter}>
        <View style={styles.weeklyReward}>
          <Ionicons name="trophy" size={16} color={COLORS.xpGold} />
          <Text style={styles.weeklyRewardText}>+{challenge.xpReward} XP</Text>
        </View>
      </View>
    </View>
  );
};

// -------------------------------------------------------------------
// Main screen
// -------------------------------------------------------------------
const QuestsScreen: React.FC = () => {
  const resetTimer = useResetTimer(DAILY_QUESTS[0].expiresAt);
  const completedCount = DAILY_QUESTS.filter((q) => q.isCompleted).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <Ionicons name="compass" size={28} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Daily Quests</Text>
        </View>
        <Text style={styles.headerSub}>Complete quests to earn XP and keep your streak alive!</Text>
      </View>

      {/* Reset timer */}
      <View style={styles.resetTimerCard}>
        <Ionicons name="time" size={20} color={COLORS.primary} />
        <View style={styles.resetTimerContent}>
          <Text style={styles.resetTimerLabel}>Quests reset in</Text>
          <Text style={styles.resetTimerValue}>{resetTimer}</Text>
        </View>
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>{completedCount}/{DAILY_QUESTS.length}</Text>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
        </View>
      </View>

      {/* Daily quests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="today" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Today's Quests</Text>
        </View>
        {DAILY_QUESTS.map((quest, index) => (
          <QuestCard key={quest.id} quest={quest} index={index} />
        ))}
      </View>

      {/* Streak display */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flame" size={20} color={COLORS.streak} />
          <Text style={styles.sectionTitle}>Streak Bonus</Text>
        </View>
        <StreakDisplay />
      </View>

      {/* Weekly challenge */}
      <View style={styles.section}>
        <WeeklyChallengeCard challenge={WEEKLY_CHALLENGE} />
      </View>
    </ScrollView>
  );
};

export default QuestsScreen;

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.huge,
  },

  // Header
  headerSection: {
    marginBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.text,
  },
  headerSub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },

  // Reset timer
  resetTimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '12',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  resetTimerContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  resetTimerLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  resetTimerValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '18',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  completedBadgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.success,
  },

  // Sections
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },

  // Quest card
  questCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  questCardCompleted: {
    backgroundColor: COLORS.success + '08',
    borderWidth: 1,
    borderColor: COLORS.success + '20',
  },
  questNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  questNumberText: {
    color: '#fff',
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  questBody: {
    flex: 1,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  questTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    flex: 1,
  },
  questTitleCompleted: {
    color: COLORS.success,
  },
  questTrackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
    gap: 4,
  },
  questTrackText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
  },
  questDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  questProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  questProgressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  questReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  questRewardText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.xpGold,
  },

  // Streak
  streakCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  streakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  streakTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.streak,
  },
  streakBonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.xpGold + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  streakBonusText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.xpGold,
  },
  streakDots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  streakDotCol: {
    alignItems: 'center',
  },
  streakDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  streakDotCompleted: {
    backgroundColor: COLORS.streak,
  },
  streakDotToday: {
    borderWidth: 3,
    borderColor: COLORS.xpGold,
  },
  streakDayLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textLight,
  },
  streakDayLabelActive: {
    color: COLORS.streak,
  },
  streakBestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  streakBestText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },

  // Weekly challenge
  weeklyCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.large,
  },
  weeklyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  weeklyTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weeklyName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.extrabold,
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  weeklyDescription: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  weeklyProgressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  weeklyProgressBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  weeklyProgressFill: {
    height: '100%',
    backgroundColor: COLORS.xpGold,
    borderRadius: RADIUS.full,
  },
  weeklyProgressText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: '#fff',
  },
  weeklyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  weeklyRewardText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.xpGold,
  },
});

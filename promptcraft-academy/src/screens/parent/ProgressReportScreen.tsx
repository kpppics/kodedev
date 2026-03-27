import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { SkillProgress, Badge } from '../../types';

// ── Types ──────────────────────────────────────────────────
type Period = 'week' | 'month';
type PromptTrend = 'improving' | 'stable' | 'needs-work';

interface PeriodStats {
  totalTime: number; // minutes
  projects: number;
  prompts: number;
  streak: number;
}

interface Recommendation {
  id: string;
  icon: string;
  text: string;
}

// ── Mock Data ──────────────────────────────────────────────
const STATS_BY_PERIOD: Record<Period, PeriodStats> = {
  week: { totalTime: 230, projects: 16, prompts: 42, streak: 5 },
  month: { totalTime: 920, projects: 58, prompts: 154, streak: 14 },
};

const MOCK_SKILLS: SkillProgress[] = [
  { skill: 'Clarity', level: 5, progress: 72 },
  { skill: 'Creativity', level: 4, progress: 58 },
  { skill: 'Context', level: 6, progress: 85 },
  { skill: 'Specificity', level: 4, progress: 50 },
  { skill: 'Iteration', level: 3, progress: 40 },
  { skill: 'Critical Thinking', level: 5, progress: 68 },
];

const MOCK_TREND: PromptTrend = 'improving';

const MOCK_ACHIEVEMENTS: Pick<Badge, 'id' | 'name' | 'icon' | 'description'>[] = [
  { id: '1', name: 'Story Master', icon: '📖', description: 'Completed 10 Story Studio projects' },
  { id: '2', name: 'Five Day Streak', icon: '🔥', description: 'Logged in 5 days in a row' },
  { id: '3', name: 'Prompt Pro', icon: '⭐', description: 'Scored 90+ on a prompt' },
  { id: '4', name: 'Social Butterfly', icon: '🦋', description: 'Shared 5 public projects' },
];

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  { id: '1', icon: 'bulb-outline', text: 'Alex is showing strong creativity. Try encouraging the Game Maker track to build on this.' },
  { id: '2', icon: 'trending-up-outline', text: 'Prompt specificity has room for growth. The "Be Specific" mini-lessons could help.' },
  { id: '3', icon: 'time-outline', text: 'Most productive sessions are in the morning. Consider scheduling learning time before noon.' },
];

// ── Component ──────────────────────────────────────────────
export default function ProgressReportScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');
  const stats = STATS_BY_PERIOD[selectedPeriod];

  const trendConfig: Record<PromptTrend, { label: string; color: string; icon: string }> = {
    improving: { label: 'Improving', color: COLORS.success, icon: 'trending-up' },
    stable: { label: 'Stable', color: COLORS.warning, icon: 'trending-up' },
    'needs-work': { label: 'Needs Work', color: COLORS.error, icon: 'trending-down' },
  };
  const trend = trendConfig[MOCK_TREND];

  // ── Render helpers ────────────────────────────────────────
  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month'] as Period[]).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodTab,
            selectedPeriod === period && styles.periodTabActive,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodTabText,
              selectedPeriod === period && styles.periodTabTextActive,
            ]}
          >
            {period === 'week' ? 'This Week' : 'This Month'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatsCards = () => {
    const cards = [
      { label: 'Total Time', value: `${Math.floor(stats.totalTime / 60)}h ${stats.totalTime % 60}m`, icon: 'time-outline' as const, bg: '#EEF0FF' },
      { label: 'Projects', value: `${stats.projects}`, icon: 'construct-outline' as const, bg: '#E8FFF1' },
      { label: 'Prompts', value: `${stats.prompts}`, icon: 'chatbubble-ellipses-outline' as const, bg: '#FFF0E8' },
      { label: 'Streak', value: `${stats.streak} days`, icon: 'flame-outline' as const, bg: '#FFF8E1' },
    ];

    return (
      <View style={styles.statsGrid}>
        {cards.map((card) => (
          <View key={card.label} style={[styles.statCard, { backgroundColor: card.bg }]}>
            <Ionicons name={card.icon} size={22} color={COLORS.text} />
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSkillsBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills Breakdown</Text>
      <View style={styles.skillsCard}>
        {MOCK_SKILLS.map((skill) => (
          <View key={skill.skill} style={styles.skillRow}>
            <View style={styles.skillHeader}>
              <Text style={styles.skillName}>{skill.skill}</Text>
              <View style={styles.skillLevelBadge}>
                <Text style={styles.skillLevelText}>Lv {skill.level}</Text>
              </View>
            </View>
            <View style={styles.skillBarBg}>
              <View
                style={[
                  styles.skillBarFill,
                  {
                    width: `${skill.progress}%`,
                    backgroundColor:
                      skill.progress >= 70
                        ? COLORS.success
                        : skill.progress >= 40
                        ? COLORS.primary
                        : COLORS.warning,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPromptTrend = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Prompt Quality Trend</Text>
      <View style={styles.trendCard}>
        <Ionicons name={trend.icon as any} size={32} color={trend.color} />
        <View style={styles.trendInfo}>
          <Text style={[styles.trendLabel, { color: trend.color }]}>{trend.label}</Text>
          <Text style={styles.trendDescription}>
            Alex's prompts are getting more specific and creative over the past {selectedPeriod}.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Top Achievements</Text>
      <View style={styles.achievementsGrid}>
        {MOCK_ACHIEVEMENTS.map((badge) => (
          <View key={badge.id} style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>{badge.icon}</Text>
            <Text style={styles.achievementName}>{badge.name}</Text>
            <Text style={styles.achievementDesc} numberOfLines={2}>
              {badge.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>AI Recommendations</Text>
      {MOCK_RECOMMENDATIONS.map((rec) => (
        <View key={rec.id} style={styles.recommendationCard}>
          <View style={styles.recommendationIcon}>
            <Ionicons name={rec.icon as any} size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.recommendationText}>{rec.text}</Text>
        </View>
      ))}
    </View>
  );

  // ── Main render ───────────────────────────────────────────
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Progress Report</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Child info */}
      <View style={styles.childBanner}>
        <Text style={styles.childAvatar}>🧒</Text>
        <View>
          <Text style={styles.childName}>Alex</Text>
          <Text style={styles.childMeta}>Level 7 -- 2,340 XP</Text>
        </View>
      </View>

      {/* Period Selector */}
      {renderPeriodSelector()}

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Skills Breakdown */}
      {renderSkillsBreakdown()}

      {/* Prompt Quality Trend */}
      {renderPromptTrend()}

      {/* Top Achievements */}
      {renderAchievements()}

      {/* AI Recommendations */}
      {renderRecommendations()}

      {/* Share Report Button */}
      <TouchableOpacity style={styles.shareButton}>
        <Ionicons name="share-outline" size={20} color="#FFF" />
        <Text style={styles.shareButtonText}>Share Report</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  headerRight: {
    width: 40,
  },

  // Child Banner
  childBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    ...SHADOWS.small,
  },
  childAvatar: {
    fontSize: 36,
  },
  childName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  childMeta: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 4,
    ...SHADOWS.small,
  },
  periodTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: COLORS.primary,
  },
  periodTabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  periodTabTextActive: {
    color: '#FFF',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  statCard: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '46%',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },

  // Section
  section: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  // Skills
  skillsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  skillRow: {
    marginBottom: SPACING.md,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  skillName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
  },
  skillLevelBadge: {
    backgroundColor: COLORS.primaryLight + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  skillLevelText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primaryDark,
  },
  skillBarBg: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },

  // Prompt Trend
  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.lg,
    ...SHADOWS.small,
  },
  trendInfo: {
    flex: 1,
  },
  trendLabel: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  trendDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Achievements
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  achievementCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  achievementName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Recommendations
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...SHADOWS.small,
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight + '25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    lineHeight: 20,
  },

  // Share Button
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  shareButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: '#FFF',
  },

  bottomSpacer: {
    height: SPACING.huge,
  },
});

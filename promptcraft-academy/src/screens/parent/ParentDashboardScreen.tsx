import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import {
  ChildProfile,
  ChildActivity,
  SkillProgress,
  Project,
  TrackId,
} from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Mock Data ──────────────────────────────────────────────
const MOCK_CHILDREN: ChildProfile[] = [
  {
    id: '1',
    username: 'alex_creates',
    displayName: 'Alex',
    avatar: '🧒',
    role: 'child',
    age: 10,
    level: 7,
    xp: 2340,
    totalXp: 3000,
    streak: 5,
    badges: [],
    promptsCreated: 42,
    projectsCreated: 18,
    parentId: 'p1',
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    username: 'emma_codes',
    displayName: 'Emma',
    avatar: '👧',
    role: 'child',
    age: 8,
    level: 4,
    xp: 980,
    totalXp: 1500,
    streak: 3,
    badges: [],
    promptsCreated: 21,
    projectsCreated: 9,
    parentId: 'p1',
    createdAt: '2025-03-01',
  },
];

const MOCK_WEEKLY_ACTIVITY: ChildActivity[] = [
  { date: 'Mon', timeSpent: 25, projectsCreated: 2, xpEarned: 120, tracksUsed: ['story-studio'] },
  { date: 'Tue', timeSpent: 40, projectsCreated: 3, xpEarned: 180, tracksUsed: ['web-builder', 'game-maker'] },
  { date: 'Wed', timeSpent: 15, projectsCreated: 1, xpEarned: 60, tracksUsed: ['art-factory'] },
  { date: 'Thu', timeSpent: 35, projectsCreated: 2, xpEarned: 150, tracksUsed: ['code-explainer'] },
  { date: 'Fri', timeSpent: 50, projectsCreated: 4, xpEarned: 240, tracksUsed: ['story-studio', 'music-maker'] },
  { date: 'Sat', timeSpent: 45, projectsCreated: 3, xpEarned: 200, tracksUsed: ['game-maker'] },
  { date: 'Sun', timeSpent: 20, projectsCreated: 1, xpEarned: 80, tracksUsed: ['web-builder'] },
];

const MOCK_SKILLS: SkillProgress[] = [
  { skill: 'Clarity', level: 5, progress: 72 },
  { skill: 'Creativity', level: 4, progress: 58 },
  { skill: 'Context', level: 6, progress: 85 },
  { skill: 'Problem Solving', level: 3, progress: 40 },
  { skill: 'Iteration', level: 4, progress: 65 },
];

const MOCK_RECENT_PROJECTS: Pick<Project, 'id' | 'title' | 'trackId' | 'createdAt'>[] = [
  { id: 'p1', title: 'Dragon Adventure Story', trackId: 'story-studio', createdAt: '2026-03-25' },
  { id: 'p2', title: 'My Portfolio Page', trackId: 'web-builder', createdAt: '2026-03-24' },
  { id: 'p3', title: 'Space Invaders Clone', trackId: 'game-maker', createdAt: '2026-03-23' },
];

const TRACK_LABELS: Record<TrackId, { label: string; color: string; icon: string }> = {
  'story-studio': { label: 'Story Studio', color: COLORS.storyStudio, icon: 'book' },
  'web-builder': { label: 'Web Builder', color: COLORS.webBuilder, icon: 'globe' },
  'game-maker': { label: 'Game Maker', color: COLORS.gameMaker, icon: 'game-controller' },
  'art-factory': { label: 'Art Factory', color: COLORS.artFactory, icon: 'color-palette' },
  'music-maker': { label: 'Music Maker', color: COLORS.musicMaker, icon: 'musical-notes' },
  'code-explainer': { label: 'Code Explainer', color: COLORS.codeExplainer, icon: 'code-slash' },
};

// ── Component ──────────────────────────────────────────────
export default function ParentDashboardScreen() {
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [safeModeEnabled, setSafeModeEnabled] = useState(true);
  const [screenTimeLimit, setScreenTimeLimit] = useState(60);

  const selectedChild = MOCK_CHILDREN[selectedChildIndex];
  const totalTimeThisWeek = MOCK_WEEKLY_ACTIVITY.reduce((s, a) => s + a.timeSpent, 0);
  const totalProjectsThisWeek = MOCK_WEEKLY_ACTIVITY.reduce((s, a) => s + a.projectsCreated, 0);
  const totalXpThisWeek = MOCK_WEEKLY_ACTIVITY.reduce((s, a) => s + a.xpEarned, 0);
  const maxDailyTime = Math.max(...MOCK_WEEKLY_ACTIVITY.map((a) => a.timeSpent));
  const todayUsed = MOCK_WEEKLY_ACTIVITY[MOCK_WEEKLY_ACTIVITY.length - 1].timeSpent;
  const screenTimePercent = Math.min((todayUsed / screenTimeLimit) * 100, 100);

  const adjustScreenTime = (delta: number) => {
    setScreenTimeLimit((prev) => Math.max(15, Math.min(180, prev + delta)));
  };

  // ── Render helpers ────────────────────────────────────────
  const renderChildSwitcher = () => (
    <View style={styles.childSwitcher}>
      {MOCK_CHILDREN.map((child, index) => (
        <TouchableOpacity
          key={child.id}
          style={[
            styles.childTab,
            index === selectedChildIndex && styles.childTabActive,
          ]}
          onPress={() => setSelectedChildIndex(index)}
        >
          <Text style={styles.childAvatar}>{child.avatar}</Text>
          <Text
            style={[
              styles.childTabText,
              index === selectedChildIndex && styles.childTabTextActive,
            ]}
          >
            {child.displayName}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWeeklySummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>This Week</Text>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#EEF0FF' }]}>
          <Ionicons name="time-outline" size={22} color={COLORS.primary} />
          <Text style={styles.summaryValue}>{Math.round(totalTimeThisWeek / 60)}h {totalTimeThisWeek % 60}m</Text>
          <Text style={styles.summaryLabel}>Time Spent</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#E8FFF1' }]}>
          <Ionicons name="construct-outline" size={22} color={COLORS.success} />
          <Text style={styles.summaryValue}>{totalProjectsThisWeek}</Text>
          <Text style={styles.summaryLabel}>Projects</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FFF8E1' }]}>
          <Ionicons name="star-outline" size={22} color={COLORS.xpGold} />
          <Text style={styles.summaryValue}>{totalXpThisWeek}</Text>
          <Text style={styles.summaryLabel}>XP Earned</Text>
        </View>
      </View>
    </View>
  );

  const renderActivityChart = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daily Activity</Text>
      <View style={styles.chartContainer}>
        {MOCK_WEEKLY_ACTIVITY.map((day) => {
          const barHeight = maxDailyTime > 0 ? (day.timeSpent / maxDailyTime) * 120 : 0;
          return (
            <View key={day.date} style={styles.chartBarWrapper}>
              <Text style={styles.chartBarValue}>{day.timeSpent}m</Text>
              <View
                style={[
                  styles.chartBar,
                  { height: barHeight, backgroundColor: COLORS.primary },
                ]}
              />
              <Text style={styles.chartBarLabel}>{day.date}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderSkillsProgress = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills Progress</Text>
      {MOCK_SKILLS.map((skill) => (
        <View key={skill.skill} style={styles.skillRow}>
          <View style={styles.skillInfo}>
            <Text style={styles.skillName}>{skill.skill}</Text>
            <Text style={styles.skillLevel}>Lv {skill.level}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${skill.progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>{skill.progress}%</Text>
        </View>
      ))}
    </View>
  );

  const renderRecentProjects = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Projects</Text>
      {MOCK_RECENT_PROJECTS.map((project) => {
        const track = TRACK_LABELS[project.trackId];
        return (
          <TouchableOpacity key={project.id} style={styles.projectRow}>
            <View style={[styles.projectIcon, { backgroundColor: track.color + '20' }]}>
              <Ionicons name={track.icon as any} size={20} color={track.color} />
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectTrack}>{track.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderScreenTime = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Screen Time Today</Text>
      <View style={styles.screenTimeCard}>
        <View style={styles.screenTimeHeader}>
          <Text style={styles.screenTimeUsed}>{todayUsed} min</Text>
          <Text style={styles.screenTimeOf}>of {screenTimeLimit} min</Text>
        </View>
        <View style={styles.screenTimeBarBg}>
          <View
            style={[
              styles.screenTimeBarFill,
              {
                width: `${screenTimePercent}%`,
                backgroundColor:
                  screenTimePercent > 80
                    ? COLORS.error
                    : screenTimePercent > 50
                    ? COLORS.warning
                    : COLORS.success,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );

  const renderQuickSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Settings</Text>
      <View style={styles.settingCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="timer-outline" size={20} color={COLORS.primary} />
            <Text style={styles.settingLabel}>Daily Screen Time</Text>
          </View>
          <View style={styles.settingControl}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => adjustScreenTime(-15)}
            >
              <Ionicons name="remove" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.settingValue}>{screenTimeLimit}m</Text>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => adjustScreenTime(15)}
            >
              <Ionicons name="add" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.success} />
            <Text style={styles.settingLabel}>Safe Mode</Text>
          </View>
          <Switch
            value={safeModeEnabled}
            onValueChange={setSafeModeEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={safeModeEnabled ? COLORS.primary : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );

  // ── Main render ───────────────────────────────────────────
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Parent Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Viewing {selectedChild.displayName}'s progress
          </Text>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Child Switcher */}
      {MOCK_CHILDREN.length > 1 && renderChildSwitcher()}

      {/* Weekly Summary */}
      {renderWeeklySummary()}

      {/* Daily Activity Chart */}
      {renderActivityChart()}

      {/* Skills Progress */}
      {renderSkillsProgress()}

      {/* Recent Projects */}
      {renderRecentProjects()}

      {/* View Progress Report */}
      <TouchableOpacity style={styles.reportButton}>
        <Ionicons name="bar-chart-outline" size={20} color="#FFF" />
        <Text style={styles.reportButtonText}>View Progress Report</Text>
      </TouchableOpacity>

      {/* Screen Time */}
      {renderScreenTime()}

      {/* Quick Settings */}
      {renderQuickSettings()}

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.lg,
  },
  headerGreeting: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },

  // Child Switcher
  childSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  childTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  childTabActive: {
    backgroundColor: COLORS.primary + '12',
    borderColor: COLORS.primary,
  },
  childAvatar: {
    fontSize: 18,
  },
  childTabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  childTabTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
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

  // Weekly Summary
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },

  // Activity Chart
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    height: 200,
    ...SHADOWS.small,
  },
  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 24,
    borderRadius: RADIUS.sm,
    minHeight: 4,
  },
  chartBarValue: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: FONTS.weights.medium,
  },
  chartBarLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontWeight: FONTS.weights.medium,
  },

  // Skills Progress
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  skillInfo: {
    width: 110,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillName: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: FONTS.weights.medium,
  },
  skillLevel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primaryDark,
    fontWeight: FONTS.weights.bold,
    backgroundColor: COLORS.primaryLight + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  progressPercent: {
    width: 36,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.semibold,
    textAlign: 'right',
  },

  // Recent Projects
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  projectTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  projectTrack: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Report Button
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
    ...SHADOWS.medium,
  },
  reportButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: '#FFF',
  },

  // Screen Time
  screenTimeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  screenTimeHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  screenTimeUsed: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  screenTimeOf: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  screenTimeBarBg: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  screenTimeBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },

  // Quick Settings
  settingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  settingLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  adjustButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight + '25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },

  bottomSpacer: {
    height: SPACING.huge,
  },
});

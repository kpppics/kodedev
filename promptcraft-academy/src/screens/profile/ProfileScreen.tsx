import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import {
  RootStackParamList,
  ChildProfile,
  Badge,
  Project,
  TrackId,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// -------------------------------------------------------------------
// Mock data -- replace with real store / API calls
// -------------------------------------------------------------------
const MOCK_CHILD: ChildProfile = {
  id: '1',
  username: 'prompt_star',
  displayName: 'Alex',
  avatar: 'fox',
  role: 'child',
  age: 10,
  level: 7,
  xp: 2350,
  totalXp: 3000,
  streak: 5,
  badges: [
    { id: 'b1', name: 'First Prompt', description: 'Write your first prompt', icon: 'create', category: 'creation', earnedAt: '2025-02-01', requirement: 'Write 1 prompt' },
    { id: 'b2', name: 'Story Starter', description: 'Complete 5 Story Studio lessons', icon: 'book', category: 'skill', earnedAt: '2025-02-10', requirement: 'Complete 5 Story lessons' },
    { id: 'b3', name: 'Hot Streak', description: 'Maintain a 5-day streak', icon: 'flame', category: 'streak', earnedAt: '2025-03-01', requirement: '5-day streak' },
    { id: 'b4', name: 'Social Star', description: 'Get 10 likes on a project', icon: 'heart', category: 'social', earnedAt: '2025-03-15', requirement: '10 likes on a project' },
    { id: 'b5', name: 'Art Apprentice', description: 'Complete 10 Art Factory lessons', icon: 'color-palette', category: 'mastery', earnedAt: '2025-03-20', requirement: 'Complete 10 Art lessons' },
    { id: 'b6', name: 'Prompt Pro', description: 'Score 90+ on a prompt', icon: 'trophy', category: 'skill', earnedAt: '2025-03-22', requirement: 'Score 90+ on a prompt' },
  ],
  promptsCreated: 42,
  projectsCreated: 18,
  parentId: 'p1',
  createdAt: '2025-01-15',
};

const LEVEL_TITLES: Record<number, string> = {
  1: 'Prompt Newbie',
  2: 'Prompt Apprentice',
  3: 'Prompt Crafter',
  4: 'Prompt Builder',
  5: 'Prompt Artist',
  6: 'Prompt Master',
  7: 'Prompt Wizard',
  8: 'Prompt Legend',
  9: 'Prompt Champion',
  10: 'Prompt Grandmaster',
};

const RECENT_PROJECTS: Project[] = [
  {
    id: 'p1',
    userId: '1',
    trackId: 'story-studio',
    title: 'Dragon Adventure',
    prompt: 'Write a story about a friendly dragon',
    result: '',
    promptScore: { clarity: 80, creativity: 90, context: 75, result: 85, overall: 82, feedback: '', suggestions: [] },
    createdAt: '2026-03-25',
    isPublic: true,
    likes: 12,
  },
  {
    id: 'p2',
    userId: '1',
    trackId: 'art-factory',
    title: 'Space Cat',
    prompt: 'Draw a cat astronaut',
    result: '',
    promptScore: { clarity: 90, creativity: 95, context: 80, result: 88, overall: 88, feedback: '', suggestions: [] },
    createdAt: '2026-03-24',
    isPublic: true,
    likes: 25,
  },
  {
    id: 'p3',
    userId: '1',
    trackId: 'game-maker',
    title: 'Maze Runner',
    prompt: 'Make a maze game',
    result: '',
    promptScore: { clarity: 70, creativity: 80, context: 70, result: 75, overall: 74, feedback: '', suggestions: [] },
    createdAt: '2026-03-23',
    isPublic: false,
    likes: 0,
  },
];

const TRACK_META: Record<TrackId, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  'story-studio': { icon: 'book', color: COLORS.storyStudio },
  'web-builder': { icon: 'globe', color: COLORS.webBuilder },
  'game-maker': { icon: 'game-controller', color: COLORS.gameMaker },
  'art-factory': { icon: 'color-palette', color: COLORS.artFactory },
  'music-maker': { icon: 'musical-notes', color: COLORS.musicMaker },
  'code-explainer': { icon: 'code-slash', color: COLORS.codeExplainer },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const XP_RING_SIZE = 120;
const XP_RING_STROKE = 10;

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

const AvatarDisplay: React.FC<{ size?: number }> = ({ size = 90 }) => (
  <View style={[styles.avatarOuter, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
    <View style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="happy" size={size * 0.55} color={COLORS.primary} />
    </View>
  </View>
);

const XpProgressRing: React.FC<{ current: number; total: number; level: number }> = ({
  current,
  total,
  level,
}) => {
  const progress = Math.min(current / total, 1);
  const circumference = 2 * Math.PI * ((XP_RING_SIZE - XP_RING_STROKE) / 2);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.xpRingContainer}>
      {/* Background ring */}
      <View style={styles.xpRingBackground}>
        <View style={styles.xpRingInner}>
          <Text style={styles.xpRingLevel}>{level}</Text>
          <Text style={styles.xpRingLabel}>LEVEL</Text>
        </View>
      </View>
      {/* Progress indicator (simplified since SVG is not available) */}
      <View
        style={[
          styles.xpRingProgress,
          {
            borderColor: COLORS.primary,
            borderTopColor: 'transparent',
            borderRightColor: progress > 0.25 ? COLORS.primary : 'transparent',
            borderBottomColor: progress > 0.5 ? COLORS.primary : 'transparent',
            borderLeftColor: progress > 0.75 ? COLORS.primary : 'transparent',
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      <Text style={styles.xpRingText}>
        {current} / {total} XP
      </Text>
    </View>
  );
};

const StatItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  color: string;
}> = ({ icon, value, label, color }) => (
  <View style={styles.statItem}>
    <View style={[styles.statIconCircle, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const BadgeItem: React.FC<{ badge: Badge }> = ({ badge }) => {
  const categoryColors: Record<string, string> = {
    creation: COLORS.storyStudio,
    skill: COLORS.primary,
    streak: COLORS.streak,
    social: COLORS.webBuilder,
    mastery: COLORS.xpGold,
  };
  const color = categoryColors[badge.category] ?? COLORS.primary;

  return (
    <View style={styles.badgeItem}>
      <View style={[styles.badgeIconCircle, { backgroundColor: color + '20' }]}>
        <Ionicons name={(badge.icon as keyof typeof Ionicons.glyphMap) ?? 'ribbon'} size={24} color={color} />
      </View>
      <Text style={styles.badgeName} numberOfLines={1}>
        {badge.name}
      </Text>
    </View>
  );
};

const ProjectRow: React.FC<{ project: Project; onPress: () => void }> = ({ project, onPress }) => {
  const track = TRACK_META[project.trackId];
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.projectRow}>
      <View style={[styles.projectIcon, { backgroundColor: track.color }]}>
        <Ionicons name={track.icon} size={20} color="#fff" />
      </View>
      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle} numberOfLines={1}>
          {project.title}
        </Text>
        <Text style={styles.projectDate}>{project.createdAt}</Text>
      </View>
      <View style={styles.projectScore}>
        <Text style={styles.projectScoreText}>{project.promptScore.overall}</Text>
        <Ionicons name="star" size={12} color={COLORS.xpGold} />
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
    </TouchableOpacity>
  );
};

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { xp, xpToNext, level, levelTitle, streak, badges: earnedBadges } = useGame();

  const displayName = user?.displayName ?? user?.username ?? 'Learner';
  const username = user?.username ?? '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header / Avatar Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerBg}>
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarWrapper}>
          <AvatarDisplay size={90} />
        </View>

        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.username}>@{username}</Text>

        {/* Level badge */}
        <View style={styles.levelBadge}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.xpGold} />
          <Text style={styles.levelBadgeText}>{levelTitle}</Text>
        </View>
      </View>

      {/* XP Progress Ring */}
      <XpProgressRing current={xp} total={xpToNext} level={level} />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatItem icon="construct" value={MOCK_CHILD.projectsCreated} label="Projects" color={COLORS.webBuilder} />
        <StatItem icon="create" value={MOCK_CHILD.promptsCreated} label="Prompts" color={COLORS.primary} />
        <StatItem icon="flame" value={streak} label="Streak" color={COLORS.streak} />
      </View>

      {/* Badge Showcase */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon" size={22} color={COLORS.xpGold} />
          <Text style={styles.sectionTitle}>Badge Showcase</Text>
          <Text style={styles.sectionCount}>{earnedBadges.length} earned</Text>
        </View>
        <View style={styles.badgeGrid}>
          {earnedBadges.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} />
          ))}
        </View>
      </View>

      {/* Recent Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="folder-open" size={22} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Recent Projects</Text>
        </View>
        {RECENT_PROJECTS.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onPress={() => navigation.navigate('ProjectView', { projectId: project.id })}
          />
        ))}
      </View>

      {/* My Prompt Library Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.promptLibraryBtn}
        onPress={() => navigation.navigate('PromptLibrary')}
      >
        <Ionicons name="library" size={24} color="#fff" />
        <Text style={styles.promptLibraryText}>My Prompt Library</Text>
        <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>

      {/* Edit Profile Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.editProfileBtn}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="pencil" size={20} color={COLORS.primary} />
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.huge + SPACING.xxl,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  headerBg: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
  },
  editBtn: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginTop: -50,
  },
  avatarOuter: {
    borderWidth: 4,
    borderColor: COLORS.xpGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  username: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.xpGold + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  levelBadgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.xpGold,
    marginLeft: 6,
  },

  // XP Ring
  xpRingContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  xpRingBackground: {
    width: XP_RING_SIZE,
    height: XP_RING_SIZE,
    borderRadius: XP_RING_SIZE / 2,
    borderWidth: XP_RING_STROKE,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpRingProgress: {
    position: 'absolute',
    top: 0,
    width: XP_RING_SIZE,
    height: XP_RING_SIZE,
    borderRadius: XP_RING_SIZE / 2,
    borderWidth: XP_RING_STROKE,
  },
  xpRingInner: {
    alignItems: 'center',
  },
  xpRingLevel: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.primary,
  },
  xpRingLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  xpRingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    ...SHADOWS.small,
  },
  statItem: {
    alignItems: 'center',
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Sections
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  sectionCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },

  // Badge grid
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeItem: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 2) / 3,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badgeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  badgeName: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },

  // Recent projects
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
  projectDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  projectScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  projectScoreText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.xpGold,
    marginRight: 2,
  },

  // Prompt Library Button
  promptLibraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  promptLibraryText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: '#fff',
    marginHorizontal: SPACING.sm,
  },

  // Edit Profile Button
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  editProfileText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
});

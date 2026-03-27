import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import {
  RootStackParamList,
  TrackId,
  DailyQuest,
  Project,
  ChildProfile,
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
  badges: [],
  promptsCreated: 42,
  projectsCreated: 18,
  parentId: 'p1',
  createdAt: '2025-01-15',
};

const DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'q1',
    title: 'Write a Story Prompt',
    description: 'Create a prompt that tells a fun adventure story',
    trackId: 'story-studio',
    xpReward: 50,
    isCompleted: true,
    expiresAt: '2026-03-26T23:59:59Z',
  },
  {
    id: 'q2',
    title: 'Build a Web Page',
    description: 'Use prompts to create a colorful web page',
    trackId: 'web-builder',
    xpReward: 75,
    isCompleted: false,
    expiresAt: '2026-03-26T23:59:59Z',
  },
  {
    id: 'q3',
    title: 'Remix a Project',
    description: 'Find a project and make it your own',
    xpReward: 40,
    isCompleted: false,
    expiresAt: '2026-03-26T23:59:59Z',
  },
];

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

// -------------------------------------------------------------------
// Track definitions
// -------------------------------------------------------------------
interface TrackInfo {
  id: TrackId;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const TRACKS: TrackInfo[] = [
  { id: 'story-studio', name: 'Story Studio', icon: 'book', color: COLORS.storyStudio },
  { id: 'web-builder', name: 'Web Builder Jr', icon: 'globe', color: COLORS.webBuilder },
  { id: 'game-maker', name: 'Game Maker', icon: 'game-controller', color: COLORS.gameMaker },
  { id: 'art-factory', name: 'Art Factory', icon: 'color-palette', color: COLORS.artFactory },
  { id: 'music-maker', name: 'Music Maker', icon: 'musical-notes', color: COLORS.musicMaker },
  { id: 'code-explainer', name: 'Code Explainer', icon: 'code-slash', color: COLORS.codeExplainer },
];

const PROMPT_OF_THE_DAY = {
  title: 'Prompt of the Day',
  challenge: 'Write a prompt that creates a superhero who saves animals!',
  trackId: 'story-studio' as TrackId,
  xpReward: 100,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

const AvatarIcon: React.FC<{ avatar: string; size?: number }> = ({ size = 48 }) => (
  <View style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2 }]}>
    <Ionicons name="happy" size={size * 0.6} color={COLORS.primary} />
  </View>
);

const XpBar: React.FC<{ current: number; total: number; level: number }> = ({ current, total, level }) => {
  const progress = Math.min(current / total, 1);
  return (
    <View style={styles.xpBarContainer}>
      <View style={styles.xpLabelRow}>
        <Text style={styles.xpLevelText}>Level {level}</Text>
        <Text style={styles.xpNumbers}>
          {current} / {total} XP
        </Text>
      </View>
      <View style={styles.xpBarBackground}>
        <View style={[styles.xpBarFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const StreakBadge: React.FC<{ streak: number }> = ({ streak }) => (
  <View style={styles.streakBadge}>
    <Ionicons name="flame" size={20} color={COLORS.streak} />
    <Text style={styles.streakText}>{streak} day streak!</Text>
  </View>
);

const QuestCard: React.FC<{ quest: DailyQuest }> = ({ quest }) => {
  const trackColor = quest.trackId
    ? TRACKS.find((t) => t.id === quest.trackId)?.color ?? COLORS.primary
    : COLORS.primary;

  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.questCard, { borderLeftColor: trackColor }]}>
      <View style={styles.questCardContent}>
        <View style={styles.questHeader}>
          <Text style={styles.questTitle}>{quest.title}</Text>
          {quest.isCompleted && <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />}
        </View>
        <Text style={styles.questDescription}>{quest.description}</Text>
        <View style={styles.questFooter}>
          <Ionicons name="star" size={14} color={COLORS.xpGold} />
          <Text style={styles.questXp}>+{quest.xpReward} XP</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TrackCard: React.FC<{ track: TrackInfo; onPress: () => void }> = ({ track, onPress }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.trackCard, { backgroundColor: track.color }]}>
    <Ionicons name={track.icon} size={32} color="#fff" />
    <Text style={styles.trackCardLabel}>{track.name}</Text>
  </TouchableOpacity>
);

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const track = TRACKS.find((t) => t.id === project.trackId);
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.projectCard}>
      <View style={[styles.projectCardBanner, { backgroundColor: track?.color ?? COLORS.primary }]}>
        <Ionicons name={track?.icon ?? 'document'} size={28} color="#fff" />
      </View>
      <View style={styles.projectCardBody}>
        <Text style={styles.projectCardTitle} numberOfLines={1}>
          {project.title}
        </Text>
        <View style={styles.projectCardMeta}>
          <Ionicons name="heart" size={12} color={COLORS.streak} />
          <Text style={styles.projectLikes}>{project.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { xp, xpToNext, level, streak, badges, dailyQuests: gameDailyQuests } = useGame();

  const displayName = user?.displayName ?? user?.username ?? 'Learner';
  const avatar = user?.avatar ?? '';

  const handleTrackPress = useCallback(
    (trackId: TrackId) => {
      navigation.navigate('TrackDetail', { trackId });
    },
    [navigation],
  );

  // SectionList-style data rendered via FlatList for flexible layouts
  type SectionItem =
    | { type: 'greeting' }
    | { type: 'quests' }
    | { type: 'continueLearning' }
    | { type: 'tracks' }
    | { type: 'promptOfDay' }
    | { type: 'recentProjects' };

  const sections: SectionItem[] = [
    { type: 'greeting' },
    { type: 'quests' },
    { type: 'continueLearning' },
    { type: 'tracks' },
    { type: 'promptOfDay' },
    { type: 'recentProjects' },
  ];

  const renderItem = ({ item }: { item: SectionItem }) => {
    switch (item.type) {
      // ---- Greeting + XP + Streak ----
      case 'greeting':
        return (
          <View style={styles.greetingSection}>
            <View style={styles.greetingRow}>
              <AvatarIcon avatar={avatar} size={56} />
              <View style={styles.greetingText}>
                <Text style={styles.greetingHello}>Hey, {displayName}!</Text>
                <Text style={styles.greetingSub}>Ready to craft some awesome prompts?</Text>
              </View>
            </View>
            <XpBar current={xp} total={xpToNext} level={level} />
            <StreakBadge streak={streak} />
          </View>
        );

      // ---- Daily Quests ----
      case 'quests':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="compass" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Daily Quests</Text>
            </View>
            {gameDailyQuests.map((q) => (
              <QuestCard key={q.id} quest={q} />
            ))}
          </View>
        );

      // ---- Continue Learning ----
      case 'continueLearning': {
        const lastTrack = TRACKS[0]; // story-studio as mock
        return (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleTrackPress(lastTrack.id)}
            style={[styles.continueCard, { backgroundColor: lastTrack.color }]}
          >
            <View style={styles.continueContent}>
              <Ionicons name={lastTrack.icon} size={36} color="#fff" />
              <View style={styles.continueText}>
                <Text style={styles.continueLabel}>Continue Learning</Text>
                <Text style={styles.continueName}>{lastTrack.name}</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        );
      }

      // ---- Quick Access Tracks Grid ----
      case 'tracks':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="rocket" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Learning Tracks</Text>
            </View>
            <View style={styles.tracksGrid}>
              {TRACKS.map((t) => (
                <TrackCard key={t.id} track={t} onPress={() => handleTrackPress(t.id)} />
              ))}
            </View>
          </View>
        );

      // ---- Prompt of the Day ----
      case 'promptOfDay':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={22} color={COLORS.xpGold} />
              <Text style={styles.sectionTitle}>Prompt of the Day</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.promptOfDayCard}>
              <Text style={styles.promptOfDayChallenge}>{PROMPT_OF_THE_DAY.challenge}</Text>
              <View style={styles.promptOfDayFooter}>
                <View style={styles.promptOfDayReward}>
                  <Ionicons name="star" size={16} color={COLORS.xpGold} />
                  <Text style={styles.promptOfDayXp}>+{PROMPT_OF_THE_DAY.xpReward} XP</Text>
                </View>
                <View style={styles.promptOfDayBtn}>
                  <Text style={styles.promptOfDayBtnText}>Try it!</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );

      // ---- Recent Projects Carousel ----
      case 'recentProjects':
        return (
          <View style={[styles.section, { marginBottom: SPACING.huge }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="folder-open" size={22} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Recent Projects</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsScroll}>
              {RECENT_PROJECTS.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </ScrollView>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item.type}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default HomeScreen;

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------
const CARD_GAP = SPACING.md;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },

  // Greeting
  greetingSection: {
    marginBottom: SPACING.xl,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  greetingHello: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  greetingSub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // XP Bar
  xpBarContainer: {
    marginBottom: SPACING.sm,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  xpLevelText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
  },
  xpNumbers: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  xpBarBackground: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },

  // Streak
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.streak + '18',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  streakText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.streak,
    marginLeft: 4,
  },

  // Sections
  section: {
    marginBottom: SPACING.xl,
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
  },

  // Quest cards
  questCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  questCardContent: {
    padding: SPACING.md,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    flex: 1,
  },
  questDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  questFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  questXp: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.xpGold,
    marginLeft: 4,
  },

  // Continue Learning
  continueCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    ...SHADOWS.medium,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueText: {
    marginLeft: SPACING.md,
  },
  continueLabel: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FONTS.weights.medium,
  },
  continueName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: '#fff',
  },

  // Tracks grid
  tracksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  trackCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - CARD_GAP) / 2,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: CARD_GAP,
    minHeight: 110,
    ...SHADOWS.small,
  },
  trackCardLabel: {
    color: '#fff',
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // Prompt of the Day
  promptOfDayCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  promptOfDayChallenge: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: '#fff',
    lineHeight: 24,
  },
  promptOfDayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  promptOfDayReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptOfDayXp: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.xpGold,
    marginLeft: 4,
  },
  promptOfDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  promptOfDayBtnText: {
    color: '#fff',
    fontWeight: FONTS.weights.bold,
    marginRight: 4,
  },

  // Recent projects carousel
  projectsScroll: {
    paddingRight: SPACING.lg,
  },
  projectCard: {
    width: 150,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  projectCardBanner: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectCardBody: {
    padding: SPACING.sm,
  },
  projectCardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  projectCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  projectLikes: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
});

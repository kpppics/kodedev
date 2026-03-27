import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { LeaderboardEntry } from '../../types';

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------
const CURRENT_USER_ID = 'u8';

const generateLeaderboard = (seed: number): LeaderboardEntry[] => {
  const names = [
    'PixelWizard', 'StarCoder', 'StoryNinja', 'CodeDragon', 'ArtStar',
    'MusicFox', 'GameHero', 'PromptMaster', 'ByteKid', 'CreativeBot',
    'SparkCoder', 'DreamWriter', 'LogicLion', 'CloudCat', 'NovaPilot',
    'RocketRex', 'BrainWave', 'TechTiger', 'QuantumQuill', 'CyberStar',
  ];
  const avatars = ['fox', 'cat', 'bear', 'dragon', 'star', 'robot', 'owl', 'panda'];

  return names.map((name, i) => ({
    userId: `u${i + 1}`,
    username: name,
    avatar: avatars[i % avatars.length],
    xp: Math.max(100, Math.floor((3500 - i * (150 + seed * 10)) * (1 + seed * 0.1))),
    level: Math.max(1, 20 - i),
    rank: i + 1,
  }));
};

const LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  weekly: generateLeaderboard(0),
  monthly: generateLeaderboard(1),
  allTime: generateLeaderboard(2),
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

const PodiumSpot: React.FC<{ entry: LeaderboardEntry; position: 1 | 2 | 3 }> = ({ entry, position }) => {
  const config = {
    1: { color: COLORS.xpGold, height: 120, avatarSize: 64, fontSize: FONTS.sizes.xxl },
    2: { color: COLORS.xpSilver, height: 90, avatarSize: 52, fontSize: FONTS.sizes.xl },
    3: { color: COLORS.xpBronze, height: 70, avatarSize: 52, fontSize: FONTS.sizes.xl },
  };
  const c = config[position];

  return (
    <View style={[styles.podiumSpot, { order: position === 1 ? 0 : position === 2 ? -1 : 1 }]}>
      {/* Crown for 1st */}
      {position === 1 && (
        <Ionicons name="trophy" size={28} color={COLORS.xpGold} style={styles.crown} />
      )}
      <View style={[styles.podiumAvatar, { width: c.avatarSize, height: c.avatarSize, borderRadius: c.avatarSize / 2, borderColor: c.color }]}>
        <Ionicons name="happy" size={c.avatarSize * 0.55} color={COLORS.primary} />
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{entry.username}</Text>
      <Text style={[styles.podiumLevel, { color: c.color }]}>Lv.{entry.level}</Text>
      <View style={[styles.podiumBar, { height: c.height, backgroundColor: c.color }]}>
        <Text style={styles.podiumRank}>{position}</Text>
        <Text style={styles.podiumXp}>{entry.xp.toLocaleString()} XP</Text>
      </View>
    </View>
  );
};

const RankRow: React.FC<{ entry: LeaderboardEntry; isCurrentUser: boolean }> = ({ entry, isCurrentUser }) => (
  <View style={[styles.rankRow, isCurrentUser && styles.rankRowCurrent]}>
    <Text style={[styles.rankNumber, isCurrentUser && styles.rankNumberCurrent]}>{entry.rank}</Text>
    <View style={[styles.rankAvatar, isCurrentUser && styles.rankAvatarCurrent]}>
      <Ionicons name="happy" size={20} color={isCurrentUser ? '#fff' : COLORS.primary} />
    </View>
    <View style={styles.rankInfo}>
      <Text style={[styles.rankName, isCurrentUser && styles.rankNameCurrent]}>{entry.username}</Text>
      <Text style={[styles.rankLevel, isCurrentUser && styles.rankLevelCurrent]}>Level {entry.level}</Text>
    </View>
    <View style={styles.rankXpContainer}>
      <Ionicons name="star" size={14} color={isCurrentUser ? '#fff' : COLORS.xpGold} />
      <Text style={[styles.rankXp, isCurrentUser && styles.rankXpCurrent]}>{entry.xp.toLocaleString()}</Text>
    </View>
  </View>
);

// -------------------------------------------------------------------
// Main screen
// -------------------------------------------------------------------
type TabKey = 'weekly' | 'monthly' | 'allTime';

const TAB_LABELS: Record<TabKey, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  allTime: 'All-Time',
};

const LeaderboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('weekly');
  const leaderboard = LEADERBOARDS[activeTab];
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const currentUserEntry = leaderboard.find((e) => e.userId === CURRENT_USER_ID);

  const renderHeader = () => (
    <View>
      {/* Title */}
      <View style={styles.headerSection}>
        <Ionicons name="podium" size={28} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(Object.keys(TAB_LABELS) as TabKey[]).map((key) => (
          <TouchableOpacity
            key={key}
            activeOpacity={0.8}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key)}
          >
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
              {TAB_LABELS[key]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Podium */}
      <View style={styles.podiumSection}>
        {/* Render in order: 2nd, 1st, 3rd */}
        {top3[1] && <PodiumSpot entry={top3[1]} position={2} />}
        {top3[0] && <PodiumSpot entry={top3[0]} position={1} />}
        {top3[2] && <PodiumSpot entry={top3[2]} position={3} />}
      </View>

      {/* Current user highlight */}
      {currentUserEntry && (
        <View style={styles.yourRankSection}>
          <Text style={styles.yourRankLabel}>Your Rank</Text>
          <RankRow entry={currentUserEntry} isCurrentUser />
        </View>
      )}

      {/* List heading */}
      <Text style={styles.listHeading}>Rankings</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={rest}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={styles.rowPadding}>
            <RankRow entry={item} isCurrentUser={item.userId === CURRENT_USER_ID} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={<View style={{ height: SPACING.huge }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default LeaderboardScreen;

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingTop: SPACING.xl,
  },

  // Header
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.text,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },

  // Podium
  podiumSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  podiumSpot: {
    alignItems: 'center',
    flex: 1,
  },
  crown: {
    marginBottom: SPACING.xs,
  },
  podiumAvatar: {
    borderWidth: 3,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  podiumName: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumLevel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    marginBottom: SPACING.xs,
  },
  podiumBar: {
    width: '100%',
    borderTopLeftRadius: RADIUS.md,
    borderTopRightRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  podiumRank: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.extrabold,
    color: '#fff',
  },
  podiumXp: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },

  // Your rank
  yourRankSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  yourRankLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },

  // Rank row
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  rankRowCurrent: {
    backgroundColor: COLORS.primary,
  },
  rankNumber: {
    width: 28,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  rankNumberCurrent: {
    color: '#fff',
  },
  rankAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  rankAvatarCurrent: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  rankNameCurrent: {
    color: '#fff',
  },
  rankLevel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rankLevelCurrent: {
    color: 'rgba(255,255,255,0.8)',
  },
  rankXpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankXp: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  rankXpCurrent: {
    color: '#fff',
  },

  // List
  listHeading: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  rowPadding: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
});

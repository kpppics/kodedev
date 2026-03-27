import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import {
  RootStackParamList,
  PromptBattle,
  LeaderboardEntry,
  TrackId,
} from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// -------------------------------------------------------------------
// Track color / icon helper
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
const FEATURED_BATTLE: PromptBattle = {
  id: 'b0',
  challenge: 'Write a prompt that creates a magical creature that helps kids learn math!',
  trackId: 'story-studio',
  entries: new Array(24).fill(null).map((_, i) => ({
    userId: `u${i}`,
    username: `player${i}`,
    prompt: '',
    result: '',
    votes: Math.floor(Math.random() * 20),
  })),
  startsAt: '2026-03-23T00:00:00Z',
  endsAt: '2026-03-29T23:59:59Z',
  status: 'active',
};

const ACTIVE_BATTLES: PromptBattle[] = [
  {
    id: 'b1',
    challenge: 'Design a superhero website landing page using only emojis in your prompt!',
    trackId: 'web-builder',
    entries: new Array(18).fill(null).map((_, i) => ({
      userId: `u${i}`,
      username: `coder${i}`,
      prompt: '',
      result: '',
      votes: 0,
    })),
    startsAt: '2026-03-25T10:00:00Z',
    endsAt: '2026-03-27T10:00:00Z',
    status: 'active',
  },
  {
    id: 'b2',
    challenge: 'Create the funniest short game about a penguin in space!',
    trackId: 'game-maker',
    entries: new Array(12).fill(null).map((_, i) => ({
      userId: `u${i}`,
      username: `gamer${i}`,
      prompt: '',
      result: '',
      votes: 0,
    })),
    startsAt: '2026-03-24T08:00:00Z',
    endsAt: '2026-03-28T08:00:00Z',
    status: 'active',
  },
];

const PAST_BATTLES: PromptBattle[] = [
  {
    id: 'b3',
    challenge: 'Write a spooky (but kid-friendly!) Halloween story prompt',
    trackId: 'story-studio',
    entries: new Array(30).fill(null).map((_, i) => ({
      userId: `u${i}`,
      username: `writer${i}`,
      prompt: '',
      result: '',
      votes: Math.floor(Math.random() * 50),
    })),
    startsAt: '2026-03-16T00:00:00Z',
    endsAt: '2026-03-22T23:59:59Z',
    status: 'completed',
    winnerId: 'u3',
  },
  {
    id: 'b4',
    challenge: 'Compose a cheerful morning song using creative prompts',
    trackId: 'music-maker',
    entries: new Array(15).fill(null).map((_, i) => ({
      userId: `u${i}`,
      username: `musician${i}`,
      prompt: '',
      result: '',
      votes: Math.floor(Math.random() * 40),
    })),
    startsAt: '2026-03-09T00:00:00Z',
    endsAt: '2026-03-15T23:59:59Z',
    status: 'completed',
    winnerId: 'u7',
  },
];

const WEEKLY_LEADERS: LeaderboardEntry[] = [
  { userId: 'u1', username: 'PixelWizard', avatar: 'fox', xp: 1250, level: 12, rank: 1 },
  { userId: 'u2', username: 'StarCoder', avatar: 'cat', xp: 1100, level: 11, rank: 2 },
  { userId: 'u3', username: 'StoryNinja', avatar: 'bear', xp: 980, level: 10, rank: 3 },
  { userId: 'u4', username: 'CodeDragon', avatar: 'dragon', xp: 870, level: 9, rank: 4 },
  { userId: 'u5', username: 'PromptStar', avatar: 'star', xp: 750, level: 8, rank: 5 },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
const useCountdown = (endDate: string) => {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Ended');
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) setRemaining(`${days}d ${hrs}h left`);
      else if (hrs > 0) setRemaining(`${hrs}h ${mins}m left`);
      else setRemaining(`${mins}m left`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [endDate]);

  return remaining;
};

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

const FeaturedBattleCard: React.FC<{ battle: PromptBattle; onPress: () => void }> = ({ battle, onPress }) => {
  const countdown = useCountdown(battle.endsAt);
  const track = TRACK_META[battle.trackId];

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.featuredCard}>
      <View style={styles.featuredHeader}>
        <View style={styles.featuredBadge}>
          <Ionicons name="trophy" size={16} color={COLORS.xpGold} />
          <Text style={styles.featuredBadgeText}>This Week's Challenge</Text>
        </View>
        <View style={styles.countdownPill}>
          <Ionicons name="time" size={14} color="#fff" />
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      </View>

      <Text style={styles.featuredChallenge}>{battle.challenge}</Text>

      <View style={styles.featuredMeta}>
        <View style={[styles.trackPill, { backgroundColor: track.color + '25' }]}>
          <Ionicons name={track.icon} size={14} color={track.color} />
          <Text style={[styles.trackPillText, { color: track.color }]}>{track.label}</Text>
        </View>
        <View style={styles.participantsRow}>
          <Ionicons name="people" size={16} color="#fff" />
          <Text style={styles.participantsText}>{battle.entries.length} joined</Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.joinBtnFeatured} onPress={onPress}>
        <Ionicons name="flash" size={18} color={COLORS.primary} />
        <Text style={styles.joinBtnFeaturedText}>Join Battle</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const BattleCard: React.FC<{ battle: PromptBattle; onPress: () => void }> = ({ battle, onPress }) => {
  const countdown = useCountdown(battle.endsAt);
  const track = TRACK_META[battle.trackId];

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.battleCard}>
      <View style={[styles.battleCardStripe, { backgroundColor: track.color }]} />
      <View style={styles.battleCardBody}>
        <View style={styles.battleCardHeader}>
          <View style={[styles.trackPillSmall, { backgroundColor: track.color + '20' }]}>
            <Ionicons name={track.icon} size={12} color={track.color} />
            <Text style={[styles.trackPillSmallText, { color: track.color }]}>{track.label}</Text>
          </View>
          <View style={styles.countdownSmall}>
            <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.countdownSmallText}>{countdown}</Text>
          </View>
        </View>

        <Text style={styles.battleCardChallenge} numberOfLines={2}>{battle.challenge}</Text>

        <View style={styles.battleCardFooter}>
          <View style={styles.participantsSmall}>
            <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.participantsSmallText}>{battle.entries.length} participants</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={[styles.joinBtn, { backgroundColor: track.color }]} onPress={onPress}>
            <Text style={styles.joinBtnText}>Join</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PastBattleCard: React.FC<{ battle: PromptBattle; onPress: () => void }> = ({ battle, onPress }) => {
  const track = TRACK_META[battle.trackId];
  const winner = battle.entries.find((e) => e.userId === battle.winnerId);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.pastCard}>
      <View style={[styles.pastStripe, { backgroundColor: track.color }]} />
      <View style={styles.pastBody}>
        <Text style={styles.pastChallenge} numberOfLines={1}>{battle.challenge}</Text>
        <View style={styles.pastMeta}>
          <Ionicons name="trophy" size={14} color={COLORS.xpGold} />
          <Text style={styles.pastWinner}>Winner: {winner?.username ?? 'Unknown'}</Text>
          <Text style={styles.pastParticipants}>{battle.entries.length} entries</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );
};

const LeaderRow: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => {
  const medalColor = entry.rank === 1 ? COLORS.xpGold : entry.rank === 2 ? COLORS.xpSilver : entry.rank === 3 ? COLORS.xpBronze : COLORS.textLight;
  const medalIcon: keyof typeof Ionicons.glyphMap = entry.rank <= 3 ? 'medal' : 'ellipse';

  return (
    <View style={styles.leaderRow}>
      <View style={styles.leaderRank}>
        {entry.rank <= 3 ? (
          <Ionicons name={medalIcon} size={20} color={medalColor} />
        ) : (
          <Text style={styles.leaderRankText}>{entry.rank}</Text>
        )}
      </View>
      <View style={styles.leaderAvatar}>
        <Ionicons name="happy" size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.leaderName} numberOfLines={1}>{entry.username}</Text>
      <Text style={styles.leaderXp}>{entry.xp} XP</Text>
    </View>
  );
};

// -------------------------------------------------------------------
// Section items
// -------------------------------------------------------------------
type SectionItem =
  | { type: 'header' }
  | { type: 'featured' }
  | { type: 'activeBattles' }
  | { type: 'leaderboardPreview' }
  | { type: 'pastBattles' };

// -------------------------------------------------------------------
// Main screen
// -------------------------------------------------------------------
const BattlesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleBattlePress = useCallback(
    (battleId: string) => {
      navigation.navigate('PromptBattle', { battleId });
    },
    [navigation],
  );

  const sections: SectionItem[] = [
    { type: 'header' },
    { type: 'featured' },
    { type: 'activeBattles' },
    { type: 'leaderboardPreview' },
    { type: 'pastBattles' },
  ];

  const renderItem = ({ item }: { item: SectionItem }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.headerSection}>
            <View style={styles.headerRow}>
              <Ionicons name="flash" size={28} color={COLORS.xpGold} />
              <Text style={styles.headerTitle}>Prompt Battles</Text>
              <Ionicons name="trophy" size={28} color={COLORS.xpGold} />
            </View>
            <Text style={styles.headerSub}>Compete with other prompt crafters and win XP!</Text>
          </View>
        );

      case 'featured':
        return (
          <View style={styles.section}>
            <FeaturedBattleCard battle={FEATURED_BATTLE} onPress={() => handleBattlePress(FEATURED_BATTLE.id)} />
          </View>
        );

      case 'activeBattles':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame" size={20} color={COLORS.streak} />
              <Text style={styles.sectionTitle}>Active Battles</Text>
            </View>
            {ACTIVE_BATTLES.map((b) => (
              <BattleCard key={b.id} battle={b} onPress={() => handleBattlePress(b.id)} />
            ))}
          </View>
        );

      case 'leaderboardPreview':
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="podium" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
            </View>
            <View style={styles.leaderboardCard}>
              {WEEKLY_LEADERS.map((entry) => (
                <LeaderRow key={entry.userId} entry={entry} />
              ))}
              <TouchableOpacity activeOpacity={0.8} style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View Full Leaderboard</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'pastBattles':
        return (
          <View style={[styles.section, { marginBottom: SPACING.huge }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color={COLORS.textSecondary} />
              <Text style={styles.sectionTitle}>Past Battles</Text>
            </View>
            {PAST_BATTLES.map((b) => (
              <PastBattleCard key={b.id} battle={b} onPress={() => handleBattlePress(b.id)} />
            ))}
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

export default BattlesScreen;

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.text,
  },
  headerSub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
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

  // Featured card
  featuredCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  featuredBadgeText: {
    color: COLORS.xpGold,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    marginLeft: 4,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  countdownText: {
    color: '#fff',
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    marginLeft: 4,
  },
  featuredChallenge: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: '#fff',
    lineHeight: 28,
    marginBottom: SPACING.md,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  trackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  trackPillText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    marginLeft: 4,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.sizes.sm,
    marginLeft: 4,
  },
  joinBtnFeatured: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  joinBtnFeaturedText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },

  // Battle card
  battleCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  battleCardStripe: {
    width: 6,
  },
  battleCardBody: {
    flex: 1,
    padding: SPACING.md,
  },
  battleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trackPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  trackPillSmallText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    marginLeft: 4,
  },
  countdownSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownSmallText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  battleCardChallenge: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  battleCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsSmallText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },

  // Past battles
  pastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  pastStripe: {
    width: 5,
    alignSelf: 'stretch',
  },
  pastBody: {
    flex: 1,
    padding: SPACING.md,
  },
  pastChallenge: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  pastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pastWinner: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.xpGold,
  },
  pastParticipants: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },

  // Weekly leaderboard preview
  leaderboardCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leaderRank: {
    width: 28,
    alignItems: 'center',
  },
  leaderRankText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
  },
  leaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  leaderName: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  leaderXp: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  viewAllText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
  },
});

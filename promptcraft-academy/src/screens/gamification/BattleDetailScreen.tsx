import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import {
  RootStackParamList,
  PromptBattle,
  BattleEntry,
  TrackId,
} from '../../types';

type BattleDetailRoute = RouteProp<RootStackParamList, 'PromptBattle'>;

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
const MOCK_ENTRIES: BattleEntry[] = [
  { userId: 'u1', username: 'PixelWizard', prompt: 'Create a friendly dragon who teaches multiplication using treasure coins!', result: '', votes: 14 },
  { userId: 'u2', username: 'StarCoder', prompt: 'Design a math garden where flowers bloom when you solve equations!', result: '', votes: 22 },
  { userId: 'u3', username: 'StoryNinja', prompt: 'Build a space station where astronauts fix math problems to power the ship!', result: '', votes: 18 },
  { userId: 'u4', username: 'CodeDragon', prompt: 'Write about a chef who uses fractions to bake magical cakes!', result: '', votes: 9 },
  { userId: 'u5', username: 'ArtStar', prompt: 'Create a jungle adventure where animals quiz you with math puzzles!', result: '', votes: 31 },
  { userId: 'u6', username: 'MusicFox', prompt: 'Design a rhythm game where musical notes equal math answers!', result: '', votes: 7 },
];

const MOCK_BATTLE: PromptBattle = {
  id: 'b0',
  challenge: 'Write a prompt that creates a magical creature that helps kids learn math!',
  trackId: 'story-studio',
  entries: MOCK_ENTRIES,
  startsAt: '2026-03-23T00:00:00Z',
  endsAt: '2026-03-29T23:59:59Z',
  status: 'voting',
};

const MOCK_COMPLETED_BATTLE: PromptBattle = {
  ...MOCK_BATTLE,
  status: 'completed',
  winnerId: 'u5',
};

const XP_EARNED = 150;

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
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      if (d > 0) setRemaining(`${d}d ${h}h ${m}m`);
      else if (h > 0) setRemaining(`${h}h ${m}m`);
      else setRemaining(`${m}m`);
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

const StatusBadge: React.FC<{ status: PromptBattle['status'] }> = ({ status }) => {
  const config: Record<PromptBattle['status'], { bg: string; text: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
    upcoming: { bg: COLORS.warning + '20', text: COLORS.warning, label: 'Upcoming', icon: 'hourglass' },
    active: { bg: COLORS.success + '20', text: COLORS.success, label: 'Active', icon: 'flash' },
    voting: { bg: COLORS.primary + '20', text: COLORS.primary, label: 'Voting Phase', icon: 'thumbs-up' },
    completed: { bg: COLORS.xpGold + '20', text: COLORS.xpGold, label: 'Completed', icon: 'trophy' },
  };
  const c = config[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={14} color={c.text} />
      <Text style={[styles.statusBadgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
};

const EntryCard: React.FC<{
  entry: BattleEntry;
  isVoting: boolean;
  hasVoted: boolean;
  onVote: (userId: string) => void;
}> = ({ entry, isVoting, hasVoted, onVote }) => (
  <View style={styles.entryCard}>
    <View style={styles.entryHeader}>
      <View style={styles.entryAvatar}>
        <Ionicons name="happy" size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.entryUsername}>{entry.username}</Text>
      <View style={styles.voteCount}>
        <Ionicons name="heart" size={14} color={COLORS.streak} />
        <Text style={styles.voteCountText}>{entry.votes}</Text>
      </View>
    </View>
    <Text style={styles.entryPrompt}>{entry.prompt}</Text>
    {isVoting && (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.voteBtn, hasVoted && styles.voteBtnDisabled]}
        onPress={() => onVote(entry.userId)}
        disabled={hasVoted}
      >
        <Ionicons name={hasVoted ? 'checkmark-circle' : 'thumbs-up'} size={16} color={hasVoted ? COLORS.textLight : '#fff'} />
        <Text style={[styles.voteBtnText, hasVoted && styles.voteBtnTextDisabled]}>
          {hasVoted ? 'Voted' : 'Vote'}
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

const WinnerCelebration: React.FC<{ winner: BattleEntry; xpEarned: number }> = ({ winner, xpEarned }) => (
  <View style={styles.winnerSection}>
    <View style={styles.winnerGlow}>
      <Ionicons name="trophy" size={48} color={COLORS.xpGold} />
    </View>
    <Text style={styles.winnerTitle}>Winner!</Text>
    <View style={styles.winnerAvatarLarge}>
      <Ionicons name="happy" size={36} color={COLORS.primary} />
    </View>
    <Text style={styles.winnerName}>{winner.username}</Text>
    <Text style={styles.winnerPrompt}>"{winner.prompt}"</Text>
    <View style={styles.winnerVotes}>
      <Ionicons name="heart" size={18} color={COLORS.streak} />
      <Text style={styles.winnerVotesText}>{winner.votes} votes</Text>
    </View>
    <View style={styles.xpEarnedBadge}>
      <Ionicons name="star" size={20} color={COLORS.xpGold} />
      <Text style={styles.xpEarnedText}>+{xpEarned} XP Earned!</Text>
    </View>
  </View>
);

// -------------------------------------------------------------------
// Main screen
// -------------------------------------------------------------------
const BattleDetailScreen: React.FC = () => {
  const route = useRoute<BattleDetailRoute>();
  // In a real app we would fetch battle by route.params.battleId
  const [viewMode, setViewMode] = useState<'active' | 'voting' | 'completed'>('active');
  const [promptText, setPromptText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [votedFor, setVotedFor] = useState<string | null>(null);

  const battle = viewMode === 'completed' ? MOCK_COMPLETED_BATTLE : { ...MOCK_BATTLE, status: viewMode as PromptBattle['status'] };
  const track = TRACK_META[battle.trackId];
  const countdown = useCountdown(battle.endsAt);

  const handleSubmit = useCallback(() => {
    if (promptText.trim().length > 0) {
      setSubmitted(true);
    }
  }, [promptText]);

  const handleVote = useCallback((userId: string) => {
    setVotedFor(userId);
  }, []);

  const winner = battle.status === 'completed'
    ? battle.entries.find((e) => e.userId === battle.winnerId) ?? battle.entries[0]
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Challenge header */}
      <View style={[styles.challengeHeader, { backgroundColor: track.color }]}>
        <StatusBadge status={battle.status as PromptBattle['status']} />
        <Text style={styles.challengeText}>{battle.challenge}</Text>
        <View style={styles.challengeMeta}>
          <View style={styles.challengeTrack}>
            <Ionicons name={track.icon} size={16} color="#fff" />
            <Text style={styles.challengeTrackText}>{track.label}</Text>
          </View>
          {battle.status !== 'completed' && (
            <View style={styles.challengeTimer}>
              <Ionicons name="time" size={16} color="#fff" />
              <Text style={styles.challengeTimerText}>{countdown}</Text>
            </View>
          )}
        </View>
        <View style={styles.challengeStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={18} color="#fff" />
            <Text style={styles.statText}>{battle.entries.length} participants</Text>
          </View>
        </View>
      </View>

      {/* Phase toggle for demo */}
      <View style={styles.phaseTabs}>
        {(['active', 'voting', 'completed'] as const).map((phase) => (
          <TouchableOpacity
            key={phase}
            activeOpacity={0.8}
            style={[styles.phaseTab, viewMode === phase && styles.phaseTabActive]}
            onPress={() => { setViewMode(phase); setSubmitted(false); setVotedFor(null); }}
          >
            <Text style={[styles.phaseTabText, viewMode === phase && styles.phaseTabTextActive]}>
              {phase.charAt(0).toUpperCase() + phase.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active: prompt input */}
      {viewMode === 'active' && (
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Your Prompt Entry</Text>
          {!submitted ? (
            <>
              <TextInput
                style={styles.promptInput}
                placeholder="Write your best prompt here..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={promptText}
                onChangeText={setPromptText}
                maxLength={500}
              />
              <Text style={styles.charCount}>{promptText.length}/500</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.submitBtn, promptText.trim().length === 0 && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={promptText.trim().length === 0}
              >
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Submit Entry</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.submittedBox}>
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
              <Text style={styles.submittedTitle}>Entry Submitted!</Text>
              <Text style={styles.submittedSub}>Your prompt has been entered into the battle. Good luck!</Text>
            </View>
          )}
        </View>
      )}

      {/* Voting: entries gallery */}
      {viewMode === 'voting' && (
        <View style={styles.votingSection}>
          <View style={styles.votingHeader}>
            <Ionicons name="thumbs-up" size={20} color={COLORS.primary} />
            <Text style={styles.votingTitle}>Vote for Your Favorite!</Text>
          </View>
          <Text style={styles.votingSub}>Tap "Vote" on the prompt you think is the best. You get one vote!</Text>
          {MOCK_ENTRIES.map((entry) => (
            <EntryCard
              key={entry.userId}
              entry={entry}
              isVoting
              hasVoted={votedFor !== null}
              onVote={handleVote}
            />
          ))}
        </View>
      )}

      {/* Completed: winner celebration */}
      {viewMode === 'completed' && winner && (
        <>
          <WinnerCelebration winner={winner} xpEarned={XP_EARNED} />
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>All Entries</Text>
            {[...MOCK_ENTRIES].sort((a, b) => b.votes - a.votes).map((entry, idx) => (
              <View key={entry.userId} style={styles.resultRow}>
                <Text style={styles.resultRank}>#{idx + 1}</Text>
                <View style={styles.resultAvatar}>
                  <Ionicons name="happy" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.resultName} numberOfLines={1}>{entry.username}</Text>
                <View style={styles.resultVotes}>
                  <Ionicons name="heart" size={12} color={COLORS.streak} />
                  <Text style={styles.resultVotesText}>{entry.votes}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* XP earned display */}
      {viewMode === 'completed' && (
        <View style={styles.xpSummary}>
          <Text style={styles.xpSummaryTitle}>Your Battle Rewards</Text>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>Participation</Text>
            <Text style={styles.xpValue}>+50 XP</Text>
          </View>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>Votes Received</Text>
            <Text style={styles.xpValue}>+30 XP</Text>
          </View>
          <View style={styles.xpRow}>
            <Text style={styles.xpLabel}>Top 3 Bonus</Text>
            <Text style={styles.xpValue}>+70 XP</Text>
          </View>
          <View style={styles.xpDivider} />
          <View style={styles.xpRow}>
            <Text style={styles.xpTotalLabel}>Total</Text>
            <View style={styles.xpTotalRow}>
              <Ionicons name="star" size={18} color={COLORS.xpGold} />
              <Text style={styles.xpTotalValue}>+{XP_EARNED} XP</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default BattleDetailScreen;

// -------------------------------------------------------------------
// Styles
// -------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.huge,
  },

  // Challenge header
  challengeHeader: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxxl,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
  },
  challengeText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: '#fff',
    lineHeight: 32,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  challengeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  challengeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeTrackText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  challengeTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  challengeTimerText: {
    color: '#fff',
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
  challengeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FONTS.sizes.sm,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },

  // Phase toggle
  phaseTabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.xs,
  },
  phaseTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  phaseTabActive: {
    backgroundColor: COLORS.primary,
  },
  phaseTabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  phaseTabTextActive: {
    color: '#fff',
  },

  // Prompt input section
  inputSection: {
    margin: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  promptInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    minHeight: 140,
    ...SHADOWS.small,
  },
  charCount: {
    textAlign: 'right',
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.textLight,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  submittedBox: {
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
  },
  submittedTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.success,
    marginTop: SPACING.md,
  },
  submittedSub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Voting section
  votingSection: {
    margin: SPACING.lg,
  },
  votingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  votingTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  votingSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },

  // Entry card
  entryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  entryAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryUsername: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteCountText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.streak,
  },
  entryPrompt: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  voteBtnDisabled: {
    backgroundColor: COLORS.surfaceLight,
  },
  voteBtnText: {
    color: '#fff',
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  voteBtnTextDisabled: {
    color: COLORS.textLight,
  },

  // Winner celebration
  winnerSection: {
    alignItems: 'center',
    margin: SPACING.lg,
    backgroundColor: COLORS.xpGold + '12',
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    borderWidth: 2,
    borderColor: COLORS.xpGold + '30',
  },
  winnerGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.xpGold + '25',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  winnerTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.xpGold,
    marginBottom: SPACING.md,
  },
  winnerAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  winnerName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  winnerPrompt: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  winnerVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.lg,
  },
  winnerVotesText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.streak,
  },
  xpEarnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.xpGold + '25',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  xpEarnedText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.xpGold,
  },

  // Results
  resultsSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  resultsTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  resultRank: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    width: 32,
  },
  resultAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultName: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  resultVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultVotesText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.streak,
  },

  // XP Summary
  xpSummary: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  xpSummaryTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  xpLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  xpValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.success,
  },
  xpDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  xpTotalLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  xpTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  xpTotalValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.extrabold,
    color: COLORS.xpGold,
  },
});

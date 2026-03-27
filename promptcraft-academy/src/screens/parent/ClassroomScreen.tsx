import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import {
  Classroom,
  ClassroomChallenge,
  ClassroomSubmission,
  TrackId,
} from '../../types';

// ── Types ──────────────────────────────────────────────────
interface StudentOverview {
  id: string;
  name: string;
  avatar: string;
  level: number;
  completedChallenges: number;
  totalChallenges: number;
  avgScore: number;
}

// ── Mock Data ──────────────────────────────────────────────
const MOCK_CLASSROOM: Classroom = {
  id: 'c1',
  name: 'Year 5 Digital Skills',
  teacherId: 't1',
  studentIds: Array.from({ length: 24 }, (_, i) => `s${i + 1}`),
  challenges: [],
  createdAt: '2025-09-01',
};

const MOCK_CHALLENGES: (ClassroomChallenge & { status: 'active' | 'upcoming' | 'completed' })[] = [
  {
    id: 'ch1',
    title: 'Create a Fairy Tale',
    description: 'Use prompt engineering to generate an original fairy tale with a hero, villain, and moral.',
    trackId: 'story-studio',
    dueDate: '2026-03-28',
    submissions: Array.from({ length: 18 }, (_, i) => ({
      studentId: `s${i + 1}`,
      projectId: `p${i + 1}`,
      submittedAt: '2026-03-25',
      grade: i < 10 ? ['A', 'A-', 'B+', 'B', 'B+', 'A', 'A-', 'B', 'A', 'B+'][i] : undefined,
      feedback: i < 10 ? 'Good work on prompt specificity.' : undefined,
    })),
    status: 'active',
  },
  {
    id: 'ch2',
    title: 'Design a Homepage',
    description: 'Craft prompts to build a personal homepage with navigation, hero section, and footer.',
    trackId: 'web-builder',
    dueDate: '2026-04-04',
    submissions: Array.from({ length: 6 }, (_, i) => ({
      studentId: `s${i + 1}`,
      projectId: `p${i + 100}`,
      submittedAt: '2026-03-26',
    })),
    status: 'active',
  },
  {
    id: 'ch3',
    title: 'Build a Quiz Game',
    description: 'Use Game Maker track to create an interactive quiz using prompt engineering.',
    trackId: 'game-maker',
    dueDate: '2026-04-11',
    submissions: [],
    status: 'upcoming',
  },
];

const MOCK_STUDENTS: StudentOverview[] = [
  { id: 's1', name: 'Amelia R.', avatar: '👧', level: 6, completedChallenges: 8, totalChallenges: 10, avgScore: 88 },
  { id: 's2', name: 'Ben T.', avatar: '👦', level: 5, completedChallenges: 7, totalChallenges: 10, avgScore: 82 },
  { id: 's3', name: 'Charlie W.', avatar: '🧒', level: 7, completedChallenges: 10, totalChallenges: 10, avgScore: 94 },
  { id: 's4', name: 'Daisy L.', avatar: '👧', level: 4, completedChallenges: 5, totalChallenges: 10, avgScore: 71 },
  { id: 's5', name: 'Ethan K.', avatar: '👦', level: 6, completedChallenges: 9, totalChallenges: 10, avgScore: 85 },
  { id: 's6', name: 'Freya M.', avatar: '👧', level: 5, completedChallenges: 6, totalChallenges: 10, avgScore: 78 },
];

const TRACK_COLORS: Record<TrackId, string> = {
  'story-studio': COLORS.storyStudio,
  'web-builder': COLORS.webBuilder,
  'game-maker': COLORS.gameMaker,
  'art-factory': COLORS.artFactory,
  'music-maker': COLORS.musicMaker,
  'code-explainer': COLORS.codeExplainer,
};

const TRACK_ICONS: Record<TrackId, string> = {
  'story-studio': 'book',
  'web-builder': 'globe',
  'game-maker': 'game-controller',
  'art-factory': 'color-palette',
  'music-maker': 'musical-notes',
  'code-explainer': 'code-slash',
};

// ── Component ──────────────────────────────────────────────
export default function ClassroomScreen() {
  const [selectedTab, setSelectedTab] = useState<'challenges' | 'students' | 'submissions'>('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});

  const activeChallenges = MOCK_CHALLENGES.filter((c) => c.status === 'active');
  const selectedChallengeData = MOCK_CHALLENGES.find((c) => c.id === selectedChallenge);

  // ── Render helpers ────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>{MOCK_CLASSROOM.name}</Text>
        <Text style={styles.headerSubtitle}>
          {MOCK_CLASSROOM.studentIds.length} students
        </Text>
      </View>
      <TouchableOpacity style={styles.headerAction}>
        <Ionicons name="settings-outline" size={22} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabs}>
      {([
        { key: 'challenges', label: 'Challenges', icon: 'trophy-outline' },
        { key: 'students', label: 'Students', icon: 'people-outline' },
        { key: 'submissions', label: 'Submissions', icon: 'documents-outline' },
      ] as const).map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
          onPress={() => setSelectedTab(tab.key)}
        >
          <Ionicons
            name={tab.icon as any}
            size={18}
            color={selectedTab === tab.key ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === tab.key && styles.tabTextActive,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChallengeCard = (challenge: typeof MOCK_CHALLENGES[0]) => {
    const trackColor = TRACK_COLORS[challenge.trackId];
    const trackIcon = TRACK_ICONS[challenge.trackId];
    const submissionCount = challenge.submissions.length;
    const totalStudents = MOCK_CLASSROOM.studentIds.length;
    const isUpcoming = challenge.status === 'upcoming';

    return (
      <TouchableOpacity
        key={challenge.id}
        style={[styles.challengeCard, isUpcoming && styles.challengeCardUpcoming]}
        onPress={() => setSelectedChallenge(challenge.id === selectedChallenge ? null : challenge.id)}
      >
        <View style={styles.challengeHeader}>
          <View style={[styles.trackBadge, { backgroundColor: trackColor + '20' }]}>
            <Ionicons name={trackIcon as any} size={18} color={trackColor} />
          </View>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDesc} numberOfLines={2}>
              {challenge.description}
            </Text>
          </View>
          {isUpcoming && (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingText}>Upcoming</Text>
            </View>
          )}
        </View>
        <View style={styles.challengeFooter}>
          <View style={styles.challengeStat}>
            <Ionicons name="document-text-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.challengeStatText}>
              {submissionCount}/{totalStudents} submitted
            </Text>
          </View>
          <View style={styles.challengeStat}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.challengeStatText}>Due {challenge.dueDate}</Text>
          </View>
        </View>
        {/* Progress bar */}
        <View style={styles.submissionBarBg}>
          <View
            style={[
              styles.submissionBarFill,
              { width: `${(submissionCount / totalStudents) * 100}%`, backgroundColor: trackColor },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderChallengesTab = () => (
    <View>
      {/* Create New Challenge */}
      <TouchableOpacity style={styles.createButton}>
        <Ionicons name="add-circle-outline" size={22} color="#FFF" />
        <Text style={styles.createButtonText}>Create New Challenge</Text>
      </TouchableOpacity>

      {/* Active Challenges */}
      <Text style={styles.sectionTitle}>Active Challenges</Text>
      {activeChallenges.map(renderChallengeCard)}

      {/* Upcoming */}
      <Text style={styles.sectionTitle}>Upcoming</Text>
      {MOCK_CHALLENGES.filter((c) => c.status === 'upcoming').map(renderChallengeCard)}
    </View>
  );

  const renderStudentCard = (student: StudentOverview) => {
    const completionPercent = (student.completedChallenges / student.totalChallenges) * 100;
    return (
      <View key={student.id} style={styles.studentCard}>
        <Text style={styles.studentAvatar}>{student.avatar}</Text>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentLevel}>Level {student.level}</Text>
        </View>
        <View style={styles.studentStats}>
          <View style={styles.studentProgressBg}>
            <View
              style={[styles.studentProgressFill, { width: `${completionPercent}%` }]}
            />
          </View>
          <Text style={styles.studentProgressLabel}>
            {student.completedChallenges}/{student.totalChallenges}
          </Text>
        </View>
        <View style={styles.studentScoreBadge}>
          <Text style={styles.studentScoreText}>{student.avgScore}%</Text>
        </View>
      </View>
    );
  };

  const renderStudentsTab = () => (
    <View>
      <Text style={styles.sectionTitle}>Student Progress</Text>
      <View style={styles.studentListHeader}>
        <Text style={styles.studentListHeaderText}>Student</Text>
        <Text style={styles.studentListHeaderText}>Progress</Text>
        <Text style={styles.studentListHeaderText}>Avg</Text>
      </View>
      {MOCK_STUDENTS.map(renderStudentCard)}
    </View>
  );

  const renderSubmissionItem = (submission: ClassroomSubmission, index: number) => {
    const student = MOCK_STUDENTS.find((s) => s.id === submission.studentId);
    const studentName = student?.name ?? `Student ${submission.studentId}`;
    const studentAvatar = student?.avatar ?? '🧑';

    return (
      <View key={`${submission.studentId}-${index}`} style={styles.submissionCard}>
        <View style={styles.submissionHeader}>
          <Text style={styles.submissionAvatar}>{studentAvatar}</Text>
          <View style={styles.submissionStudentInfo}>
            <Text style={styles.submissionName}>{studentName}</Text>
            <Text style={styles.submissionDate}>{submission.submittedAt}</Text>
          </View>
          {submission.grade ? (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>{submission.grade}</Text>
            </View>
          ) : (
            <View style={[styles.gradeBadge, styles.gradePending]}>
              <Text style={[styles.gradeText, styles.gradePendingText]}>Pending</Text>
            </View>
          )}
        </View>

        {submission.feedback ? (
          <View style={styles.feedbackExisting}>
            <Ionicons name="chatbubble-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.feedbackExistingText}>{submission.feedback}</Text>
          </View>
        ) : (
          <View style={styles.feedbackInputRow}>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Add feedback..."
              placeholderTextColor={COLORS.textLight}
              value={feedbackInputs[submission.studentId] ?? ''}
              onChangeText={(text) =>
                setFeedbackInputs((prev) => ({ ...prev, [submission.studentId]: text }))
              }
            />
            <TouchableOpacity style={styles.feedbackSendButton}>
              <Ionicons name="send" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Grade buttons for ungraded */}
        {!submission.grade && (
          <View style={styles.gradeButtonsRow}>
            {['A', 'B+', 'B', 'C+', 'C'].map((grade) => (
              <TouchableOpacity key={grade} style={styles.gradeOption}>
                <Text style={styles.gradeOptionText}>{grade}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSubmissionsTab = () => {
    const challenge = selectedChallengeData ?? MOCK_CHALLENGES[0];
    return (
      <View>
        {/* Challenge selector */}
        <Text style={styles.sectionTitle}>Submissions for</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.challengeFilter}>
          {MOCK_CHALLENGES.filter((c) => c.status === 'active').map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.challengeFilterChip,
                (selectedChallenge === c.id || (!selectedChallenge && c.id === MOCK_CHALLENGES[0].id)) &&
                  styles.challengeFilterChipActive,
              ]}
              onPress={() => setSelectedChallenge(c.id)}
            >
              <Text
                style={[
                  styles.challengeFilterText,
                  (selectedChallenge === c.id || (!selectedChallenge && c.id === MOCK_CHALLENGES[0].id)) &&
                    styles.challengeFilterTextActive,
                ]}
              >
                {c.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {challenge.submissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyStateText}>No submissions yet</Text>
          </View>
        ) : (
          challenge.submissions.slice(0, 6).map((sub, i) => renderSubmissionItem(sub, i))
        )}
      </View>
    );
  };

  // ── Main render ───────────────────────────────────────────
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {renderTabs()}

      <View style={styles.content}>
        {selectedTab === 'challenges' && renderChallengesTab()}
        {selectedTab === 'students' && renderStudentsTab()}
        {selectedTab === 'submissions' && renderSubmissionsTab()}
      </View>

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
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 4,
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: COLORS.primaryLight + '25',
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },

  // Content
  content: {
    paddingHorizontal: SPACING.xl,
  },

  // Section
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },

  // Create Button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  createButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: '#FFF',
  },

  // Challenge Card
  challengeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  challengeCardUpcoming: {
    opacity: 0.7,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  trackBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  challengeDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  upcomingBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  upcomingText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.warning,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  challengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeStatText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  submissionBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  submissionBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },

  // Student Card
  studentListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  studentListHeaderText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  studentAvatar: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  studentLevel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  studentStats: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 80,
  },
  studentProgressBg: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: 2,
  },
  studentProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  studentProgressLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  studentScoreBadge: {
    backgroundColor: COLORS.success + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  studentScoreText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.success,
  },

  // Submissions
  challengeFilter: {
    marginBottom: SPACING.md,
  },
  challengeFilterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  challengeFilterChipActive: {
    backgroundColor: COLORS.primary + '12',
    borderColor: COLORS.primary,
  },
  challengeFilterText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  challengeFilterTextActive: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },
  submissionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  submissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  submissionAvatar: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  submissionStudentInfo: {
    flex: 1,
  },
  submissionName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  submissionDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  gradeBadge: {
    backgroundColor: COLORS.success + '18',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  gradePending: {
    backgroundColor: COLORS.warning + '18',
  },
  gradeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.success,
  },
  gradePendingText: {
    color: COLORS.warning,
  },
  feedbackExisting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  feedbackExistingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  feedbackInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  feedbackInput: {
    flex: 1,
    height: 36,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  feedbackSendButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  gradeOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gradeOptionText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.huge,
    gap: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textLight,
  },

  bottomSpacer: {
    height: SPACING.huge,
  },
});

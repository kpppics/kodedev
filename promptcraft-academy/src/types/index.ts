// ==========================================
// PROMPTCRAFT ACADEMY - Type Definitions
// ==========================================

// User & Auth Types
export type UserRole = 'child' | 'parent' | 'teacher';
export type SubscriptionTier = 'free' | 'junior' | 'family' | 'classroom';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  role: UserRole;
  age: number;
  parentId?: string;
  createdAt: string;
}

export interface ChildProfile extends User {
  role: 'child';
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  badges: Badge[];
  promptsCreated: number;
  projectsCreated: number;
  parentId: string;
}

export interface ParentProfile extends User {
  role: 'parent';
  children: string[];
  subscription: Subscription;
  screenTimeSettings: ScreenTimeSettings;
}

export interface TeacherProfile extends User {
  role: 'teacher';
  classrooms: Classroom[];
  subscription: Subscription;
}

// Subscription
export interface Subscription {
  tier: SubscriptionTier;
  status: 'active' | 'expired' | 'cancelled';
  expiresAt?: string;
  isLifetime: boolean;
}

// Learning Track Types
export type TrackId = 'story-studio' | 'web-builder' | 'game-maker' | 'art-factory' | 'music-maker' | 'code-explainer';

export interface Track {
  id: TrackId;
  name: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  ageRange: { min: number; max: number };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Lesson {
  id: string;
  trackId: TrackId;
  title: string;
  description: string;
  difficulty: number; // 1-10
  xpReward: number;
  challenge: string;
  hints: string[];
  completedAt?: string;
}

// Project Types
export interface Project {
  id: string;
  userId: string;
  trackId: TrackId;
  title: string;
  prompt: string;
  result: string;
  promptScore: PromptScore;
  createdAt: string;
  isPublic: boolean;
  likes: number;
  remixedFrom?: string;
}

// Prompt Scoring
export interface PromptScore {
  clarity: number;      // 0-100
  creativity: number;   // 0-100
  context: number;      // 0-100
  result: number;       // 0-100
  overall: number;      // 0-100
  feedback: string;
  suggestions: string[];
}

// Gamification
export type BadgeCategory = 'creation' | 'skill' | 'streak' | 'social' | 'mastery';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  earnedAt?: string;
  requirement: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  trackId?: TrackId;
  xpReward: number;
  isCompleted: boolean;
  expiresAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  rank: number;
}

// Prompt Battle
export interface PromptBattle {
  id: string;
  challenge: string;
  trackId: TrackId;
  entries: BattleEntry[];
  startsAt: string;
  endsAt: string;
  status: 'upcoming' | 'active' | 'voting' | 'completed';
  winnerId?: string;
}

export interface BattleEntry {
  userId: string;
  username: string;
  prompt: string;
  result: string;
  votes: number;
}

// Parent Dashboard
export interface ChildActivity {
  date: string;
  timeSpent: number; // minutes
  projectsCreated: number;
  xpEarned: number;
  tracksUsed: TrackId[];
}

export interface ProgressReport {
  childId: string;
  period: 'week' | 'month';
  skills: SkillProgress[];
  totalTimeSpent: number;
  projectsCreated: number;
  promptsImproved: number;
  streakDays: number;
}

export interface SkillProgress {
  skill: string;
  level: number;
  progress: number; // 0-100
}

export interface ScreenTimeSettings {
  dailyLimit: number; // minutes
  allowedHours: { start: string; end: string };
  breakReminder: number; // minutes
}

// Classroom
export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  studentIds: string[];
  challenges: ClassroomChallenge[];
  createdAt: string;
}

export interface ClassroomChallenge {
  id: string;
  title: string;
  description: string;
  trackId: TrackId;
  dueDate: string;
  submissions: ClassroomSubmission[];
}

export interface ClassroomSubmission {
  studentId: string;
  projectId: string;
  submittedAt: string;
  grade?: string;
  feedback?: string;
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  ParentConsent: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  TrackDetail: { trackId: TrackId };
  LessonScreen: { trackId: TrackId; lessonId: string };
  ProjectView: { projectId: string };
  PromptBattle: { battleId: string };
  ParentDashboard: undefined;
  ClassroomView: { classroomId: string };
  Settings: undefined;
  Subscription: undefined;
  Profile: { userId: string };
  PromptLibrary: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tracks: undefined;
  Create: undefined;
  Battles: undefined;
  Profile: undefined;
};

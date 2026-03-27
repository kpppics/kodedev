// ==========================================
// PROMPTCRAFT ACADEMY - API Service
// ==========================================

import { Platform } from 'react-native';
import {
  User, ChildProfile, ParentProfile, Project, Badge,
  DailyQuest, LeaderboardEntry, PromptBattle,
  ChildActivity, ProgressReport, Classroom, TrackId
} from '../types';

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3001/api`;
  }
  return 'http://localhost:3001/api';
}

const API_BASE_URL = resolveBaseUrl();

class ApiService {
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const details = err.details ? ` (${JSON.stringify(err.details)})` : '';
      throw new Error((err.error || err.message || `HTTP ${response.status}`) + details);
    }

    return response.json();
  }

  // ---- Auth (matches backend contract exactly) ----

  /** Create a parent/teacher account */
  async authSignup(body: {
    email: string; password: string; username: string;
    displayName: string; role: 'parent' | 'teacher';
  }): Promise<{ token: string; user: { id: string; email: string; username: string; displayName: string; role: string } }> {
    return this.request('POST', '/auth/signup', body);
  }

  /** Parent/teacher login with email + password */
  async authLogin(body: { email: string; password: string }): Promise<{ token: string; user: User }> {
    return this.request('POST', '/auth/login', body);
  }

  /** Child login with username + 4-digit PIN */
  async authChildLogin(body: { username: string; pin: string }): Promise<{ token: string; user: { id: string; username: string; displayName: string; role: string; parentId: string } }> {
    return this.request('POST', '/auth/child-login', body);
  }

  /** Authenticated parent creates a child profile */
  async authParentConsent(body: {
    childUsername: string; childDisplayName: string;
    childAge: number; pin: string; consentGiven: true;
  }): Promise<{ child: { id: string; username: string; displayName: string; age: number; parentId: string } }> {
    return this.request('POST', '/auth/parent-consent', body);
  }

  // User Profile
  async getProfile(userId: string): Promise<ChildProfile | ParentProfile> {
    return this.request('GET', `/users/${userId}`);
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    return this.request('PATCH', `/users/${userId}`, data);
  }

  // Projects
  async createProject(data: {
    trackId: TrackId;
    title: string;
    prompt: string;
    result: string;
  }): Promise<Project> {
    return this.request('POST', '/projects', data);
  }

  async getProjects(userId: string): Promise<Project[]> {
    return this.request('GET', `/projects?userId=${userId}`);
  }

  async getProject(projectId: string): Promise<Project> {
    return this.request('GET', `/projects/${projectId}`);
  }

  async likeProject(projectId: string): Promise<void> {
    return this.request('POST', `/projects/${projectId}/like`);
  }

  async getPublicProjects(trackId?: TrackId): Promise<Project[]> {
    const query = trackId ? `?trackId=${trackId}` : '';
    return this.request('GET', `/projects/public${query}`);
  }

  // Gamification
  async addXP(amount: number, reason: string): Promise<{
    newXp: number;
    newLevel: number;
    leveledUp: boolean;
    badgesEarned: Badge[];
  }> {
    return this.request('POST', '/gamification/xp', { amount, reason });
  }

  async getBadges(userId: string): Promise<Badge[]> {
    return this.request('GET', `/gamification/badges/${userId}`);
  }

  async getDailyQuests(): Promise<DailyQuest[]> {
    return this.request('GET', '/gamification/quests');
  }

  async completeQuest(questId: string): Promise<{ xpEarned: number }> {
    return this.request('POST', `/gamification/quests/${questId}/complete`);
  }

  async getLeaderboard(period: 'weekly' | 'monthly' | 'alltime'): Promise<LeaderboardEntry[]> {
    return this.request('GET', `/gamification/leaderboard?period=${period}`);
  }

  // Prompt Battles
  async getActiveBattles(): Promise<PromptBattle[]> {
    return this.request('GET', '/battles/active');
  }

  async getBattle(battleId: string): Promise<PromptBattle> {
    return this.request('GET', `/battles/${battleId}`);
  }

  async submitBattleEntry(battleId: string, prompt: string, result: string): Promise<void> {
    return this.request('POST', `/battles/${battleId}/submit`, { prompt, result });
  }

  async voteBattleEntry(battleId: string, entryUserId: string): Promise<void> {
    return this.request('POST', `/battles/${battleId}/vote`, { entryUserId });
  }

  // Prompt Library
  async savePrompt(data: { prompt: string; trackId: TrackId; score: number }): Promise<void> {
    return this.request('POST', '/prompts/save', data);
  }

  async getSavedPrompts(trackId?: TrackId): Promise<Array<{
    id: string;
    prompt: string;
    trackId: TrackId;
    score: number;
    createdAt: string;
  }>> {
    const query = trackId ? `?trackId=${trackId}` : '';
    return this.request('GET', `/prompts/saved${query}`);
  }

  async getCommunityPrompts(trackId?: TrackId): Promise<Array<{
    id: string;
    prompt: string;
    trackId: TrackId;
    score: number;
    username: string;
    remixCount: number;
  }>> {
    const query = trackId ? `?trackId=${trackId}` : '';
    return this.request('GET', `/prompts/community${query}`);
  }

  // Parent Dashboard
  async getChildActivity(childId: string, days: number = 7): Promise<ChildActivity[]> {
    return this.request('GET', `/parent/activity/${childId}?days=${days}`);
  }

  async getProgressReport(childId: string, period: 'week' | 'month'): Promise<ProgressReport> {
    return this.request('GET', `/parent/report/${childId}?period=${period}`);
  }

  async updateScreenTime(childId: string, settings: {
    dailyLimit?: number;
    allowedHours?: { start: string; end: string };
    breakReminder?: number;
  }): Promise<void> {
    return this.request('PATCH', `/parent/screen-time/${childId}`, settings);
  }

  // Classroom
  async getClassroom(classroomId: string): Promise<Classroom> {
    return this.request('GET', `/classroom/${classroomId}`);
  }

  async createChallenge(classroomId: string, data: {
    title: string;
    description: string;
    trackId: TrackId;
    dueDate: string;
  }): Promise<void> {
    return this.request('POST', `/classroom/${classroomId}/challenges`, data);
  }

  // Subscription
  async getSubscription(): Promise<{
    tier: string;
    status: string;
    expiresAt?: string;
    isLifetime: boolean;
  }> {
    return this.request('GET', '/subscription');
  }

  async createCheckout(plan: string, interval?: 'monthly' | 'yearly' | 'lifetime'): Promise<{
    checkoutUrl: string;
  }> {
    return this.request('POST', '/subscription/checkout', { plan, interval });
  }
}

export const api = new ApiService();
export default api;

// ==========================================
// AI SERVICE LAYER — Shared Types
// ==========================================

import { TrackId } from '../../types';

// ---- Provider identity ----
export type AIProviderName = 'claude' | 'groq';

export interface AIProviderConfig {
  name: AIProviderName;
  apiKey: string;
  baseUrl?: string;       // allows self-hosted / proxy overrides
  defaultModel: string;
  timeoutMs?: number;
}

// ---- Generic message format (OpenAI-compatible, both providers speak it) ----
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ---- Core request / response ----
export interface AICompletionRequest {
  messages: AIMessage[];
  model?: string;           // override default per-call
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;    // convenience — prepended as a system message
}

export interface AICompletionResponse {
  content: string;
  model: string;
  provider: AIProviderName;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  durationMs: number;
}

// ---- Domain-level request types shared across providers ----
export interface PromptScoreRequest {
  userPrompt: string;
  trackId: TrackId;
  aiResult: string;
}

export interface PromptScoreResult {
  clarity: number;
  creativity: number;
  context: number;
  result: number;
  overall: number;
  feedback: string;
  suggestions: string[];
}

export interface StoryRequest {
  prompt: string;
  characters?: string[];
  setting?: string;
  plotTwist?: string;
  continuation?: string;
}

export interface WebpageRequest {
  prompt: string;
  previousHtml?: string;
  modification?: string;
}

export interface GameRequest {
  prompt: string;
  gameType?: string;
  modification?: string;
  previousCode?: string;
}

export interface ArtRequest {
  prompt: string;
  style?: string;
  mood?: string;
  colors?: string[];
}

export interface MusicRequest {
  prompt: string;
  mood?: string;
  instruments?: string[];
  tempo?: string;
}

export interface CodeRequest {
  code: string;
  question?: string;
}

export interface CodeModifyRequest {
  code: string;
  instruction: string;
}

// ---- Domain-level response types ----
export interface StoryResult {
  story: string;
  title: string;
  characters: string[];
  setting: string;
  score: PromptScoreResult;
}

export interface WebpageResult {
  html: string;
  explanation: string;
  score: PromptScoreResult;
}

export interface GameResult {
  html: string;
  gameType: string;
  description: string;
  score: PromptScoreResult;
}

export interface ArtResult {
  imagePrompt: string;       // enriched prompt for an image API
  description: string;
  styleApplied: string;
  score: PromptScoreResult;
}

export interface MusicResult {
  description: string;
  tempo: string;
  mood: string;
  instrumentation: string[];
  lyricsSnippet?: string;
  score: PromptScoreResult;
}

export interface CodeExplainResult {
  explanation: string;
  concepts: string[];
  analogies: string[];
  score: PromptScoreResult;
}

export interface CodeModifyResult {
  modifiedCode: string;
  explanation: string;
  changesDescription: string;
  score: PromptScoreResult;
}

// ---- Safety ----
export interface SafetyResult {
  safe: boolean;
  reason?: string;
  categories?: string[];
}

// ---- Provider interface every adapter must implement ----
export interface AIProvider {
  readonly name: AIProviderName;
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  isAvailable(): Promise<boolean>;
}

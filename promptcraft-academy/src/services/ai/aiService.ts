// ==========================================
// AI SERVICE — High-level domain methods
// ==========================================
// This is the ONLY file screens should import from.
// It wires up the router + prompt builders into clean,
// track-specific async functions.

import { AIRouter, RouterStrategy } from './router';
import { ClaudeProvider } from './providers/claude';
import { GroqProvider } from './providers/groq';
import {
  StoryRequest, StoryResult,
  WebpageRequest, WebpageResult,
  GameRequest, GameResult,
  ArtRequest, ArtResult,
  MusicRequest, MusicResult,
  CodeRequest, CodeExplainResult,
  CodeModifyRequest, CodeModifyResult,
  PromptScoreRequest, PromptScoreResult,
  SafetyResult,
  AIProviderName,
} from './types';
import {
  buildStoryMessages,
  buildWebpageMessages,
  buildGameMessages,
  buildArtMessages,
  buildMusicMessages,
  buildCodeExplainMessages,
  buildCodeModifyMessages,
  buildPromptScoreMessages,
  buildSafetyCheckMessages,
} from './prompts';

// ---- Parse helpers ----

function parseJSON<T>(raw: string, fallback: T): T {
  // Extract JSON from markdown code fences if present
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
  const jsonString = match ? match[1].trim() : raw.trim();
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    console.warn('[AIService] JSON parse failed, raw:', raw.slice(0, 200));
    return fallback;
  }
}

function defaultScore(): PromptScoreResult {
  return { clarity: 0, creativity: 0, context: 0, result: 0, overall: 0, feedback: '', suggestions: [] };
}

// ---- Router factory ----

function buildRouter(): AIRouter {
  const providers = [];

  const claudeKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';
  if (claudeKey) {
    providers.push(new ClaudeProvider({ apiKey: claudeKey }));
  }

  const groqKey = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
  if (groqKey) {
    providers.push(new GroqProvider({ apiKey: groqKey }));
  }

  if (providers.length === 0) {
    // Dev mode: add stub providers so the app doesn't crash at startup
    console.warn(
      '[AIService] No API keys set. Add EXPO_PUBLIC_CLAUDE_API_KEY or EXPO_PUBLIC_GROQ_API_KEY to .env'
    );
    providers.push(new GroqProvider({ apiKey: 'no-key-set' }));
  }

  // Groq is primary (cheaper/faster); Claude is the fallback for quality
  const hasGroq = Boolean(groqKey);
  const hasClaude = Boolean(claudeKey);

  const primary: AIProviderName = hasGroq ? 'groq' : 'claude';
  const secondary: AIProviderName | undefined = hasGroq && hasClaude ? 'claude' : undefined;

  return new AIRouter(providers, {
    strategy: 'fallback',  // can be changed at runtime via setStrategy()
    primary,
    secondary,
    enableAnalytics: true,
  });
}

// Singleton router — recreate only when env keys change
let _router: AIRouter | null = null;

function getRouter(): AIRouter {
  if (!_router) _router = buildRouter();
  return _router;
}

// ==========================================
// PUBLIC API — used by all screens
// ==========================================

export const aiService = {

  /** Override routing strategy at runtime (e.g. from Settings screen) */
  setStrategy(strategy: RouterStrategy) {
    getRouter().setStrategy(strategy);
  },

  getAvailableProviders(): AIProviderName[] {
    return getRouter().getAvailableProviders();
  },

  getAnalytics() {
    return getRouter().getAnalytics();
  },

  // ---- Story Studio ----
  async generateStory(req: StoryRequest): Promise<StoryResult> {
    const { messages, systemPrompt } = buildStoryMessages(req);
    const res = await getRouter().complete({ messages, systemPrompt, maxTokens: 1024 });
    const parsed = parseJSON<Omit<StoryResult, 'score'>>(res.content, {
      title: 'My Story',
      story: res.content,
      characters: [],
      setting: '',
    });
    const score = await aiService.scorePrompt({ userPrompt: req.prompt, trackId: 'story-studio', aiResult: parsed.story });
    return { ...parsed, score };
  },

  // ---- Web Builder Jr ----
  async generateWebpage(req: WebpageRequest): Promise<WebpageResult> {
    const { messages, systemPrompt } = buildWebpageMessages(req);
    const res = await getRouter().complete({ messages, systemPrompt, maxTokens: 2048 });
    const parsed = parseJSON<Omit<WebpageResult, 'score'>>(res.content, {
      html: '<h1>My Page</h1>',
      explanation: res.content,
    });
    const score = await aiService.scorePrompt({
      userPrompt: req.modification ?? req.prompt ?? '',
      trackId: 'web-builder',
      aiResult: parsed.html,
    });
    return { ...parsed, score };
  },

  // ---- Game Maker ----
  async generateGame(req: GameRequest): Promise<GameResult> {
    const { messages, systemPrompt } = buildGameMessages(req);
    const res = await getRouter().complete({ messages, systemPrompt, maxTokens: 4096 });
    const parsed = parseJSON<Omit<GameResult, 'score'>>(res.content, {
      html: '<p>Game loading...</p>',
      gameType: 'unknown',
      description: res.content,
    });
    const score = await aiService.scorePrompt({
      userPrompt: req.modification ?? req.prompt ?? '',
      trackId: 'game-maker',
      aiResult: parsed.description,
    });
    return { ...parsed, score };
  },

  // ---- Art Factory ----
  async generateArt(req: ArtRequest): Promise<ArtResult> {
    const { messages, systemPrompt } = buildArtMessages(req);
    const res = await getRouter().complete({ messages, systemPrompt, maxTokens: 512 });
    const parsed = parseJSON<Omit<ArtResult, 'score'>>(res.content, {
      imagePrompt: req.prompt,
      description: res.content,
      styleApplied: req.style ?? 'default',
    });
    const score = await aiService.scorePrompt({ userPrompt: req.prompt, trackId: 'art-factory', aiResult: parsed.imagePrompt });
    return { ...parsed, score };
  },

  // ---- Music Maker ----
  async generateMusic(req: MusicRequest): Promise<MusicResult> {
    const { messages, systemPrompt } = buildMusicMessages(req);
    const res = await getRouter().complete({ messages, systemPrompt, maxTokens: 512 });
    const parsed = parseJSON<Omit<MusicResult, 'score'>>(res.content, {
      description: res.content,
      tempo: 'moderate',
      mood: req.mood ?? 'happy',
      instrumentation: req.instruments ?? [],
    });
    const score = await aiService.scorePrompt({ userPrompt: req.prompt, trackId: 'music-maker', aiResult: parsed.description });
    return { ...parsed, score };
  },

  // ---- Code Explainer ----
  async explainCode(req: CodeRequest): Promise<CodeExplainResult> {
    const { messages, systemPrompt } = buildCodeExplainMessages(req);
    const res = await getRouter().complete({ messages, systemPrompt, maxTokens: 1024 });
    const parsed = parseJSON<Omit<CodeExplainResult, 'score'>>(res.content, {
      explanation: res.content,
      concepts: [],
      analogies: [],
    });
    const score = await aiService.scorePrompt({ userPrompt: req.question ?? 'Explain this code', trackId: 'code-explainer', aiResult: parsed.explanation });
    return { ...parsed, score };
  },

  async modifyCode(req: CodeModifyRequest): Promise<CodeModifyResult> {
    const { messages, systemPrompt } = buildCodeModifyMessages(req);
    const res = await getRouter().complete({ messages, systemPrompt, maxTokens: 2048 });
    const parsed = parseJSON<Omit<CodeModifyResult, 'score'>>(res.content, {
      modifiedCode: req.code,
      explanation: res.content,
      changesDescription: req.instruction,
    });
    const score = await aiService.scorePrompt({ userPrompt: req.instruction, trackId: 'code-explainer', aiResult: parsed.changesDescription });
    return { ...parsed, score };
  },

  // ---- Prompt Scoring (used internally + by all tracks) ----
  async scorePrompt(req: PromptScoreRequest): Promise<PromptScoreResult> {
    try {
      const { messages, systemPrompt } = buildPromptScoreMessages(req);
      const res = await getRouter().complete({ messages, systemPrompt, maxTokens: 512, temperature: 0.2 });
      return parseJSON<PromptScoreResult>(res.content, defaultScore());
    } catch {
      return defaultScore();
    }
  },

  // ---- Safety Check ----
  async checkSafety(content: string): Promise<SafetyResult> {
    try {
      const { messages, systemPrompt } = buildSafetyCheckMessages(content);
      const res = await getRouter().complete({ messages, systemPrompt, maxTokens: 128, temperature: 0 });
      return parseJSON<SafetyResult>(res.content, { safe: true });
    } catch {
      // Fail open — don't block kids if safety check errors
      return { safe: true };
    }
  },
};

export default aiService;

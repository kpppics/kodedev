// ==========================================
// AI ROUTES — /api/ai/*
// ==========================================
// All routes:
//   1. Validate input with Zod
//   2. Pre-check input prompt with safety filter
//   3. Route through aiRouter (multi-provider)
//   4. Post-check generated content with safety filter
//   5. Return JSON

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { aiRateLimit } from '../middleware/rateLimit';
import { aiRouter } from '../ai/router';
import { checkInputPrompt, checkGeneratedContent } from '../ai/safetyFilter';
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
} from '../ai/prompts';
import {
  StoryRequest,
  WebpageRequest,
  GameRequest,
  ArtRequest,
  MusicRequest,
  CodeRequest,
  CodeModifyRequest,
  PromptScoreRequest,
  PromptScoreResult,
} from '../ai/types';

const router = Router();

// Apply auth + rate limiting to all AI routes
router.use(requireAuth);
router.use(aiRateLimit);

// ---- Shared helpers ----

function parseJSON<T>(raw: string, fallback: T): T {
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || raw.match(/(\{[\s\S]*\})/);
  const jsonString = match ? match[1].trim() : raw.trim();
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}

function defaultScore(): PromptScoreResult {
  return {
    clarity: 0, creativity: 0, context: 0,
    result: 0, overall: 0, feedback: '', suggestions: [],
  };
}

async function scorePrompt(req: PromptScoreRequest): Promise<PromptScoreResult> {
  try {
    const { messages, systemPrompt } = buildPromptScoreMessages(req);
    const res = await aiRouter.complete({ messages, systemPrompt, maxTokens: 512, temperature: 0.2 });
    return parseJSON<PromptScoreResult>(res.content, defaultScore());
  } catch {
    return defaultScore();
  }
}

async function safetyGuard(
  res: Response,
  inputText: string
): Promise<boolean> {
  const inputCheck = await checkInputPrompt(inputText);
  if (!inputCheck.safe) {
    res.status(400).json({
      error: 'Input failed safety check',
      reason: inputCheck.reason,
    });
    return false;
  }
  return true;
}

async function safetyGuardOutput(
  res: Response,
  content: string
): Promise<{ safe: boolean; filtered: string }> {
  const outputCheck = await checkGeneratedContent(content);
  if (!outputCheck.safe) {
    res.status(422).json({
      error: 'Generated content failed safety check',
      reason: outputCheck.reason,
    });
    return { safe: false, filtered: '' };
  }
  return { safe: true, filtered: outputCheck.filteredContent };
}

// ==========================================
// POST /api/ai/story
// ==========================================
const StorySchema = z.object({
  prompt: z.string().min(1).max(1000),
  characters: z.array(z.string()).optional(),
  setting: z.string().max(500).optional(),
  plotTwist: z.string().max(500).optional(),
  continuation: z.string().max(2000).optional(),
});

router.post('/story', async (req: Request, res: Response): Promise<void> => {
  const parsed = StorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const input: StoryRequest = parsed.data;
  if (!(await safetyGuard(res, input.prompt))) return;

  try {
    const { messages, systemPrompt } = buildStoryMessages(input);
    const aiRes = await aiRouter.complete({ messages, systemPrompt, maxTokens: 1024 });

    const outputCheck = await safetyGuardOutput(res, aiRes.content);
    if (!outputCheck.safe) return;

    const raw = outputCheck.filtered;
    const titleMatch = raw.match(/TITLE:\s*(.+)/i);
    const storyMatch = raw.match(/STORY:\s*([\s\S]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'My Story';
    const story = storyMatch ? storyMatch[1].trim() : raw.trim();

    const score = await scorePrompt({ userPrompt: input.prompt, trackId: 'story-studio', aiResult: story });

    res.json({
      title,
      story,
      characters: [],
      setting: input.setting ?? '',
      score,
      meta: { provider: aiRes.provider, model: aiRes.model, durationMs: aiRes.durationMs },
    });
  } catch (err) {
    console.error('[AI/story]', err);
    res.status(502).json({ error: 'AI generation failed', message: (err as Error).message });
  }
});

// ==========================================
// POST /api/ai/webpage
// ==========================================
const WebpageSchema = z.object({
  prompt: z.string().max(1000).optional(),
  previousHtml: z.string().max(50_000).optional(),
  modification: z.string().max(1000).optional(),
}).refine(d => d.prompt || d.modification, {
  message: 'Either prompt or modification is required',
});

router.post('/webpage', async (req: Request, res: Response): Promise<void> => {
  const parsed = WebpageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const input: WebpageRequest = {
    prompt: parsed.data.prompt ?? '',
    previousHtml: parsed.data.previousHtml,
    modification: parsed.data.modification,
  };
  const checkText = input.modification ?? input.prompt ?? '';
  if (!(await safetyGuard(res, checkText))) return;

  try {
    const { messages, systemPrompt } = buildWebpageMessages(input);
    const aiRes = await aiRouter.complete({ messages, systemPrompt, maxTokens: 2048 });

    const outputCheck = await safetyGuardOutput(res, aiRes.content);
    if (!outputCheck.safe) return;

    const data = parseJSON<{ html: string; explanation: string }>(
      outputCheck.filtered,
      { html: '<h1>My Page</h1>', explanation: outputCheck.filtered }
    );
    const score = await scorePrompt({ userPrompt: checkText, trackId: 'web-builder', aiResult: data.html });

    res.json({
      ...data,
      score,
      meta: { provider: aiRes.provider, model: aiRes.model, durationMs: aiRes.durationMs },
    });
  } catch (err) {
    console.error('[AI/webpage]', err);
    res.status(502).json({ error: 'AI generation failed', message: (err as Error).message });
  }
});

// ==========================================
// POST /api/ai/game
// ==========================================
const GameSchema = z.object({
  prompt: z.string().max(1000).optional(),
  gameType: z.string().max(100).optional(),
  modification: z.string().max(1000).optional(),
  previousCode: z.string().max(50_000).optional(),
}).refine(d => d.prompt || d.modification, {
  message: 'Either prompt or modification is required',
});

router.post('/game', async (req: Request, res: Response): Promise<void> => {
  const parsed = GameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const input: GameRequest = {
    prompt: parsed.data.prompt ?? '',
    gameType: parsed.data.gameType,
    modification: parsed.data.modification,
    previousCode: parsed.data.previousCode,
  };
  const checkText = input.modification ?? input.prompt ?? '';
  if (!(await safetyGuard(res, checkText))) return;

  try {
    const { messages, systemPrompt } = buildGameMessages(input);
    const aiRes = await aiRouter.complete({ messages, systemPrompt, maxTokens: 4096 });

    const outputCheck = await safetyGuardOutput(res, aiRes.content);
    if (!outputCheck.safe) return;

    const data = parseJSON<{ html: string; gameType: string; description: string }>(
      outputCheck.filtered,
      { html: '<p>Game loading...</p>', gameType: 'unknown', description: outputCheck.filtered }
    );
    const score = await scorePrompt({ userPrompt: checkText, trackId: 'game-maker', aiResult: data.description });

    res.json({
      ...data,
      score,
      meta: { provider: aiRes.provider, model: aiRes.model, durationMs: aiRes.durationMs },
    });
  } catch (err) {
    console.error('[AI/game]', err);
    res.status(502).json({ error: 'AI generation failed', message: (err as Error).message });
  }
});

// ==========================================
// POST /api/ai/art
// ==========================================
const ArtSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.string().max(100).optional(),
  mood: z.string().max(100).optional(),
  colors: z.array(z.string()).optional(),
});

router.post('/art', async (req: Request, res: Response): Promise<void> => {
  const parsed = ArtSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const input: ArtRequest = parsed.data;
  if (!(await safetyGuard(res, input.prompt))) return;

  try {
    const { messages, systemPrompt } = buildArtMessages(input);
    const aiRes = await aiRouter.complete({ messages, systemPrompt, maxTokens: 512 });

    const outputCheck = await safetyGuardOutput(res, aiRes.content);
    if (!outputCheck.safe) return;

    const data = parseJSON<{ imagePrompt: string; description: string; styleApplied: string }>(
      outputCheck.filtered,
      { imagePrompt: input.prompt, description: outputCheck.filtered, styleApplied: input.style ?? 'default' }
    );
    const score = await scorePrompt({ userPrompt: input.prompt, trackId: 'art-factory', aiResult: data.imagePrompt });

    res.json({
      ...data,
      score,
      meta: { provider: aiRes.provider, model: aiRes.model, durationMs: aiRes.durationMs },
    });
  } catch (err) {
    console.error('[AI/art]', err);
    res.status(502).json({ error: 'AI generation failed', message: (err as Error).message });
  }
});

// ==========================================
// POST /api/ai/music
// ==========================================
const MusicSchema = z.object({
  prompt: z.string().min(1).max(1000),
  mood: z.string().max(100).optional(),
  instruments: z.array(z.string()).optional(),
  tempo: z.string().max(100).optional(),
});

router.post('/music', async (req: Request, res: Response): Promise<void> => {
  const parsed = MusicSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const input: MusicRequest = parsed.data;
  if (!(await safetyGuard(res, input.prompt))) return;

  try {
    const { messages, systemPrompt } = buildMusicMessages(input);
    const aiRes = await aiRouter.complete({ messages, systemPrompt, maxTokens: 512 });

    const outputCheck = await safetyGuardOutput(res, aiRes.content);
    if (!outputCheck.safe) return;

    const data = parseJSON<{
      description: string; tempo: string; mood: string;
      instrumentation: string[]; lyricsSnippet?: string;
    }>(
      outputCheck.filtered,
      { description: outputCheck.filtered, tempo: 'moderate', mood: input.mood ?? 'happy', instrumentation: [] }
    );
    const score = await scorePrompt({ userPrompt: input.prompt, trackId: 'music-maker', aiResult: data.description });

    res.json({
      ...data,
      score,
      meta: { provider: aiRes.provider, model: aiRes.model, durationMs: aiRes.durationMs },
    });
  } catch (err) {
    console.error('[AI/music]', err);
    res.status(502).json({ error: 'AI generation failed', message: (err as Error).message });
  }
});

// ==========================================
// POST /api/ai/explain
// ==========================================
const ExplainSchema = z.object({
  code: z.string().min(1).max(20_000),
  question: z.string().max(500).optional(),
});

router.post('/explain', async (req: Request, res: Response): Promise<void> => {
  const parsed = ExplainSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const input: CodeRequest = parsed.data;
  if (!(await safetyGuard(res, input.question ?? input.code.slice(0, 500)))) return;

  try {
    const { messages, systemPrompt } = buildCodeExplainMessages(input);
    const aiRes = await aiRouter.complete({ messages, systemPrompt, maxTokens: 1024 });

    const outputCheck = await safetyGuardOutput(res, aiRes.content);
    if (!outputCheck.safe) return;

    const data = parseJSON<{ explanation: string; concepts: string[]; analogies: string[] }>(
      outputCheck.filtered,
      { explanation: outputCheck.filtered, concepts: [], analogies: [] }
    );
    const userPrompt = input.question ?? 'Explain this code';
    const score = await scorePrompt({ userPrompt, trackId: 'code-explainer', aiResult: data.explanation });

    res.json({
      ...data,
      score,
      meta: { provider: aiRes.provider, model: aiRes.model, durationMs: aiRes.durationMs },
    });
  } catch (err) {
    console.error('[AI/explain]', err);
    res.status(502).json({ error: 'AI generation failed', message: (err as Error).message });
  }
});

// ==========================================
// POST /api/ai/modify-code
// ==========================================
const ModifyCodeSchema = z.object({
  code: z.string().min(1).max(20_000),
  instruction: z.string().min(1).max(1000),
});

router.post('/modify-code', async (req: Request, res: Response): Promise<void> => {
  const parsed = ModifyCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const input: CodeModifyRequest = parsed.data;
  if (!(await safetyGuard(res, input.instruction))) return;

  try {
    const { messages, systemPrompt } = buildCodeModifyMessages(input);
    const aiRes = await aiRouter.complete({ messages, systemPrompt, maxTokens: 2048 });

    const outputCheck = await safetyGuardOutput(res, aiRes.content);
    if (!outputCheck.safe) return;

    const data = parseJSON<{ modifiedCode: string; explanation: string; changesDescription: string }>(
      outputCheck.filtered,
      { modifiedCode: input.code, explanation: outputCheck.filtered, changesDescription: input.instruction }
    );
    const score = await scorePrompt({ userPrompt: input.instruction, trackId: 'code-explainer', aiResult: data.changesDescription });

    res.json({
      ...data,
      score,
      meta: { provider: aiRes.provider, model: aiRes.model, durationMs: aiRes.durationMs },
    });
  } catch (err) {
    console.error('[AI/modify-code]', err);
    res.status(502).json({ error: 'AI generation failed', message: (err as Error).message });
  }
});

// ==========================================
// POST /api/ai/score
// ==========================================
const ScoreSchema = z.object({
  userPrompt: z.string().min(1).max(1000),
  trackId: z.enum([
    'story-studio', 'web-builder', 'game-maker',
    'art-factory', 'music-maker', 'code-explainer',
  ]),
  aiResult: z.string().min(1).max(10_000),
});

router.post('/score', async (req: Request, res: Response): Promise<void> => {
  const parsed = ScoreSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  const input: PromptScoreRequest = parsed.data;

  try {
    const { messages, systemPrompt } = buildPromptScoreMessages(input);
    const aiRes = await aiRouter.complete({ messages, systemPrompt, maxTokens: 512, temperature: 0.2 });
    const score = parseJSON<PromptScoreResult>(aiRes.content, defaultScore());

    res.json({
      score,
      meta: { provider: aiRes.provider, model: aiRes.model, durationMs: aiRes.durationMs },
    });
  } catch (err) {
    console.error('[AI/score]', err);
    res.status(502).json({ error: 'AI scoring failed', message: (err as Error).message });
  }
});

// ==========================================
// POST /api/ai/safety-check
// ==========================================
const SafetyCheckSchema = z.object({
  content: z.string().min(1).max(10_000),
});

router.post('/safety-check', async (req: Request, res: Response): Promise<void> => {
  const parsed = SafetyCheckSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }

  try {
    const { messages, systemPrompt } = buildSafetyCheckMessages(parsed.data.content);
    const aiRes = await aiRouter.complete({ messages, systemPrompt, maxTokens: 128, temperature: 0 });
    const result = parseJSON<{ safe: boolean; reason?: string }>(aiRes.content, { safe: true });

    res.json({
      safe: result.safe,
      reason: result.reason,
      meta: { provider: aiRes.provider, model: aiRes.model, durationMs: aiRes.durationMs },
    });
  } catch (err) {
    console.error('[AI/safety-check]', err);
    // Fail open for safety checks — don't block users if the check itself fails
    res.json({ safe: true, reason: 'Safety check unavailable', error: (err as Error).message });
  }
});

export default router;

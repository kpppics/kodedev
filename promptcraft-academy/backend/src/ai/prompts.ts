// ==========================================
// AI PROMPT BUILDER (Backend)
// ==========================================
// All system prompts and user prompt templates.
// Keeping prompts separate means we can tune without
// touching provider or router code.

import {
  StoryRequest,
  WebpageRequest,
  GameRequest,
  ArtRequest,
  MusicRequest,
  CodeRequest,
  CodeModifyRequest,
  PromptScoreRequest,
  AIMessage,
} from './types';

// ---- Shared child-safe system prompt ----
const CHILD_SAFE_SYSTEM =
  `You are a friendly, encouraging AI assistant for children aged 6–16. ` +
  `Always use age-appropriate language. Keep responses positive, educational, and fun. ` +
  `Never generate violent, sexual, or inappropriate content. ` +
  `If a prompt asks for anything unsafe, gently redirect the child to something creative and positive. ` +
  `Respond in a warm, encouraging tone — like a helpful teacher.`;

// ---- Track-specific system prompt additions ----
const TRACK_SYSTEM: Record<string, string> = {
  'story-studio':
    `You specialise in creating imaginative, age-appropriate short stories. ` +
    `Structure stories with a clear beginning, middle, and end. Use vivid but simple language.`,
  'web-builder':
    `You are a web development tutor for kids. Generate simple, well-commented HTML/CSS/JS. ` +
    `Keep code clean, use inline styles for simplicity, and explain each part briefly.`,
  'game-maker':
    `You create simple browser games in self-contained HTML files using vanilla JS. ` +
    `Games must be fun, simple, and fully playable in a WebView. Keep code well-commented.`,
  'art-factory':
    `You help children craft vivid, descriptive text-to-image prompts. ` +
    `Enrich their prompt with style, lighting, composition, and mood details.`,
  'music-maker':
    `You help children describe music creatively. Generate detailed music descriptions ` +
    `including tempo, instruments, mood, and structure. Use ABC notation if helpful.`,
  'code-explainer':
    `You explain code to children in plain, friendly English. Use analogies and real-world examples. ` +
    `Break down complex concepts into small, easy steps. Always be encouraging.`,
};

function buildSystemPrompt(trackId?: string): string {
  const parts = [CHILD_SAFE_SYSTEM];
  if (trackId && TRACK_SYSTEM[trackId]) parts.push(TRACK_SYSTEM[trackId]);
  return parts.join('\n\n');
}

// ==========================================
// TRACK PROMPT BUILDERS
// ==========================================

export function buildStoryMessages(req: StoryRequest): {
  messages: AIMessage[];
  systemPrompt: string;
} {
  const parts: string[] = [`Write a short, fun story based on this idea: "${req.prompt}"`];
  if (req.characters?.length) parts.push(`Include these characters: ${req.characters.join(', ')}`);
  if (req.setting) parts.push(`Setting: ${req.setting}`);
  if (req.plotTwist) parts.push(`Include this plot twist: ${req.plotTwist}`);
  if (req.continuation) parts.push(`This continues an existing story. Previous story: ${req.continuation}`);
  parts.push(
    `\nReturn a JSON object with this shape:\n` +
    `{"title": "...", "story": "...", "characters": [...], "setting": "..."}`
  );

  return {
    messages: [{ role: 'user', content: parts.join('\n') }],
    systemPrompt: buildSystemPrompt('story-studio'),
  };
}

export function buildWebpageMessages(req: WebpageRequest): {
  messages: AIMessage[];
  systemPrompt: string;
} {
  let userContent: string;
  if (req.modification && req.previousHtml) {
    userContent =
      `Here is a webpage I created:\n\`\`\`html\n${req.previousHtml}\n\`\`\`\n\n` +
      `Please modify it: ${req.modification}\n\n` +
      `Return JSON: {"html": "...", "explanation": "..."}`;
  } else {
    userContent =
      `Create a simple webpage: "${req.prompt ?? ''}"\n\n` +
      `Return JSON: {"html": "...", "explanation": "..."}`;
  }

  return {
    messages: [{ role: 'user', content: userContent }],
    systemPrompt: buildSystemPrompt('web-builder'),
  };
}

export function buildGameMessages(req: GameRequest): {
  messages: AIMessage[];
  systemPrompt: string;
} {
  let userContent: string;
  if (req.modification && req.previousCode) {
    userContent =
      `Here is a game I made:\n\`\`\`html\n${req.previousCode}\n\`\`\`\n\n` +
      `Please update it: ${req.modification}\n\n` +
      `Return JSON: {"html": "...", "gameType": "...", "description": "..."}`;
  } else {
    const typeHint = req.gameType ? ` Make it a ${req.gameType} style game.` : '';
    userContent =
      `Create a simple browser game: "${req.prompt ?? ''}".${typeHint}\n\n` +
      `The game must be a single self-contained HTML file.\n` +
      `Return JSON: {"html": "...", "gameType": "...", "description": "..."}`;
  }

  return {
    messages: [{ role: 'user', content: userContent }],
    systemPrompt: buildSystemPrompt('game-maker'),
  };
}

export function buildArtMessages(req: ArtRequest): {
  messages: AIMessage[];
  systemPrompt: string;
} {
  const parts: string[] = [
    `Help me create an image prompt based on this idea: "${req.prompt}"`,
  ];
  if (req.style) parts.push(`Style: ${req.style}`);
  if (req.mood) parts.push(`Mood: ${req.mood}`);
  if (req.colors?.length) parts.push(`Colour palette: ${req.colors.join(', ')}`);
  parts.push(
    `\nCreate a rich, detailed image generation prompt and return JSON:\n` +
    `{"imagePrompt": "...", "description": "...", "styleApplied": "..."}`
  );

  return {
    messages: [{ role: 'user', content: parts.join('\n') }],
    systemPrompt: buildSystemPrompt('art-factory'),
  };
}

export function buildMusicMessages(req: MusicRequest): {
  messages: AIMessage[];
  systemPrompt: string;
} {
  const parts: string[] = [
    `Help me create a piece of music based on: "${req.prompt}"`,
  ];
  if (req.mood) parts.push(`Mood: ${req.mood}`);
  if (req.instruments?.length) parts.push(`Instruments: ${req.instruments.join(', ')}`);
  if (req.tempo) parts.push(`Tempo: ${req.tempo}`);
  parts.push(
    `\nReturn JSON:\n` +
    `{"description": "...", "tempo": "...", "mood": "...", "instrumentation": [...], "lyricsSnippet": "..."}`
  );

  return {
    messages: [{ role: 'user', content: parts.join('\n') }],
    systemPrompt: buildSystemPrompt('music-maker'),
  };
}

export function buildCodeExplainMessages(req: CodeRequest): {
  messages: AIMessage[];
  systemPrompt: string;
} {
  const parts: string[] = [
    `Please explain this code to me in simple, fun language:\n\`\`\`\n${req.code}\n\`\`\``,
  ];
  if (req.question) parts.push(`I also have this question about it: ${req.question}`);
  parts.push(
    `\nReturn JSON:\n` +
    `{"explanation": "...", "concepts": [...], "analogies": [...]}`
  );

  return {
    messages: [{ role: 'user', content: parts.join('\n') }],
    systemPrompt: buildSystemPrompt('code-explainer'),
  };
}

export function buildCodeModifyMessages(req: CodeModifyRequest): {
  messages: AIMessage[];
  systemPrompt: string;
} {
  return {
    messages: [{
      role: 'user',
      content:
        `Here is some code:\n\`\`\`\n${req.code}\n\`\`\`\n\n` +
        `Please make this change in plain English: "${req.instruction}"\n\n` +
        `Return JSON:\n{"modifiedCode": "...", "explanation": "...", "changesDescription": "..."}`,
    }],
    systemPrompt: buildSystemPrompt('code-explainer'),
  };
}

export function buildPromptScoreMessages(req: PromptScoreRequest): {
  messages: AIMessage[];
  systemPrompt: string;
} {
  return {
    messages: [{
      role: 'user',
      content:
        `A child used this prompt in the "${req.trackId}" activity:\n` +
        `PROMPT: "${req.userPrompt}"\n\n` +
        `The AI produced this result:\n${req.aiResult}\n\n` +
        `Score the prompt from 0–100 on these 4 dimensions:\n` +
        `- Clarity: Was it specific and clear?\n` +
        `- Creativity: Was it original and imaginative?\n` +
        `- Context: Did they provide enough information?\n` +
        `- Result: How good was the output they got?\n\n` +
        `Also give ONE friendly sentence of encouragement and up to 3 short suggestions to improve.\n\n` +
        `Return JSON:\n` +
        `{"clarity": 0-100, "creativity": 0-100, "context": 0-100, "result": 0-100, ` +
        `"overall": 0-100, "feedback": "...", "suggestions": [...]}`,
    }],
    systemPrompt:
      `You are a friendly AI coach helping children improve their prompting skills. ` +
      `Always be encouraging and constructive. Never be negative.`,
  };
}

export function buildSafetyCheckMessages(content: string): {
  messages: AIMessage[];
  systemPrompt: string;
} {
  return {
    messages: [{
      role: 'user',
      content:
        `Is the following content safe and appropriate for children aged 6–16?\n\n` +
        `CONTENT: "${content}"\n\n` +
        `Return JSON: {"safe": true|false, "reason": "..." (only if unsafe)}`,
    }],
    systemPrompt:
      `You are a content safety reviewer for a children's educational app. ` +
      `Be strict: flag anything violent, sexual, hateful, or inappropriate for children.`,
  };
}

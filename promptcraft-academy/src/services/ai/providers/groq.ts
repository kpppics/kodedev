// ==========================================
// AI PROVIDER — Groq
// Models: llama3-8b-8192 (fast free tier), mixtral-8x7b-32768 (smarter)
// OpenAI-compatible API — easy swap-in
// ==========================================

import {
  AIProvider,
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
} from '../types';

const GROQ_DEFAULT_MODEL = 'llama3-8b-8192';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

interface GroqChoice {
  message: { role: string; content: string };
  finish_reason: string;
}

interface GroqResponse {
  choices: GroqChoice[];
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number };
}

export class GroqProvider implements AIProvider {
  readonly name = 'groq' as const;
  private config: AIProviderConfig;

  constructor(config: Omit<AIProviderConfig, 'name' | 'defaultModel'> & {
    defaultModel?: string;
  }) {
    this.config = {
      name: 'groq',
      defaultModel: GROQ_DEFAULT_MODEL,
      baseUrl: GROQ_BASE_URL,
      timeoutMs: 20_000,
      ...config,
    };
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const start = Date.now();
    const model = request.model ?? this.config.defaultModel;

    // Build message array — system message first if provided
    const messages = request.systemPrompt
      ? [{ role: 'system', content: request.systemPrompt }, ...request.messages]
      : [...request.messages];

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs ?? 20_000
    );

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: request.maxTokens ?? 2048,
          temperature: request.temperature ?? 0.7,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(`Groq API error ${response.status}: ${err?.error?.message ?? response.statusText}`);
      }

      const data = await response.json() as GroqResponse;
      const content = data.choices[0]?.message?.content ?? '';

      return {
        content,
        model: data.model,
        provider: 'groq',
        usage: {
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
        },
        durationMs: Date.now() - start,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      return Boolean(this.config.apiKey);
    } catch {
      return false;
    }
  }
}

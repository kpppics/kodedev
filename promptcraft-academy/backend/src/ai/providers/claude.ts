// ==========================================
// AI PROVIDER — Anthropic Claude (Backend)
// Model: claude-haiku-4-5 (fast + affordable)
// Uses server-side CLAUDE_API_KEY env var.
// ==========================================

import {
  AIProvider,
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
  AIMessage,
} from '../types';

const CLAUDE_DEFAULT_MODEL = 'claude-haiku-4-5';
const CLAUDE_BASE_URL = 'https://api.anthropic.com/v1';
const CLAUDE_API_VERSION = '2023-06-01';

interface AnthropicContentBlock {
  type: 'text';
  text: string;
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
  model: string;
  usage: { input_tokens: number; output_tokens: number };
}

interface AnthropicError {
  error?: { message?: string };
}

export class ClaudeProvider implements AIProvider {
  readonly name = 'claude' as const;
  private config: AIProviderConfig;

  constructor(config: Omit<AIProviderConfig, 'name' | 'defaultModel'> & {
    defaultModel?: string;
  }) {
    this.config = {
      name: 'claude',
      defaultModel: CLAUDE_DEFAULT_MODEL,
      baseUrl: CLAUDE_BASE_URL,
      timeoutMs: 30_000,
      ...config,
    };
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const start = Date.now();
    const model = request.model ?? this.config.defaultModel;
    const baseUrl = this.config.baseUrl ?? CLAUDE_BASE_URL;

    // Separate system messages from conversation messages
    const systemMessages = request.messages.filter(m => m.role === 'system');
    const conversationMessages: AIMessage[] = request.messages.filter(m => m.role !== 'system');

    // Build system prompt
    const systemParts: string[] = [];
    if (request.systemPrompt) systemParts.push(request.systemPrompt);
    systemMessages.forEach(m => systemParts.push(m.content));
    const systemPrompt = systemParts.join('\n\n') || undefined;

    const body: Record<string, unknown> = {
      model,
      max_tokens: request.maxTokens ?? 2048,
      temperature: request.temperature ?? 0.7,
      messages: conversationMessages.map(m => ({ role: m.role, content: m.content })),
    };
    if (systemPrompt) body['system'] = systemPrompt;

    const controller = new AbortController();
    const timeoutHandle = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs ?? 30_000
    );

    try {
      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': CLAUDE_API_VERSION,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as AnthropicError;
        throw new Error(
          `Claude API error ${response.status}: ${err?.error?.message ?? response.statusText}`
        );
      }

      const data = await response.json() as AnthropicResponse;
      const content = data.content.map(b => b.text).join('');

      return {
        content,
        model: data.model,
        provider: 'claude',
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
        },
        durationMs: Date.now() - start,
      };
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.config.apiKey) && this.config.apiKey !== 'no-key-set';
  }
}

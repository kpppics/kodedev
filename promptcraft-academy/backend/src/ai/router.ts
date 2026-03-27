// ==========================================
// AI ROUTER — Provider-agnostic AI calls (Backend)
// ==========================================
// Reads config from server-side env vars (no EXPO_PUBLIC_ prefix).
// Strategy options:
//   primary   → use one provider, no fallback
//   fallback  → try primary, fall back to secondary on error
//   cheapest  → pick cheaper provider based on request size
//   fastest   → race both providers, return first response
//
// All backend AI code should import `aiRouter` from here.

import {
  AIProvider,
  AIProviderName,
  AICompletionRequest,
  AICompletionResponse,
} from './types';
import { ClaudeProvider } from './providers/claude';
import { GroqProvider } from './providers/groq';

export type RouterStrategy = 'primary' | 'fallback' | 'cheapest' | 'fastest';

export interface RouterConfig {
  strategy: RouterStrategy;
  primary: AIProviderName;
  secondary?: AIProviderName;
  enableAnalytics?: boolean;
}

export type AnalyticsEvent = {
  provider: AIProviderName;
  model: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  success: boolean;
  strategy: RouterStrategy;
  timestamp: string;
};

export class AIRouter {
  private providers: Map<AIProviderName, AIProvider>;
  private config: RouterConfig;
  private analyticsLog: AnalyticsEvent[] = [];

  constructor(providers: AIProvider[], config: RouterConfig) {
    this.providers = new Map(providers.map(p => [p.name, p]));
    this.config = config;
  }

  /** The main entry point — routes based on strategy */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    switch (this.config.strategy) {
      case 'primary':
        return this.completePrimary(request);
      case 'fallback':
        return this.completeFallback(request);
      case 'cheapest':
        return this.completeCheapest(request);
      case 'fastest':
        return this.completeFastest(request);
      default:
        return this.completePrimary(request);
    }
  }

  /** Use primary provider only */
  private async completePrimary(request: AICompletionRequest): Promise<AICompletionResponse> {
    const provider = this.getProvider(this.config.primary);
    return this.callWithAnalytics(provider, request);
  }

  /** Try primary; if it throws, try secondary */
  private async completeFallback(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const primary = this.getProvider(this.config.primary);
      return await this.callWithAnalytics(primary, request);
    } catch (primaryError) {
      if (!this.config.secondary) throw primaryError;
      console.warn(
        `[AIRouter] Primary provider '${this.config.primary}' failed, ` +
        `falling back to '${this.config.secondary}'`,
        primaryError instanceof Error ? primaryError.message : primaryError
      );
      const secondary = this.getProvider(this.config.secondary);
      return await this.callWithAnalytics(secondary, request);
    }
  }

  /**
   * Cheapest strategy — simple static cost heuristic.
   * Groq (Llama3-8b) is cheapest for short requests (<=500 tokens).
   * Claude Haiku is used when richer reasoning is needed.
   */
  private async completeCheapest(request: AICompletionRequest): Promise<AICompletionResponse> {
    const estimatedInputTokens = this.estimateTokens(request);
    const preferredName: AIProviderName =
      estimatedInputTokens <= 500 && this.providers.has('groq') ? 'groq' : this.config.primary;
    const provider = this.getProvider(preferredName);
    return this.callWithAnalytics(provider, request);
  }

  /** Race both providers, return whichever answers first */
  private async completeFastest(request: AICompletionRequest): Promise<AICompletionResponse> {
    const available = [...this.providers.values()];
    if (available.length === 1) return this.callWithAnalytics(available[0], request);

    return Promise.any(
      available.map(p => this.callWithAnalytics(p, request))
    );
  }

  /** Call a specific provider by name, bypassing routing strategy */
  async completeWith(
    providerName: AIProviderName,
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    const provider = this.getProvider(providerName);
    return this.callWithAnalytics(provider, request);
  }

  /** Update strategy at runtime */
  setStrategy(strategy: RouterStrategy): void {
    this.config.strategy = strategy;
  }

  /** List available providers */
  getAvailableProviders(): AIProviderName[] {
    return [...this.providers.keys()];
  }

  /** Get recent analytics (last 100 events) */
  getAnalytics(): AnalyticsEvent[] {
    return this.analyticsLog.slice(-100);
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private getProvider(name: AIProviderName): AIProvider {
    const p = this.providers.get(name);
    if (!p) throw new Error(`AI provider '${name}' is not registered`);
    return p;
  }

  private async callWithAnalytics(
    provider: AIProvider,
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    let response: AICompletionResponse | undefined;
    let success = false;
    try {
      response = await provider.complete(request);
      success = true;
      return response;
    } finally {
      if (this.config.enableAnalytics) {
        const event: AnalyticsEvent = {
          provider: provider.name,
          model: response?.model ?? 'unknown',
          durationMs: response?.durationMs ?? 0,
          inputTokens: response?.usage.inputTokens ?? 0,
          outputTokens: response?.usage.outputTokens ?? 0,
          success,
          strategy: this.config.strategy,
          timestamp: new Date().toISOString(),
        };
        this.analyticsLog.push(event);
        if (this.analyticsLog.length > 100) this.analyticsLog.shift();
      }
    }
  }

  private estimateTokens(request: AICompletionRequest): number {
    const text = [
      request.systemPrompt ?? '',
      ...request.messages.map(m => m.content),
    ].join(' ');
    // Rough approximation: 1 token ≈ 4 chars
    return Math.ceil(text.length / 4);
  }
}

// ==========================================
// Singleton — built once at startup from env vars
// ==========================================

function buildRouter(): AIRouter {
  const claudeKey = process.env['CLAUDE_API_KEY'] ?? '';
  const groqKey = process.env['GROQ_API_KEY'] ?? '';
  // Groq is the default primary (cheaper); Claude is the quality fallback
  const primaryEnv = (process.env['AI_PRIMARY_PROVIDER'] ?? 'groq').toLowerCase();
  const strategyEnv = (process.env['AI_STRATEGY'] ?? 'fallback').toLowerCase();

  const providers: AIProvider[] = [];

  if (claudeKey) {
    providers.push(new ClaudeProvider({ apiKey: claudeKey }));
  }
  if (groqKey) {
    providers.push(new GroqProvider({ apiKey: groqKey }));
  }

  if (providers.length === 0) {
    console.warn(
      '[AIRouter] No API keys configured. Set CLAUDE_API_KEY or GROQ_API_KEY in .env. ' +
      'AI endpoints will return errors until keys are provided.'
    );
    // Register a stub so the app starts up without crashing
    providers.push(new ClaudeProvider({ apiKey: 'no-key-set' }));
  }

  const hasClaude = Boolean(claudeKey);
  const hasGroq = Boolean(groqKey);

  // Determine primary provider from env or sensible default
  let primary: AIProviderName;
  if (primaryEnv === 'groq' && hasGroq) {
    primary = 'groq';
  } else if (hasClaude) {
    primary = 'claude';
  } else if (hasGroq) {
    primary = 'groq';
  } else {
    primary = 'claude';
  }

  // Secondary for fallback strategy
  let secondary: AIProviderName | undefined;
  if (hasClaude && hasGroq) {
    secondary = primary === 'claude' ? 'groq' : 'claude';
  }

  // Validate strategy
  const validStrategies: RouterStrategy[] = ['primary', 'fallback', 'cheapest', 'fastest'];
  const strategy: RouterStrategy = validStrategies.includes(strategyEnv as RouterStrategy)
    ? (strategyEnv as RouterStrategy)
    : 'fallback';

  console.log(
    `[AIRouter] Initialised — strategy: ${strategy}, primary: ${primary}` +
    (secondary ? `, secondary: ${secondary}` : '')
  );

  return new AIRouter(providers, {
    strategy,
    primary,
    secondary,
    enableAnalytics: true,
  });
}

export const aiRouter: AIRouter = buildRouter();

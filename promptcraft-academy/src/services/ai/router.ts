// ==========================================
// AI ROUTER — Provider-agnostic AI calls
// ==========================================
// Strategy options:
//   primary    → use one provider, no fallback
//   fallback   → try primary, fall back to secondary on error
//   cheapest   → pick whichever provider costs less for this request
//   fastest    → race both providers, return first response
//
// All app code should import from here — never from individual providers.

import {
  AIProvider,
  AIProviderName,
  AICompletionRequest,
  AICompletionResponse,
} from './types';

export type RouterStrategy = 'primary' | 'fallback' | 'cheapest' | 'fastest';

export interface RouterConfig {
  strategy: RouterStrategy;
  primary: AIProviderName;
  secondary?: AIProviderName;
  /** Log provider, model, duration, token usage (no PII) */
  enableAnalytics?: boolean;
}

type AnalyticsEvent = {
  provider: AIProviderName;
  model: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  success: boolean;
  strategy: RouterStrategy;
};

export class AIRouter {
  private providers: Map<AIProviderName, AIProvider>;
  private config: RouterConfig;
  private analyticsLog: AnalyticsEvent[] = [];

  constructor(
    providers: AIProvider[],
    config: RouterConfig,
  ) {
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
    const result = await this.callWithAnalytics(provider, request);
    return result;
  }

  /** Try primary; if it throws, try secondary */
  private async completeFallback(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const primary = this.getProvider(this.config.primary);
      return await this.callWithAnalytics(primary, request);
    } catch (primaryError) {
      if (!this.config.secondary) throw primaryError;
      console.warn(`[AIRouter] Primary provider '${this.config.primary}' failed, falling back to '${this.config.secondary}'`, primaryError);
      const secondary = this.getProvider(this.config.secondary);
      return await this.callWithAnalytics(secondary, request);
    }
  }

  /**
   * Cheapest strategy — simple static cost table.
   * Groq's free tier and Llama3-8b are extremely cheap;
   * Claude Haiku is used when richer reasoning is needed (>500 token requests).
   */
  private async completeCheapest(request: AICompletionRequest): Promise<AICompletionResponse> {
    const estimatedInputTokens = this.estimateTokens(request);
    // For short requests (<= 500 tokens) use Groq (cheaper/free)
    // For longer or complex requests fall back to Claude for quality
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

  /** Call a specific provider by name, bypassing the routing strategy */
  async completeWith(
    providerName: AIProviderName,
    request: AICompletionRequest,
  ): Promise<AICompletionResponse> {
    const provider = this.getProvider(providerName);
    return this.callWithAnalytics(provider, request);
  }

  /** Update strategy at runtime (e.g. from Settings screen) */
  setStrategy(strategy: RouterStrategy) {
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
    request: AICompletionRequest,
  ): Promise<AICompletionResponse> {
    let response: AICompletionResponse | undefined;
    let success = false;
    try {
      response = await provider.complete(request);
      success = true;
      return response;
    } finally {
      if (this.config.enableAnalytics && response) {
        const event: AnalyticsEvent = {
          provider: provider.name,
          model: response.model,
          durationMs: response.durationMs,
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
          success,
          strategy: this.config.strategy,
        };
        this.analyticsLog.push(event);
        // Trim to last 100
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

// Single import point for all AI functionality
export { aiService, default } from './aiService';
export { AIRouter } from './router';
export type { RouterStrategy, RouterConfig } from './router';
export { ClaudeProvider } from './providers/claude';
export { GroqProvider } from './providers/groq';
export type {
  AIProviderName,
  AIProvider,
  AIProviderConfig,
  AIMessage,
  AICompletionRequest,
  AICompletionResponse,
  PromptScoreResult,
  StoryResult,
  WebpageResult,
  GameResult,
  ArtResult,
  MusicResult,
  CodeExplainResult,
  CodeModifyResult,
  SafetyResult,
} from './types';

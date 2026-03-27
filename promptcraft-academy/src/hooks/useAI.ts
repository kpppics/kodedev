// ==========================================
// useAI hook — convenient React wrapper around aiService
// ==========================================
// Usage in any screen:
//   const { generate, loading, result, error, score } = useAI('story-studio');
//   await generate({ prompt: 'A dragon who loves baking' });

import { useState, useCallback } from 'react';
import { aiService } from '../services/ai';
import {
  TrackId, PromptScore,
  StoryResult, WebpageResult, GameResult,
  ArtResult, MusicResult, CodeExplainResult,
} from '../types';
import {
  StoryRequest, WebpageRequest, GameRequest,
  ArtRequest, MusicRequest, CodeRequest, CodeModifyRequest,
  PromptScoreResult,
} from '../services/ai/types';

type TrackRequest =
  | StoryRequest
  | WebpageRequest
  | GameRequest
  | ArtRequest
  | MusicRequest
  | CodeRequest
  | CodeModifyRequest;

type TrackResult =
  | StoryResult
  | WebpageResult
  | GameResult
  | ArtResult
  | MusicResult
  | CodeExplainResult;

interface UseAIReturn<TReq extends TrackRequest, TRes extends TrackResult> {
  generate: (req: TReq) => Promise<TRes | null>;
  loading: boolean;
  result: TRes | null;
  score: PromptScoreResult | null;
  error: string | null;
  reset: () => void;
  providers: string[];
}

export function useAI(trackId: TrackId): UseAIReturn<TrackRequest, TrackResult> {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (req: TrackRequest): Promise<TrackResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let res: TrackResult;
      switch (trackId) {
        case 'story-studio':
          res = await aiService.generateStory(req as StoryRequest);
          break;
        case 'web-builder':
          res = await aiService.generateWebpage(req as WebpageRequest);
          break;
        case 'game-maker':
          res = await aiService.generateGame(req as GameRequest);
          break;
        case 'art-factory':
          res = await aiService.generateArt(req as ArtRequest);
          break;
        case 'music-maker':
          res = await aiService.generateMusic(req as MusicRequest);
          break;
        case 'code-explainer':
          res = await aiService.explainCode(req as CodeRequest);
          break;
        default:
          throw new Error(`Unknown track: ${trackId}`);
      }
      setResult(res);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    generate,
    loading,
    result,
    score: result && 'score' in result ? (result as { score: PromptScoreResult }).score : null,
    error,
    reset,
    providers: aiService.getAvailableProviders(),
  };
}

// Convenience typed hooks per track
export const useStoryAI = () => useAI('story-studio');
export const useWebBuilderAI = () => useAI('web-builder');
export const useGameMakerAI = () => useAI('game-maker');
export const useArtFactoryAI = () => useAI('art-factory');
export const useMusicMakerAI = () => useAI('music-maker');
export const useCodeExplainerAI = () => useAI('code-explainer');

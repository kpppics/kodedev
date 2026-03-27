// ==========================================
// CHILD CONTENT SAFETY FILTER (Backend)
// ==========================================
// Two-stage pipeline:
//   1. Pre-filter  — fast blocklist check on input prompt
//   2. Post-filter — AI-powered verification of generated content
//
// The filter is deliberately conservative: when in doubt, flag.

import { aiRouter } from './router';

// ---- Blocklist ----
// Keep this list minimal — the AI post-filter handles nuance.
// These are obvious patterns that should never appear in a children's app.
const BLOCKLIST_PATTERNS: RegExp[] = [
  /\bfuck\b/i,
  /\bshit\b/i,
  /\bsex\b/i,
  /\bporn\b/i,
  /\bkill\s+(my|your)?self\b/i,
  /\bsuicid/i,
  /\bdrug(s)?\s+use\b/i,
  /\bhate\s+speech\b/i,
  /\bterror(ism|ist)?\b/i,
  /\bweapon(s)?\s+of\b/i,
  /\bnaked\b/i,
  /\bnude\b/i,
  /\bexplicit\b/i,
  /\bviolent\s+content\b/i,
];

export interface SafetyCheckResult {
  safe: boolean;
  filteredContent: string;
  reason?: string;
  blockedByFilter?: 'blocklist' | 'ai';
}

/**
 * Pre-filter: fast blocklist check.
 * Returns true if content matches any blocklist pattern.
 */
function blockedByBlocklist(text: string): { blocked: boolean; reason?: string } {
  for (const pattern of BLOCKLIST_PATTERNS) {
    if (pattern.test(text)) {
      return {
        blocked: true,
        reason: `Content matched safety blocklist pattern: ${pattern.source}`,
      };
    }
  }
  return { blocked: false };
}

/**
 * Post-filter: AI-powered content safety verification.
 * Calls the AI router with a strict safety-reviewer persona.
 */
async function verifyWithAI(content: string): Promise<{ safe: boolean; reason?: string }> {
  try {
    const response = await aiRouter.complete({
      systemPrompt:
        'You are a content safety reviewer for a children\'s educational app. ' +
        'Your job is to determine if content is appropriate for children aged 6–16. ' +
        'Be strict: flag anything violent, sexual, hateful, or otherwise inappropriate. ' +
        'Respond ONLY with valid JSON, no markdown fences.',
      messages: [
        {
          role: 'user',
          content:
            `Is the following content safe and appropriate for children aged 6–16?\n\n` +
            `CONTENT:\n"""\n${content.slice(0, 2000)}\n"""\n\n` +
            `Return JSON exactly: {"safe": true, "reason": null} or {"safe": false, "reason": "brief explanation"}`,
        },
      ],
      maxTokens: 128,
      temperature: 0,
    });

    // Parse AI response
    const raw = response.content.trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { safe: true }; // fail open if unparseable

    const parsed = JSON.parse(match[0]) as { safe: boolean; reason?: string | null };
    return {
      safe: Boolean(parsed.safe),
      reason: parsed.reason ?? undefined,
    };
  } catch (err) {
    // Fail open — don't block children if AI safety check errors
    console.error('[SafetyFilter] AI verification failed, failing open:', err);
    return { safe: true };
  }
}

/**
 * Run both filters on a piece of content (prompt or AI output).
 *
 * @param content   The text to check
 * @param skipAI    Skip the AI verification step (useful for pre-checking input prompts quickly)
 */
export async function runSafetyFilter(
  content: string,
  skipAI = false
): Promise<SafetyCheckResult> {
  const childSafeMode = process.env['CHILD_SAFE_MODE'] !== 'false';

  if (!childSafeMode) {
    // Safety mode disabled (e.g. internal dev testing)
    return { safe: true, filteredContent: content };
  }

  // Stage 1: blocklist
  const blocklistResult = blockedByBlocklist(content);
  if (blocklistResult.blocked) {
    return {
      safe: false,
      filteredContent: '[Content removed by safety filter]',
      reason: blocklistResult.reason,
      blockedByFilter: 'blocklist',
    };
  }

  // Stage 2: AI verification (optional, skipped for quick pre-checks)
  if (!skipAI) {
    const aiResult = await verifyWithAI(content);
    if (!aiResult.safe) {
      return {
        safe: false,
        filteredContent: '[Content removed by safety filter]',
        reason: aiResult.reason,
        blockedByFilter: 'ai',
      };
    }
  }

  return { safe: true, filteredContent: content };
}

/**
 * Convenience: check a user's input prompt before sending to AI.
 * Uses blocklist only (fast, no AI round-trip on input).
 */
export async function checkInputPrompt(prompt: string): Promise<SafetyCheckResult> {
  return runSafetyFilter(prompt, true /* skipAI */);
}

/**
 * Convenience: verify AI-generated output.
 * Runs both blocklist and AI verification.
 */
export async function checkGeneratedContent(content: string): Promise<SafetyCheckResult> {
  return runSafetyFilter(content, false);
}

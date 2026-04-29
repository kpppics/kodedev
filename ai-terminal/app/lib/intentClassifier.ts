import { Intent } from '@/app/types'

interface IntentPattern {
  intent: Intent
  patterns: RegExp[]
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'build',
    patterns: [
      /\b(create|build|make|add|new|implement|set up|setup|scaffold|generate|write me|code me|design)\b/i,
      /\b(i need|i want|can you make|can you build|can you create)\b/i,
      /\b(give me|put together|whip up|knock out)\b/i,
    ],
  },
  {
    intent: 'fix',
    patterns: [
      /\b(fix|bug|broken|error|crash|not working|issue|debug|wrong|failing|fails)\b/i,
      /\b(doesn't work|doesn't load|won't compile|won't run|keeps crashing)\b/i,
      /\b(something's wrong|what's wrong|help me fix|troubleshoot)\b/i,
    ],
  },
  {
    intent: 'explain',
    patterns: [
      /\b(explain|what does|how does|why does|what is|what are|walk me through)\b/i,
      /\b(how do i|how would i|how can i|tell me about|break down)\b/i,
      /\b(understand|meaning of|purpose of|what's the deal with)\b/i,
    ],
  },
  {
    intent: 'refactor',
    patterns: [
      /\b(refactor|clean up|cleanup|improve|optimize|simplify|restructure|reorganize)\b/i,
      /\b(make it better|make it cleaner|tidy up|reduce complexity)\b/i,
    ],
  },
  {
    intent: 'test',
    patterns: [
      /\b(test|spec|coverage|jest|vitest|testing|unit test|integration test|e2e)\b/i,
      /\b(write tests|add tests|test this|test for)\b/i,
    ],
  },
  {
    intent: 'deploy',
    patterns: [
      /\b(deploy|deployment|vercel|netlify|ci|cd|pipeline|production|ship|release|publish)\b/i,
      /\b(go live|push to prod|put it live)\b/i,
    ],
  },
]

export function classifyIntent(input: string): Intent {
  const normalized = input.toLowerCase().trim()
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(normalized))) {
      return intent
    }
  }
  return 'general'
}

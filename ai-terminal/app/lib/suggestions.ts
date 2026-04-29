import { Message, Intent, SuggestionChip } from '@/app/types'

const STARTERS: SuggestionChip[] = [
  { label: 'Build something', prompt: 'Build me a ', icon: 'construction' },
  { label: 'Fix a bug', prompt: 'Help me fix ', icon: 'bug_report' },
  { label: 'Explain code', prompt: 'Explain how ', icon: 'school' },
  { label: 'Write tests', prompt: 'Write tests for ', icon: 'science' },
  { label: 'Refactor', prompt: 'Refactor this: ', icon: 'auto_fix_high' },
  { label: 'Deploy help', prompt: 'Help me deploy ', icon: 'rocket_launch' },
]

const FOLLOW_UPS: Partial<Record<Intent, SuggestionChip[]>> = {
  build: [
    { label: 'Add tests', prompt: 'Write tests for what you just built', icon: 'science' },
    { label: 'Add error handling', prompt: 'Add proper error handling to the code above', icon: 'shield' },
    { label: 'Make responsive', prompt: 'Make the component above responsive for mobile', icon: 'phone_iphone' },
    { label: 'Add types', prompt: 'Add comprehensive TypeScript types', icon: 'code' },
  ],
  fix: [
    { label: 'Explain the cause', prompt: 'Explain the root cause in more detail', icon: 'search' },
    { label: 'Add regression test', prompt: 'Write a regression test for this bug', icon: 'science' },
    { label: 'Similar bugs?', prompt: 'Are there likely similar bugs elsewhere?', icon: 'bug_report' },
  ],
  explain: [
    { label: 'Show an example', prompt: 'Show me a practical example', icon: 'code' },
    { label: 'Go deeper', prompt: 'Explain that in more technical detail', icon: 'school' },
    { label: 'Simplify', prompt: 'Can you explain that more simply?', icon: 'lightbulb' },
  ],
  refactor: [
    { label: 'Add tests', prompt: 'Write tests to verify the refactored code works', icon: 'science' },
    { label: 'Explain changes', prompt: 'Walk me through each change you made', icon: 'school' },
  ],
  test: [
    { label: 'More edge cases', prompt: 'Add more edge case tests', icon: 'science' },
    { label: 'Add mocks', prompt: 'Add proper mocking for external dependencies', icon: 'build' },
  ],
  deploy: [
    { label: 'Troubleshoot', prompt: 'Something went wrong with the deployment', icon: 'bug_report' },
    { label: 'Add CI/CD', prompt: 'Set up a CI/CD pipeline for this', icon: 'settings' },
  ],
}

export function getSuggestions(messages: Message[], lastIntent?: Intent): SuggestionChip[] {
  if (messages.length === 0) return STARTERS

  if (lastIntent && FOLLOW_UPS[lastIntent]) {
    return [
      ...FOLLOW_UPS[lastIntent]!,
      { label: 'New topic', prompt: '', icon: 'add_circle' },
    ]
  }

  return [
    { label: 'Continue', prompt: 'Can you continue from where you left off?', icon: 'arrow_forward' },
    { label: 'Clarify', prompt: 'Can you clarify that?', icon: 'help' },
    { label: 'New topic', prompt: '', icon: 'add_circle' },
  ]
}

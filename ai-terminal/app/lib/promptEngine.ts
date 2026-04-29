import { Message, PromptContext } from '@/app/types'
import { classifyIntent } from './intentClassifier'
import { extractContext } from './contextExtractor'
import { applyTemplate } from './promptTemplates'

function cleanVoiceInput(input: string): string {
  return input
    .replace(/\bnew line\b/gi, '\n')
    .replace(/\bcomma\b/gi, ',')
    .replace(/\bperiod\b/gi, '.')
    .replace(/\bquestion mark\b/gi, '?')
    .replace(/\bexclamation mark\b/gi, '!')
    .replace(/\bopen bracket\b/gi, '(')
    .replace(/\bclose bracket\b/gi, ')')
    .replace(/\bopen curly\b/gi, '{')
    .replace(/\bclose curly\b/gi, '}')
    .replace(/\bcolon\b/gi, ':')
    .replace(/\bsemicolon\b/gi, ';')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function capitalizeFirstLetter(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function buildPrompt(
  rawInput: string,
  _messages: Message[],
  isVoice: boolean
): { structuredPrompt: string; intent: PromptContext['intent']; context: PromptContext } {
  let cleaned = rawInput.trim().replace(/\s+/g, ' ')

  if (isVoice) {
    cleaned = cleanVoiceInput(cleaned)
    cleaned = capitalizeFirstLetter(cleaned)
    if (cleaned && !/[.!?]$/.test(cleaned)) {
      cleaned += '.'
    }
  }

  const intent = classifyIntent(cleaned)
  const { language, framework, fileRefs } = extractContext(cleaned)

  const context: PromptContext = {
    rawInput: cleaned,
    intent,
    language,
    framework,
    fileRefs,
    isVoice,
  }

  const structuredPrompt = applyTemplate(context)

  return { structuredPrompt, intent, context }
}

export type MessageRole = 'user' | 'assistant' | 'system'

export type Intent = 'build' | 'fix' | 'explain' | 'refactor' | 'test' | 'deploy' | 'general'

export interface Message {
  id: string
  role: MessageRole
  content: string
  structuredPrompt?: string
  intent?: Intent
  timestamp: number
  isStreaming?: boolean
}

export interface Session {
  id: string
  name: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export interface VoiceState {
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  isSupported: boolean
}

export interface PromptContext {
  rawInput: string
  intent: Intent
  language?: string
  framework?: string
  fileRefs: string[]
  isVoice: boolean
}

export interface SuggestionChip {
  label: string
  prompt: string
  icon: string
}

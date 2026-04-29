'use client'

import { useState } from 'react'
import { Message } from '@/app/types'
import CodeBlock from './CodeBlock'

interface MessageBubbleProps {
  message: Message
}

function parseContent(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {formatInlineText(content.slice(lastIndex, match.index))}
        </span>
      )
    }
    parts.push(
      <CodeBlock key={`code-${match.index}`} language={match[1]} code={match[2].trim()} />
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {formatInlineText(content.slice(lastIndex))}
      </span>
    )
  }

  return parts
}

function formatInlineText(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const inlineRegex = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index))
    }
    if (match[1]) {
      nodes.push(
        <code
          key={`inline-${match.index}`}
          className="bg-terminal-elevated px-1.5 py-0.5 rounded text-terminal-accent font-mono text-[0.85em]"
        >
          {match[1]}
        </code>
      )
    } else if (match[2]) {
      nodes.push(<strong key={`bold-${match.index}`} className="font-semibold">{match[2]}</strong>)
    } else if (match[3]) {
      nodes.push(<em key={`italic-${match.index}`}>{match[3]}</em>)
    }
    last = match.index + match[0].length
  }

  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const isUser = message.role === 'user'

  return (
    <div className={`msg-enter flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-terminal-user-bg text-terminal-text rounded-br-md'
            : 'bg-terminal-surface border border-terminal-border text-terminal-text rounded-bl-md'
        }`}
      >
        {isUser && message.intent && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-terminal-accent font-medium px-1.5 py-0.5 bg-terminal-accent/10 rounded">
              {message.intent}
            </span>
          </div>
        )}

        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {parseContent(message.content)}
          {message.isStreaming && <span className="cursor-blink ml-0.5" />}
        </div>

        {isUser && message.structuredPrompt && (
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="mt-2 text-[10px] text-terminal-muted hover:text-terminal-accent transition-colors flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-[14px]">
              {showPrompt ? 'expand_less' : 'expand_more'}
            </span>
            {showPrompt ? 'Hide' : 'View'} enhanced prompt
          </button>
        )}

        {showPrompt && message.structuredPrompt && (
          <div className="mt-2 p-2 bg-terminal-elevated rounded text-[11px] text-terminal-muted font-mono whitespace-pre-wrap border border-terminal-border">
            {message.structuredPrompt}
          </div>
        )}

        <div className="mt-1 text-[10px] text-terminal-muted/50">
          {new Date(message.timestamp).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}

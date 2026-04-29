'use client'

import { useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-lg overflow-hidden bg-[#0d1117] border border-terminal-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] text-xs text-terminal-muted">
        <span className="font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-terminal-accent transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-sm leading-relaxed">
        <code className="font-mono text-terminal-text">{code}</code>
      </pre>
    </div>
  )
}

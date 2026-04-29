'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useChat } from '@/app/hooks/useChat'
import { useVoice } from '@/app/hooks/useVoice'
import { useOfflineQueue } from '@/app/hooks/useOfflineQueue'
import { usePWA } from '@/app/hooks/usePWA'
import MessageBubble from './MessageBubble'
import VoiceButton from './VoiceButton'
import TextInput from './TextInput'
import SuggestionChips from './SuggestionChips'
import StatusBar from './StatusBar'
import SettingsPanel from './SettingsPanel'

interface TerminalShellProps {
  token: string
  onLogout: () => void
}

export default function TerminalShell({ token, onLogout }: TerminalShellProps) {
  const {
    messages,
    isLoading,
    error,
    suggestions,
    sendMessage,
    stopStreaming,
    clearMessages,
    currentSession,
    sessions,
    switchSession,
    createSession,
    deleteSession,
  } = useChat(token)

  const voice = useVoice()
  const { isOnline, queuedCount, enqueue, flush } = useOfflineQueue()
  const { canInstall, install } = usePWA()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [chipPrompt, setChipPrompt] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOnline && queuedCount > 0) {
      flush(sendMessage)
    }
  }, [isOnline, queuedCount, flush, sendMessage])

  const handleSend = useCallback(
    (text: string, isVoice = false) => {
      if (!isOnline) {
        enqueue({ rawInput: text, isVoice })
        return
      }
      sendMessage(text, isVoice)
    },
    [isOnline, enqueue, sendMessage]
  )

  const handleVoiceStop = useCallback(() => {
    voice.stopListening()
    if (voice.transcript.trim()) {
      handleSend(voice.transcript, true)
      voice.resetTranscript()
    }
  }, [voice, handleSend])

  const handleChipSelect = useCallback((prompt: string) => {
    if (!prompt) {
      clearMessages()
      return
    }
    setChipPrompt(prompt)
  }, [clearMessages])

  return (
    <div className="h-full flex flex-col bg-terminal-bg">
      <StatusBar
        sessionName={currentSession?.name}
        isOnline={isOnline}
        isLoading={isLoading}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-60">
            <span className="material-symbols-outlined text-[48px] text-terminal-accent/40 mb-3">
              terminal
            </span>
            <p className="text-sm text-terminal-muted mb-1">Welcome to AI Terminal</p>
            <p className="text-xs text-terminal-muted/60">
              Type or speak to start coding with AI
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && messages.length > 0 && !messages.at(-1)?.isStreaming && (
          <div className="flex justify-start mb-3">
            <div className="bg-terminal-surface border border-terminal-border rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              <span className="typing-dot w-1.5 h-1.5 bg-terminal-accent rounded-full" />
              <span className="typing-dot w-1.5 h-1.5 bg-terminal-accent rounded-full" />
              <span className="typing-dot w-1.5 h-1.5 bg-terminal-accent rounded-full" />
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-sm mb-3 px-4 py-2 bg-terminal-error/10 border border-terminal-error/20 rounded-lg text-xs text-terminal-error text-center">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {voice.isListening && (
        <div className="px-4 py-2 bg-terminal-error/5 border-t border-terminal-error/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-terminal-error rounded-full animate-pulse" />
            <span className="text-xs text-terminal-error font-medium">Listening...</span>
          </div>
          {(voice.transcript || voice.interimTranscript) && (
            <p className="text-xs text-terminal-muted mt-1 truncate">
              {voice.transcript}
              <span className="text-terminal-muted/50">{voice.interimTranscript}</span>
            </p>
          )}
        </div>
      )}

      {voice.error && (
        <div className="px-4 py-1.5 bg-terminal-error/10">
          <p className="text-[10px] text-terminal-error">{voice.error}</p>
        </div>
      )}

      <SuggestionChips suggestions={suggestions} onSelect={handleChipSelect} />

      {!isOnline && queuedCount > 0 && (
        <div className="px-4 py-1 bg-terminal-warning/10 text-center">
          <span className="text-[10px] text-terminal-warning">
            {queuedCount} message{queuedCount > 1 ? 's' : ''} queued — will send when back online
          </span>
        </div>
      )}

      <div className="flex items-end gap-2 px-4 py-3 border-t border-terminal-border safe-bottom bg-terminal-bg">
        <TextInput
          onSend={(text) => handleSend(text, false)}
          disabled={isLoading}
          initialValue={chipPrompt}
          onClear={() => setChipPrompt('')}
          placeholder={voice.isListening ? 'Listening...' : 'Ask anything...'}
        />
        {isLoading ? (
          <button
            onClick={stopStreaming}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-terminal-error/20 text-terminal-error hover:bg-terminal-error/30 transition-colors shrink-0"
            aria-label="Stop"
          >
            <span className="material-symbols-outlined text-[20px]">stop</span>
          </button>
        ) : (
          <VoiceButton
            isListening={voice.isListening}
            isSupported={voice.isSupported}
            onStart={voice.startListening}
            onStop={handleVoiceStop}
          />
        )}
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sessions={sessions}
        currentSessionId={currentSession?.id}
        onSwitchSession={switchSession}
        onNewSession={createSession}
        onDeleteSession={deleteSession}
        onClearMessages={clearMessages}
        onLogout={onLogout}
        canInstall={canInstall}
        onInstall={install}
      />
    </div>
  )
}

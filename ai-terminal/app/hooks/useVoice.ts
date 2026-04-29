'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access denied. Check your browser settings.',
  'no-speech': 'No speech detected. Try again.',
  'audio-capture': 'No microphone found.',
  network: 'Network error. Check your connection.',
  aborted: '',
}

export function useVoice() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const shouldBeListening = useRef(false)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-GB'

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let final = ''
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            final += result[0].transcript
          } else {
            interim += result[0].transcript
          }
        }
        if (final) setTranscript((prev) => (prev + ' ' + final).trim())
        setInterimTranscript(interim)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const msg = ERROR_MESSAGES[event.error] ?? 'Voice recognition error.'
        if (msg) setError(msg)
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          shouldBeListening.current = false
          setIsListening(false)
        }
      }

      recognition.onend = () => {
        if (shouldBeListening.current) {
          try { recognition.start() } catch { /* already started */ }
        } else {
          setIsListening(false)
          setInterimTranscript('')
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        shouldBeListening.current = false
        recognitionRef.current.abort()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    setError(null)
    setTranscript('')
    setInterimTranscript('')
    shouldBeListening.current = true
    setIsListening(true)
    try {
      recognitionRef.current?.start()
    } catch {
      /* already started */
    }
  }, [])

  const stopListening = useCallback(() => {
    shouldBeListening.current = false
    setIsListening(false)
    setInterimTranscript('')
    try {
      recognitionRef.current?.stop()
    } catch {
      /* already stopped */
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}

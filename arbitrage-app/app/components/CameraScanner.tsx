'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  onDetected: (code: string) => void
}

type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => {
  detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue: string; format: string }>>
}

export function CameraScanner({ onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    let rafId = 0

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        if (cancelled) return
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.setAttribute('playsinline', 'true')
        await video.play()
        setRunning(true)
        runDetection()
      } catch (e) {
        setError('Camera access denied or unavailable. On iPhone, open in Safari over HTTPS and allow camera in Settings.')
      }
    }

    async function runDetection() {
      const w = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }
      if (w.BarcodeDetector) {
        const detector = new w.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'] })
        const tick = async () => {
          if (cancelled || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0) {
              triggerHaptic()
              onDetected(codes[0].rawValue)
              return
            }
          } catch { /* ignore */ }
          rafId = requestAnimationFrame(tick)
        }
        tick()
      } else {
        // Fallback: ZXing
        try {
          const { BrowserMultiFormatReader } = await import('@zxing/browser')
          const reader = new BrowserMultiFormatReader()
          if (cancelled || !videoRef.current) return
          reader.decodeFromVideoElement(videoRef.current, (result) => {
            if (cancelled) return
            if (result) {
              triggerHaptic()
              onDetected(result.getText())
            }
          })
        } catch {
          setError('Barcode scanner unavailable on this browser.')
        }
      }
    }

    start()
    return () => {
      cancelled = true
      if (rafId) cancelAnimationFrame(rafId)
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [onDetected])

  return (
    <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--color-outline-variant)', background: '#000', aspectRatio: '3 / 4' }}>
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      {running && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="border-2 rounded-xl" style={{ width: '75%', height: '40%', borderColor: 'rgba(255,255,255,0.8)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }} />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-white" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div>
            <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.8 }}>videocam_off</span>
            <p className="mt-2 text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function triggerHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(30) } catch { /* noop */ }
  }
}

'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { Mascot, type MascotState } from './Mascot'
import { MASCOT_ASPECT, MASCOT_IMAGE_SRC, MASCOT_VISOR } from '../lib/mascotConfig'

interface MascotHybridProps {
  state?: MascotState
  size?: number
  style?: CSSProperties
}

type ImgStatus = 'loading' | 'ready' | 'failed'

/**
 * Renders the user-supplied mascot photo with SVG expression overlays
 * (talking mouth, thinking bubble, cheering sparkles, blink). If the
 * source image is missing or fails to load, falls back to the inline
 * SVG mascot which has the same group-id animation hooks.
 */
export function MascotHybrid({ state = 'idle', size = 140, style }: MascotHybridProps) {
  const [status, setStatus] = useState<ImgStatus>('loading')

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setStatus('ready')
    img.onerror = () => setStatus('failed')
    img.src = MASCOT_IMAGE_SRC
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [])

  if (status !== 'ready') {
    return <Mascot state={state} size={size} style={style} />
  }

  // viewBox tied to a 100-unit width and height derived from aspect ratio
  // so percentages from MASCOT_VISOR map straight onto SVG coordinates.
  const VB_W = 100
  const VB_H = Math.round(100 / MASCOT_ASPECT)
  const v = MASCOT_VISOR

  // convert visor-coord percentages → SVG units in this viewBox
  const px = (xPct: number) => xPct
  const py = (yPct: number) => (yPct / 100) * VB_H

  const eyesY = py(v.eyesY)
  const mouthY = py(v.mouthY)
  const visorTop = py(v.top)
  const visorBottom = py(v.bottom)
  const visorHeight = visorBottom - visorTop

  const containerStyle: CSSProperties = {
    width: size,
    height: size / MASCOT_ASPECT,
    position: 'relative',
    ...style,
  }

  return (
    <div
      className={`mascot mascot-hybrid mascot-${state}`}
      style={containerStyle}
      aria-hidden="true"
    >
      {/* base photo — wrapped in #body so kids.css body-bob animations apply */}
      <div id="body" style={{ position: 'absolute', inset: 0 }}>
        <img
          src={MASCOT_IMAGE_SRC}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            userSelect: 'none',
            WebkitUserDrag: 'none',
          } as CSSProperties}
        />

        {/* Overlay SVG for expression changes */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="kodey-hybrid-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
          </defs>

          {/* TALKING — patch the mouth area and draw an animated oval */}
          {state === 'talking' && (
            <g id="mouth">
              <rect
                x={v.mouthX - v.mouthHalfWidth - 1}
                y={mouthY - 2.4}
                width={(v.mouthHalfWidth + 1) * 2}
                height={5}
                rx={2.4}
                fill={v.fill}
              />
              <ellipse
                cx={v.mouthX}
                cy={mouthY}
                rx={v.mouthHalfWidth - 0.6}
                ry={1.6}
                fill="#6bffd4"
                opacity="0.95"
              />
              <ellipse
                cx={v.mouthX}
                cy={mouthY}
                rx={v.mouthHalfWidth + 0.6}
                ry={2}
                fill="#2eebc0"
                opacity="0.5"
                filter="url(#kodey-hybrid-glow)"
              />
            </g>
          )}

          {/* CHEERING — bigger smile + sparkles */}
          {state === 'cheering' && (
            <>
              <g id="mouth">
                <rect
                  x={v.mouthX - v.mouthHalfWidth - 1.5}
                  y={mouthY - 2.4}
                  width={(v.mouthHalfWidth + 1.5) * 2}
                  height={5.5}
                  rx={2.4}
                  fill={v.fill}
                />
                <path
                  d={`M ${v.mouthX - v.mouthHalfWidth} ${mouthY - 1}
                      Q ${v.mouthX} ${mouthY + 2.6}
                      ${v.mouthX + v.mouthHalfWidth} ${mouthY - 1}`}
                  stroke="#6bffd4"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
              <g style={{ fontSize: 7 }}>
                <text x={v.left - 6} y={visorTop + 2} className="kids-twinkle">✨</text>
                <text x={v.right + 1} y={visorTop} className="kids-twinkle">⭐</text>
                <text x={v.left - 8} y={visorBottom + 8} className="kids-twinkle">💫</text>
                <text x={v.right + 3} y={visorBottom + 6} className="kids-twinkle">✨</text>
              </g>
            </>
          )}

          {/* THINKING — speech bubble with ? */}
          {state === 'thinking' && (
            <g className="think-bubble" transform={`translate(${v.right + 2} ${visorTop - 4})`}>
              <circle r="5" fill="#fff" stroke="#1f2a30" strokeWidth="0.8" />
              <text x="0" y="2" textAnchor="middle" fontSize="6" fontWeight="800" fill="#1f2a30">?</text>
              <circle cx="-3" cy="5" r="1.4" fill="#fff" stroke="#1f2a30" strokeWidth="0.6" />
              <circle cx="-5" cy="8" r="0.9" fill="#fff" stroke="#1f2a30" strokeWidth="0.6" />
            </g>
          )}

          {/* Idle / listening: the source image already shows smiling eyes —
              we don't overlay anything, so the photo's natural face shows
              through. (Blink-via-overlay was attempted earlier but it had
              the inverse effect: covering the eyes 92% of the time.) */}
        </svg>
      </div>
    </div>
  )
}

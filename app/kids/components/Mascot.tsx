'use client'

import type { CSSProperties } from 'react'

export type MascotState = 'idle' | 'listening' | 'thinking' | 'talking' | 'cheering'

interface MascotProps {
  state?: MascotState
  size?: number
  style?: CSSProperties
  pupilTarget?: { x: number; y: number } | null
}

/**
 * Kodey — the Little KODE Dev mascot.
 * Chibi robot in white + teal/green with a glowing visor face and a
 * "KODE DEV" chest badge.
 *
 * Animation hooks (driven by classes in kids.css):
 *   #body, #left-eye, #right-eye, #pupils, #mouth, #left-arm, #right-arm
 */
export function Mascot({ state = 'idle', size = 140, style, pupilTarget = null }: MascotProps) {
  const pupilDx = pupilTarget ? Math.max(-3, Math.min(3, pupilTarget.x * 3)) : 0
  const pupilDy = pupilTarget ? Math.max(-2, Math.min(2, pupilTarget.y * 2)) : 0

  return (
    <div
      className={`mascot mascot-${state}`}
      style={{ width: size, height: size, position: 'relative', ...style }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 240"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="kodey-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#eef3f6" />
            <stop offset="100%" stopColor="#c4ced4" />
          </linearGradient>
          <linearGradient id="kodey-visor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1014" />
            <stop offset="100%" stopColor="#1a262e" />
          </linearGradient>
          <linearGradient id="kodey-belly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1014" />
            <stop offset="100%" stopColor="#19232a" />
          </linearGradient>
          <radialGradient id="kodey-cheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2eebc0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#2eebc0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="kodey-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6bffd4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2eebc0" stopOpacity="0" />
          </radialGradient>
          <filter id="kodey-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>

        {/* shadow under feet */}
        <ellipse cx="100" cy="232" rx="58" ry="6" fill="#000" opacity="0.18" />

        {/* arms — animated when cheering */}
        <g id="left-arm">
          {/* shoulder ball */}
          <circle cx="38" cy="118" r="14" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
          <circle cx="38" cy="118" r="5" fill="#1f2a30" />
          {/* upper arm */}
          <rect x="30" y="128" width="16" height="22" rx="6" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
          {/* elbow band */}
          <rect x="28" y="146" width="20" height="6" rx="3" fill="#1fc97a" />
          {/* forearm (white with green knuckles) */}
          <rect x="30" y="152" width="16" height="22" rx="6" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
          <circle cx="38" cy="180" r="6" fill="#1fc97a" stroke="#1f2a30" strokeWidth="2" />
        </g>
        <g id="right-arm">
          <circle cx="162" cy="118" r="14" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
          <circle cx="162" cy="118" r="5" fill="#1f2a30" />
          <rect x="154" y="128" width="16" height="22" rx="6" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
          <rect x="152" y="146" width="20" height="6" rx="3" fill="#1fc97a" />
          <rect x="154" y="152" width="16" height="22" rx="6" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
          <circle cx="162" cy="180" r="6" fill="#1fc97a" stroke="#1f2a30" strokeWidth="2" />
        </g>

        {/* legs (drawn behind body) */}
        <g>
          <rect x="68" y="190" width="22" height="32" rx="6" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
          <circle cx="79" cy="200" r="7" fill="#1fc97a" stroke="#1f2a30" strokeWidth="2" />
          <rect x="62" y="218" width="34" height="14" rx="4" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
          <rect x="62" y="226" width="34" height="6" fill="#2eebc0" />

          <rect x="110" y="190" width="22" height="32" rx="6" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
          <circle cx="121" cy="200" r="7" fill="#1fc97a" stroke="#1f2a30" strokeWidth="2" />
          <rect x="104" y="218" width="34" height="14" rx="4" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
          <rect x="104" y="226" width="34" height="6" fill="#2eebc0" />
        </g>

        {/* === BODY (head + torso) — bobs/hops === */}
        <g id="body">

          {/* === HEAD === */}
          {/* helmet — rounded dome */}
          <path
            d="M40 56
               Q40 14 100 14
               Q160 14 160 56
               L160 88
               Q160 100 148 100
               L52 100
               Q40 100 40 88 Z"
            fill="url(#kodey-body)"
            stroke="#1f2a30"
            strokeWidth="3"
          />
          {/* helmet panel seams */}
          <path d="M70 18 Q70 40 60 56" stroke="#bcc7cd" strokeWidth="1.5" fill="none" opacity="0.9" />
          <path d="M130 18 Q130 40 140 56" stroke="#bcc7cd" strokeWidth="1.5" fill="none" opacity="0.9" />
          <path d="M100 14 V 32" stroke="#bcc7cd" strokeWidth="1.5" fill="none" opacity="0.9" />
          {/* helmet brow accent (green) */}
          <path d="M58 38 Q58 26 76 22 L 124 22 Q142 26 142 38 L 134 42 L 66 42 Z"
                fill="#2eebc0" opacity="0.9" stroke="#1f2a30" strokeWidth="2" strokeLinejoin="round" />

          {/* antennas */}
          <rect x="50" y="6" width="6" height="22" rx="3" fill="#2eebc0" stroke="#1f2a30" strokeWidth="1.5" />
          <circle cx="53" cy="4" r="3" fill="#6bffd4" />
          <rect x="144" y="6" width="6" height="22" rx="3" fill="#2eebc0" stroke="#1f2a30" strokeWidth="1.5" />
          <circle cx="147" cy="4" r="3" fill="#6bffd4" />

          {/* visor (face screen) */}
          <ellipse cx="100" cy="62" rx="46" ry="36" fill="url(#kodey-visor)" stroke="#1f2a30" strokeWidth="3" />
          <ellipse cx="100" cy="50" rx="38" ry="14" fill="#ffffff" opacity="0.05" />

          {/* cheek glow inside visor */}
          <circle cx="68"  cy="74" r="10" fill="url(#kodey-cheek)" />
          <circle cx="132" cy="74" r="10" fill="url(#kodey-cheek)" />

          {/* eyes — glowing teal arcs (smile-up shape) */}
          <g id="left-eye">
            <path
              d="M70 64 Q82 50 94 64"
              stroke="#6bffd4"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              filter="url(#kodey-glow-filter)"
              opacity="0.6"
            />
            <path
              d="M70 64 Q82 50 94 64"
              stroke="#2eebc0"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
          <g id="right-eye">
            <path
              d="M106 64 Q118 50 130 64"
              stroke="#6bffd4"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              filter="url(#kodey-glow-filter)"
              opacity="0.6"
            />
            <path
              d="M106 64 Q118 50 130 64"
              stroke="#2eebc0"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
          {/* pupils — tiny glints that can shift in listening state */}
          <g id="pupils" style={{ transform: `translate(${pupilDx}px, ${pupilDy}px)` }}>
            <circle cx="82" cy="58" r="1.5" fill="#fff" opacity="0.9" />
            <circle cx="118" cy="58" r="1.5" fill="#fff" opacity="0.9" />
          </g>

          {/* mouth — glowing teal smile inside the visor */}
          <g id="mouth">
            {state === 'cheering' ? (
              <>
                <path d="M84 80 Q100 100 116 80" stroke="#6bffd4" strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#kodey-glow-filter)" opacity="0.7" />
                <path d="M84 80 Q100 100 116 80" stroke="#2eebc0" strokeWidth="4" strokeLinecap="round" fill="none" />
              </>
            ) : state === 'talking' ? (
              <>
                <ellipse cx="100" cy="84" rx="9" ry="6" fill="#2eebc0" opacity="0.55" filter="url(#kodey-glow-filter)" />
                <ellipse cx="100" cy="84" rx="7" ry="4.5" fill="#6bffd4" />
              </>
            ) : (
              <>
                <path d="M88 82 Q100 92 112 82" stroke="#6bffd4" strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#kodey-glow-filter)" opacity="0.6" />
                <path d="M88 82 Q100 92 112 82" stroke="#2eebc0" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </>
            )}
          </g>

          {/* === EAR-CUPS (headphone style) === */}
          <g>
            {/* left */}
            <ellipse cx="32" cy="64" rx="10" ry="14" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
            <ellipse cx="32" cy="64" rx="6" ry="10" fill="#0a1014" />
            <circle cx="32" cy="64" r="4" fill="#2eebc0" />
            <circle cx="32" cy="64" r="2" fill="#6bffd4" />
            {/* right */}
            <ellipse cx="168" cy="64" rx="10" ry="14" fill="url(#kodey-body)" stroke="#1f2a30" strokeWidth="2.5" />
            <ellipse cx="168" cy="64" rx="6" ry="10" fill="#0a1014" />
            <circle cx="168" cy="64" r="4" fill="#2eebc0" />
            <circle cx="168" cy="64" r="2" fill="#6bffd4" />
          </g>

          {/* === NECK === */}
          <rect x="88" y="100" width="24" height="12" rx="3" fill="#1f2a30" />
          <rect x="92" y="100" width="16" height="4" fill="#2eebc0" />

          {/* === TORSO === */}
          <path
            d="M50 116
               Q50 108 62 108
               L138 108
               Q150 108 150 116
               L150 188
               Q150 198 138 198
               L62 198
               Q50 198 50 188 Z"
            fill="url(#kodey-body)"
            stroke="#1f2a30"
            strokeWidth="3"
          />
          {/* shoulder green caps */}
          <path d="M50 118 Q56 110 70 110 L70 130 L50 130 Z" fill="#1fc97a" stroke="#1f2a30" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M150 118 Q144 110 130 110 L130 130 L150 130 Z" fill="#1fc97a" stroke="#1f2a30" strokeWidth="2.5" strokeLinejoin="round" />

          {/* chest dark plate with KODE DEV badge */}
          <rect x="68" y="128" width="64" height="38" rx="10" fill="url(#kodey-belly)" stroke="#1f2a30" strokeWidth="2.5" />
          {/* glow behind text */}
          <rect x="72" y="132" width="56" height="30" rx="8" fill="#0a3d2a" opacity="0.6" />
          <text
            x="100"
            y="146"
            textAnchor="middle"
            fontFamily="'Space Grotesk', 'Inter', sans-serif"
            fontWeight="900"
            fontSize="11"
            fill="#2eebc0"
            filter="url(#kodey-glow-filter)"
            opacity="0.7"
          >KODE</text>
          <text
            x="100"
            y="146"
            textAnchor="middle"
            fontFamily="'Space Grotesk', 'Inter', sans-serif"
            fontWeight="900"
            fontSize="11"
            fill="#6bffd4"
          >KODE</text>
          <text
            x="100"
            y="158"
            textAnchor="middle"
            fontFamily="'Space Grotesk', 'Inter', sans-serif"
            fontWeight="900"
            fontSize="11"
            fill="#2eebc0"
            filter="url(#kodey-glow-filter)"
            opacity="0.7"
          >DEV</text>
          <text
            x="100"
            y="158"
            textAnchor="middle"
            fontFamily="'Space Grotesk', 'Inter', sans-serif"
            fontWeight="900"
            fontSize="11"
            fill="#6bffd4"
          >DEV</text>

          {/* belt accents */}
          <rect x="68" y="172" width="64" height="6" rx="2" fill="#2eebc0" />
          <rect x="86" y="178" width="28" height="10" rx="3" fill="#0a1014" stroke="#1f2a30" strokeWidth="2" />
          <rect x="92" y="180" width="16" height="6" fill="#2eebc0" />
        </g>

        {/* thinking bubble */}
        {state === 'thinking' && (
          <g className="think-bubble">
            <circle cx="172" cy="38" r="14" fill="#fff" stroke="#1f2a30" strokeWidth="3" />
            <text x="172" y="44" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1f2a30">?</text>
            <circle cx="160" cy="52" r="4" fill="#fff" stroke="#1f2a30" strokeWidth="2" />
            <circle cx="152" cy="60" r="2.5" fill="#fff" stroke="#1f2a30" strokeWidth="2" />
          </g>
        )}

        {/* sparkles when cheering */}
        {state === 'cheering' && (
          <g>
            <text x="20" y="40" fontSize="26" className="kids-twinkle">✨</text>
            <text x="170" y="38" fontSize="26" className="kids-twinkle">⭐</text>
            <text x="14" y="120" fontSize="22" className="kids-twinkle">💫</text>
            <text x="178" y="124" fontSize="22" className="kids-twinkle">✨</text>
          </g>
        )}
      </svg>
    </div>
  )
}

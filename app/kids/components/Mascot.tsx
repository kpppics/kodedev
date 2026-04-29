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
 * Louie — friendly placeholder mascot.
 * SVG groups (`#body`, `#left-eye`, `#right-eye`, `#pupils`, `#mouth`,
 * `#left-arm`, `#right-arm`) are animated via classes in kids.css.
 *
 * NOTE: This is a placeholder design. When the user supplies their mascot
 * artwork (drop at /public/mascot/source.png or .svg), trace it here and
 * keep the same group IDs so animations continue to work.
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
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="louie-body" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffd6f5" />
            <stop offset="60%" stopColor="#ff9bd8" />
            <stop offset="100%" stopColor="#e771b8" />
          </radialGradient>
          <radialGradient id="louie-belly" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff5fb" />
            <stop offset="100%" stopColor="#ffd6f5" />
          </radialGradient>
          <radialGradient id="louie-cheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff7eb6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff7eb6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* feet */}
        <ellipse cx="78" cy="178" rx="14" ry="6" fill="#2b2640" opacity="0.18" />
        <ellipse cx="122" cy="178" rx="14" ry="6" fill="#2b2640" opacity="0.18" />

        {/* arms (animated when cheering) */}
        <g id="left-arm">
          <path d="M48 110 Q34 118 30 138" stroke="#2b2640" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="30" cy="140" r="9" fill="url(#louie-body)" stroke="#2b2640" strokeWidth="4" />
        </g>
        <g id="right-arm">
          <path d="M152 110 Q166 118 170 138" stroke="#2b2640" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="170" cy="140" r="9" fill="url(#louie-body)" stroke="#2b2640" strokeWidth="4" />
        </g>

        {/* body group — bobs/hops */}
        <g id="body">
          {/* main body */}
          <path
            d="M100 22
               C 48 22 32 64 32 100
               C 32 144 60 174 100 174
               C 140 174 168 144 168 100
               C 168 64 152 22 100 22 Z"
            fill="url(#louie-body)"
            stroke="#2b2640"
            strokeWidth="5"
          />

          {/* belly */}
          <ellipse cx="100" cy="118" rx="38" ry="34" fill="url(#louie-belly)" stroke="#2b2640" strokeWidth="3" />

          {/* ear tufts */}
          <path d="M58 36 Q52 18 70 22 Q66 32 70 44 Z" fill="url(#louie-body)" stroke="#2b2640" strokeWidth="4" strokeLinejoin="round" />
          <path d="M142 36 Q148 18 130 22 Q134 32 130 44 Z" fill="url(#louie-body)" stroke="#2b2640" strokeWidth="4" strokeLinejoin="round" />

          {/* cheeks */}
          <circle cx="60" cy="98" r="14" fill="url(#louie-cheek)" />
          <circle cx="140" cy="98" r="14" fill="url(#louie-cheek)" />

          {/* eyes */}
          <g id="left-eye">
            <ellipse cx="78" cy="86" rx="13" ry="15" fill="#fff" stroke="#2b2640" strokeWidth="4" />
          </g>
          <g id="right-eye">
            <ellipse cx="122" cy="86" rx="13" ry="15" fill="#fff" stroke="#2b2640" strokeWidth="4" />
          </g>
          <g id="pupils" style={{ transform: `translate(${pupilDx}px, ${pupilDy}px)` }}>
            <circle cx="78" cy="88" r="6" fill="#2b2640" />
            <circle cx="122" cy="88" r="6" fill="#2b2640" />
            <circle cx="80" cy="85" r="2" fill="#fff" />
            <circle cx="124" cy="85" r="2" fill="#fff" />
          </g>

          {/* mouth — morphs in talking state via CSS scale */}
          <g id="mouth">
            {state === 'cheering' ? (
              <path
                d="M82 122 Q100 144 118 122 Q108 130 100 130 Q92 130 82 122 Z"
                fill="#7a1f4b"
                stroke="#2b2640"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            ) : state === 'talking' ? (
              <ellipse cx="100" cy="124" rx="11" ry="8" fill="#7a1f4b" stroke="#2b2640" strokeWidth="3" />
            ) : (
              <path
                d="M88 122 Q100 132 112 122"
                stroke="#2b2640"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
            )}
          </g>
        </g>

        {/* thinking bubble */}
        {state === 'thinking' && (
          <g className="think-bubble">
            <circle cx="158" cy="42" r="14" fill="#fff" stroke="#2b2640" strokeWidth="3" />
            <text x="158" y="48" textAnchor="middle" fontSize="18" fontWeight="800" fill="#2b2640">?</text>
            <circle cx="148" cy="56" r="4" fill="#fff" stroke="#2b2640" strokeWidth="2" />
            <circle cx="142" cy="64" r="2.5" fill="#fff" stroke="#2b2640" strokeWidth="2" />
          </g>
        )}

        {/* sparkles when cheering */}
        {state === 'cheering' && (
          <g>
            <text x="36" y="40" fontSize="26" className="kids-twinkle">✨</text>
            <text x="158" y="36" fontSize="26" className="kids-twinkle">⭐</text>
            <text x="20" y="100" fontSize="22" className="kids-twinkle">💫</text>
          </g>
        )}
      </svg>
    </div>
  )
}

'use client'

import type { Animal, Place, Style } from '../lib/sceneTable'

interface SceneSVGProps {
  animal: Animal
  place: Place
  style: Style
  width?: number | string
  height?: number | string
  /** Pass true to apply a paint-sweep reveal animation. */
  reveal?: boolean
}

export function SceneSVG({ animal, place, style, width = '100%', height = 280, reveal = false }: SceneSVGProps) {
  const filterId = `style-${style}`
  return (
    <div
      className={`relative overflow-hidden kids-card ${reveal ? 'kids-paint-sweep' : ''}`}
      style={{ width, height, background: '#fff', padding: 0 }}
    >
      <svg
        viewBox="0 0 400 300"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className={style === 'rainbow' ? 'kids-rainbow' : undefined}
        style={{ display: 'block' }}
      >
        <defs>
          <PlaceDefs place={place} />
          <StyleDefs style={style} />
        </defs>

        <PlaceLayer place={place} />

        <g filter={style === 'pencil' ? `url(#${filterId})` : undefined}>
          <AnimalLayer animal={animal} />
        </g>

        {style === 'glitter' && <GlitterOverlay />}
      </svg>
    </div>
  )
}

function PlaceDefs({ place }: { place: Place }) {
  if (place === 'castle') {
    return (
      <linearGradient id="bg-castle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a3d8ff" />
        <stop offset="100%" stopColor="#ffd6f5" />
      </linearGradient>
    )
  }
  if (place === 'sea') {
    return (
      <>
        <linearGradient id="bg-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4cc9f0" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </>
    )
  }
  return (
    <radialGradient id="bg-space" cx="50%" cy="50%" r="80%">
      <stop offset="0%" stopColor="#3b1f7c" />
      <stop offset="100%" stopColor="#0b0925" />
    </radialGradient>
  )
}

function StyleDefs({ style }: { style: Style }) {
  if (style === 'pencil') {
    return (
      <filter id="style-pencil">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
        <feDisplacementMap in="SourceGraphic" scale="3" />
      </filter>
    )
  }
  return null
}

function PlaceLayer({ place }: { place: Place }) {
  if (place === 'castle') {
    return (
      <g>
        <rect x="0" y="0" width="400" height="300" fill="url(#bg-castle)" />
        {/* hills */}
        <ellipse cx="80" cy="280" rx="160" ry="50" fill="#7bd389" />
        <ellipse cx="320" cy="280" rx="180" ry="60" fill="#5bb377" />
        {/* castle */}
        <g transform="translate(160, 130)">
          <rect x="0" y="40" width="80" height="100" fill="#cbb6f4" stroke="#2b2640" strokeWidth="3" />
          <rect x="-12" y="20" width="24" height="120" fill="#b89ce0" stroke="#2b2640" strokeWidth="3" />
          <rect x="68" y="20" width="24" height="120" fill="#b89ce0" stroke="#2b2640" strokeWidth="3" />
          <polygon points="-14,20 0,0 14,20" fill="#ff7eb6" stroke="#2b2640" strokeWidth="3" />
          <polygon points="66,20 80,0 94,20" fill="#ff7eb6" stroke="#2b2640" strokeWidth="3" />
          <rect x="32" y="100" width="16" height="40" fill="#2b2640" rx="6" />
          <circle cx="40" cy="70" r="6" fill="#fff8e7" stroke="#2b2640" strokeWidth="2" />
        </g>
        {/* sun */}
        <circle cx="60" cy="60" r="30" fill="#ffd166" stroke="#2b2640" strokeWidth="3" />
      </g>
    )
  }
  if (place === 'sea') {
    return (
      <g>
        <rect x="0" y="0" width="400" height="300" fill="url(#bg-sea)" />
        {/* sea floor */}
        <path d="M0 270 Q100 240 200 260 T400 250 V300 H0 Z" fill="#f4d35e" stroke="#2b2640" strokeWidth="3" />
        {/* coral */}
        <g transform="translate(60, 230)">
          <path d="M0 30 Q-10 0 0 -10 Q10 0 0 30" fill="#ff7eb6" stroke="#2b2640" strokeWidth="2.5" />
        </g>
        <g transform="translate(330, 240)">
          <path d="M0 25 Q12 -8 24 25 M12 -5 V 25" stroke="#ff9f43" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
        {/* bubbles */}
        <circle cx="320" cy="120" r="8" fill="#fff" opacity="0.6" />
        <circle cx="350" cy="80" r="5" fill="#fff" opacity="0.5" />
        <circle cx="60"  cy="100" r="6" fill="#fff" opacity="0.5" />
      </g>
    )
  }
  // space
  return (
    <g>
      <rect x="0" y="0" width="400" height="300" fill="url(#bg-space)" />
      {/* stars */}
      {Array.from({ length: 22 }).map((_, i) => {
        const x = (i * 53) % 400
        const y = (i * 71) % 300
        return <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 2 : 1} fill="white" opacity={0.6 + (i % 3) * 0.1} />
      })}
      {/* moon */}
      <g transform="translate(330, 60)">
        <circle r="28" fill="#fff8e7" stroke="#2b2640" strokeWidth="3" />
        <circle cx="-8" cy="-6" r="4" fill="#d8c89e" />
        <circle cx="6" cy="8" r="3" fill="#d8c89e" />
      </g>
      {/* planet */}
      <g transform="translate(80, 230)">
        <circle r="34" fill="#ff9f43" stroke="#2b2640" strokeWidth="3" />
        <ellipse cx="0" cy="0" rx="50" ry="10" fill="none" stroke="#fff" strokeWidth="3" opacity="0.7" />
      </g>
    </g>
  )
}

function AnimalLayer({ animal }: { animal: Animal }) {
  if (animal === 'fox') {
    return (
      <g transform="translate(200, 180)">
        {/* tail */}
        <path d="M-50 0 Q-90 -20 -80 -50 Q-70 -30 -45 -10 Z" fill="#ff8c42" stroke="#2b2640" strokeWidth="3" strokeLinejoin="round" />
        <path d="M-78 -45 Q-86 -55 -80 -50" fill="#fff" />
        {/* body */}
        <ellipse cx="0" cy="0" rx="48" ry="34" fill="#ff8c42" stroke="#2b2640" strokeWidth="3.5" />
        {/* head */}
        <g transform="translate(40, -22)">
          <path d="M-30 0 Q-30 -30 0 -30 Q30 -30 30 0 L20 22 Q0 30 -20 22 Z" fill="#ff8c42" stroke="#2b2640" strokeWidth="3.5" strokeLinejoin="round" />
          <polygon points="-25,-25 -10,-12 -22,-2" fill="#ff8c42" stroke="#2b2640" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="25,-25 10,-12 22,-2" fill="#ff8c42" stroke="#2b2640" strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="0" cy="0" rx="22" ry="14" fill="#fff8e7" />
          <circle cx="-10" cy="-3" r="3.5" fill="#2b2640" />
          <circle cx="10"  cy="-3" r="3.5" fill="#2b2640" />
          <ellipse cx="0" cy="14" rx="5" ry="3.5" fill="#2b2640" />
          <path d="M-6 16 Q0 22 6 16" stroke="#2b2640" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
        {/* legs */}
        <rect x="-30" y="20" width="10" height="22" rx="4" fill="#2b2640" />
        <rect x="10"  y="20" width="10" height="22" rx="4" fill="#2b2640" />
      </g>
    )
  }
  if (animal === 'turtle') {
    return (
      <g transform="translate(200, 200)">
        {/* shell */}
        <ellipse cx="0" cy="0" rx="60" ry="42" fill="#6ee7b7" stroke="#2b2640" strokeWidth="3.5" />
        <path d="M-30 -10 L-10 -25 L10 -25 L30 -10 L20 15 L-20 15 Z" fill="#10b981" stroke="#2b2640" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M-10 -25 L0 -10 L10 -25" stroke="#2b2640" strokeWidth="2" fill="none" />
        {/* head */}
        <g transform="translate(58, -8)">
          <ellipse cx="0" cy="0" rx="18" ry="14" fill="#a7f3d0" stroke="#2b2640" strokeWidth="3" />
          <circle cx="2" cy="-3" r="3" fill="#2b2640" />
          <path d="M-5 4 Q0 7 5 4" stroke="#2b2640" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
        {/* legs */}
        <ellipse cx="-40" cy="30" rx="14" ry="8" fill="#a7f3d0" stroke="#2b2640" strokeWidth="3" />
        <ellipse cx="40"  cy="30" rx="14" ry="8" fill="#a7f3d0" stroke="#2b2640" strokeWidth="3" />
        <ellipse cx="-50" cy="-22" rx="10" ry="6" fill="#a7f3d0" stroke="#2b2640" strokeWidth="3" />
      </g>
    )
  }
  // octopus
  return (
    <g transform="translate(200, 170)">
      {/* tentacles */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = -75 + i * 30
        const x1 = Math.cos((angle * Math.PI) / 180) * 0
        const y1 = 30
        const dx = Math.cos((angle * Math.PI) / 180) * 60
        const dy = 80 + (i % 2) * 10
        return (
          <path
            key={i}
            d={`M${x1} ${y1} Q${dx * 0.5} ${y1 + 30} ${dx} ${dy}`}
            stroke="#b388ff"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
        )
      })}
      {/* head */}
      <ellipse cx="0" cy="0" rx="60" ry="46" fill="#d0b3ff" stroke="#2b2640" strokeWidth="3.5" />
      <ellipse cx="-18" cy="-6" rx="9" ry="11" fill="#fff" stroke="#2b2640" strokeWidth="2" />
      <ellipse cx="18"  cy="-6" rx="9" ry="11" fill="#fff" stroke="#2b2640" strokeWidth="2" />
      <circle  cx="-16" cy="-4" r="4" fill="#2b2640" />
      <circle  cx="20"  cy="-4" r="4" fill="#2b2640" />
      <path    d="M-12 18 Q0 28 12 18" stroke="#2b2640" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="-30" cy="14" r="6" fill="#ff7eb6" opacity="0.6" />
      <circle cx="30"  cy="14" r="6" fill="#ff7eb6" opacity="0.6" />
    </g>
  )
}

function GlitterOverlay() {
  const sparkles = Array.from({ length: 14 }).map((_, i) => ({
    x: (i * 47 + 20) % 400,
    y: (i * 67 + 40) % 280,
    r: (i % 3) + 2,
    delay: (i % 5) * 0.2,
  }))
  return (
    <g>
      {sparkles.map((s, i) => (
        <g key={i} className="kids-twinkle" style={{ animationDelay: `${s.delay}s`, transformOrigin: `${s.x}px ${s.y}px`, transformBox: 'view-box' }}>
          <circle cx={s.x} cy={s.y} r={s.r} fill="#fff" />
          <circle cx={s.x} cy={s.y} r={s.r * 1.8} fill="#fff" opacity="0.4" />
        </g>
      ))}
    </g>
  )
}

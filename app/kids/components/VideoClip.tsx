'use client'

import type { VideoActor, VideoAction, VideoScene } from '../lib/videoTable'

interface VideoClipProps {
  actor: VideoActor
  scene: VideoScene
  action: VideoAction
}

export function VideoClip({ actor, scene, action }: VideoClipProps) {
  return (
    <div
      className={`kids-card relative overflow-hidden clip-${action}`}
      style={{ width: '100%', height: 280, padding: 0, background: '#fff' }}
    >
      <svg
        viewBox="0 0 400 280"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <SceneBackground scene={scene} />
        <g className="clip-actor" transform="translate(200, 170)">
          <Actor actor={actor} />
        </g>
        {action === 'sleep' && (
          <g className="clip-zzz" transform="translate(240, 130)">
            <text fontSize="32" fontWeight="800" fill="#2b2640">z</text>
            <text x="14" y="-20" fontSize="22" fontWeight="800" fill="#2b2640">z</text>
            <text x="26" y="-36" fontSize="16" fontWeight="800" fill="#2b2640">z</text>
          </g>
        )}
      </svg>
    </div>
  )
}

function SceneBackground({ scene }: { scene: VideoScene }) {
  if (scene === 'beach') {
    return (
      <g>
        <defs>
          <linearGradient id="bg-beach" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a3d8ff" />
            <stop offset="60%" stopColor="#fff8e7" />
            <stop offset="100%" stopColor="#f4d35e" />
          </linearGradient>
        </defs>
        <rect width="400" height="280" fill="url(#bg-beach)" />
        <circle cx="80" cy="60" r="28" fill="#ffd166" stroke="#2b2640" strokeWidth="3" />
        <path d="M0 200 Q100 180 200 200 T400 200 V280 H0 Z" fill="#4cc9f0" opacity="0.7" />
        <path d="M0 230 Q100 210 200 230 T400 230 V280 H0 Z" fill="#f4d35e" />
        {/* palm */}
        <g transform="translate(330, 200)">
          <rect x="-5" y="-60" width="10" height="60" fill="#7c5e3c" stroke="#2b2640" strokeWidth="2" />
          <path d="M0 -60 Q-30 -75 -50 -60 Q-25 -65 0 -55 Z" fill="#10b981" stroke="#2b2640" strokeWidth="2" />
          <path d="M0 -60 Q30 -75 50 -60 Q25 -65 0 -55 Z" fill="#10b981" stroke="#2b2640" strokeWidth="2" />
          <path d="M0 -60 Q-10 -90 5 -100 Q15 -80 5 -55 Z" fill="#10b981" stroke="#2b2640" strokeWidth="2" />
        </g>
      </g>
    )
  }
  if (scene === 'jungle') {
    return (
      <g>
        <defs>
          <linearGradient id="bg-jungle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <rect width="400" height="280" fill="url(#bg-jungle)" />
        <ellipse cx="200" cy="270" rx="220" ry="40" fill="#065f46" />
        {/* leaves */}
        <g className="leaf-sway" style={{ transformOrigin: '60px 60px', transformBox: 'fill-box' }}>
          <path d="M30 90 Q60 30 90 90 Q60 60 30 90 Z" fill="#10b981" stroke="#2b2640" strokeWidth="2.5" />
        </g>
        <g className="leaf-sway" style={{ animationDelay: '0.6s', transformOrigin: '340px 50px', transformBox: 'fill-box' }}>
          <path d="M310 80 Q340 20 370 80 Q340 50 310 80 Z" fill="#10b981" stroke="#2b2640" strokeWidth="2.5" />
        </g>
        <circle cx="60" cy="40" r="6" fill="#fff" opacity="0.6" />
      </g>
    )
  }
  // space
  return (
    <g>
      <defs>
        <radialGradient id="bg-space-vid" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#3b1f7c" />
          <stop offset="100%" stopColor="#0b0925" />
        </radialGradient>
      </defs>
      <rect width="400" height="280" fill="url(#bg-space-vid)" />
      {Array.from({ length: 24 }).map((_, i) => {
        const x = (i * 53) % 400
        const y = (i * 41) % 260
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 4 === 0 ? 2.5 : 1.5}
            fill="white"
            className="star-twinkle"
            style={{ animationDelay: `${(i % 5) * 0.2}s` }}
          />
        )
      })}
      <g transform="translate(330, 60)">
        <circle r="22" fill="#fff8e7" stroke="#2b2640" strokeWidth="3" />
        <circle cx="-6" cy="-4" r="3" fill="#d8c89e" />
      </g>
    </g>
  )
}

function Actor({ actor }: { actor: VideoActor }) {
  if (actor === 'cat') {
    return (
      <g>
        <ellipse cx="0" cy="0" rx="40" ry="32" fill="#ffd166" stroke="#2b2640" strokeWidth="3.5" />
        <polygon points="-30,-25 -18,-10 -30,0" fill="#ffd166" stroke="#2b2640" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="30,-25 18,-10 30,0" fill="#ffd166" stroke="#2b2640" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="-12" cy="-4" r="4" fill="#2b2640" />
        <circle cx="12"  cy="-4" r="4" fill="#2b2640" />
        <ellipse cx="0" cy="8" rx="4" ry="3" fill="#2b2640" />
        <path d="M-8 12 Q0 18 8 12" stroke="#2b2640" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M-30 6 H -50 M-30 10 H-50 M30 6 H50 M30 10 H50" stroke="#2b2640" strokeWidth="2" />
      </g>
    )
  }
  if (actor === 'unicorn') {
    return (
      <g>
        <ellipse cx="0" cy="10" rx="44" ry="28" fill="#ffd6f5" stroke="#2b2640" strokeWidth="3.5" />
        <ellipse cx="-30" cy="-12" rx="20" ry="22" fill="#ffd6f5" stroke="#2b2640" strokeWidth="3.5" />
        <polygon points="-32,-32 -28,-50 -24,-32" fill="#ffd166" stroke="#2b2640" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="-22" cy="-12" r="3" fill="#2b2640" />
        <path d="M30 -18 Q60 -8 50 18 Q40 0 28 -2 Z" fill="#b388ff" stroke="#2b2640" strokeWidth="3" strokeLinejoin="round" />
        <rect x="-20" y="38" width="6" height="14" fill="#2b2640" />
        <rect x="14"  y="38" width="6" height="14" fill="#2b2640" />
      </g>
    )
  }
  // robot
  return (
    <g>
      <rect x="-30" y="-10" width="60" height="50" rx="10" fill="#cdeeff" stroke="#2b2640" strokeWidth="3.5" />
      <rect x="-22" y="-40" width="44" height="34" rx="8" fill="#cdeeff" stroke="#2b2640" strokeWidth="3.5" />
      <circle cx="-8" cy="-22" r="4" fill="#2b2640" />
      <circle cx="8"  cy="-22" r="4" fill="#2b2640" />
      <rect x="-10" y="-12" width="20" height="3" fill="#2b2640" />
      <rect x="-4" y="-50" width="8" height="10" fill="#2b2640" />
      <circle cx="0" cy="-54" r="5" fill="#ff7eb6" stroke="#2b2640" strokeWidth="2.5" />
      <rect x="-30" y="40" width="12" height="14" fill="#2b2640" />
      <rect x="18"  y="40" width="12" height="14" fill="#2b2640" />
    </g>
  )
}

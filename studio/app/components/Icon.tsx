import type { ReactElement, SVGProps } from 'react'

type Name =
  | 'spark' | 'compass' | 'radio' | 'eye' | 'brain' | 'quote'
  | 'chat' | 'code' | 'doc' | 'phone' | 'image' | 'wave'
  | 'check' | 'arrow' | 'logo' | 'bolt' | 'shield' | 'globe'
  | 'cpu' | 'layers' | 'graph' | 'lock'

const PATHS: Record<Name, ReactElement> = {
  spark: (
    <path d="M12 2l1.8 5.4L19 9.2 13.8 11 12 16l-1.8-5L5 9.2l5.2-1.8L12 2zm6 11l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 8.5L13 13l-4.5 2.5L11 11l4.5-2.5z" fill="currentColor" />
    </>
  ),
  radio: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M7.8 7.8a6 6 0 000 8.4M16.2 7.8a6 6 0 010 8.4M5 5a9 9 0 000 14M19 5a9 9 0 010 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  brain: (
    <path d="M8 4.5A3.5 3.5 0 005 8v.5A3 3 0 003 11.4a3 3 0 002 2.83V16a3 3 0 003 3 3 3 0 003-3V5.5A1.5 1.5 0 0011.5 4 1.5 1.5 0 0010 5.5 3.5 3.5 0 008 4.5zm8 0A3.5 3.5 0 0119 8v.5a3 3 0 012 2.9 3 3 0 01-2 2.83V16a3 3 0 01-3 3 3 3 0 01-3-3V5.5A1.5 1.5 0 0114.5 4 1.5 1.5 0 0116 5.5 3.5 3.5 0 0116 4.5z" fill="none" stroke="currentColor" strokeWidth="1.4" />
  ),
  quote: (
    <path d="M7 7h4v4H8c0 2 1 3 3 3v3c-3 0-5-2-5-5V7zm9 0h4v4h-3c0 2 1 3 3 3v3c-3 0-5-2-5-5V7z" />
  ),
  chat: (
    <path d="M4 5h16a2 2 0 012 2v8a2 2 0 01-2 2h-8l-5 4v-4H4a2 2 0 01-2-2V7a2 2 0 012-2z" fill="none" stroke="currentColor" strokeWidth="1.6" />
  ),
  code: (
    <path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  doc: (
    <path d="M6 3h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2zm9 0v5h5M8 13h8M8 17h8M8 9h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
  ),
  phone: (
    <path d="M5 3h3l2 5-2.5 1.5a12 12 0 006 6L15 13l5 2v3a2 2 0 01-2 2A15 15 0 013 5a2 2 0 012-2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  image: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="11" r="1.6" />
      <path d="M21 17l-5-5-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  wave: (
    <path d="M2 12c2 0 2-6 4-6s2 12 4 12 2-12 4-12 2 6 4 6 2-3 4-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  ),
  check: (
    <path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrow: (
    <path d="M5 12h14m-6-6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  logo: (
    <>
      <path d="M3 17l8-12 5 7 5-3v9z" fill="currentColor" opacity=".15" />
      <path d="M3 17l8-12 5 7 5-3v9z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  bolt: (
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
  ),
  shield: (
    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9" y="9" width="6" height="6" fill="currentColor" />
      <path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  layers: (
    <path d="M12 3l9 5-9 5-9-5 9-5zm-9 9l9 5 9-5M3 16l9 5 9-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  graph: (
    <path d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
}

export default function Icon({
  name,
  size = 20,
  ...rest
}: { name: Name; size?: number } & Omit<SVGProps<SVGSVGElement>, 'children'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}

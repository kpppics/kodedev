import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thailand Sunset Beach',
}

export default function TestPage() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <video
        className="h-screen w-screen object-cover"
        poster="/testpage-thailand-sunset.png"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/testpage-thailand-sunset.mp4" type="video/mp4" />
      </video>
    </main>
  )
}

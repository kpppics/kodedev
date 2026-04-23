import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thailand Sunset Beach',
}

export default function TestPage() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <img
        src="/testpage-thailand-sunset.png"
        alt="Thailand beach at sunset with long-tail boats, an elephant, and a woman entering the sea"
        className="h-screen w-screen object-cover"
      />
    </main>
  )
}

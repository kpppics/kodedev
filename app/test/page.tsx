import Navbar from '../components/Navbar'

export default function TestPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black pt-20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">✅ Test Page</h1>
          <p className="text-lg text-gray-600">kodedev.co.uk is up and running.</p>
          <p className="text-sm text-gray-400">This page is just for testing purposes.</p>
        </div>
      </main>
    </>
  )
}

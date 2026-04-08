import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  allowedDevOrigins: ['kodedev.co.uk'],
  devIndicators: false,
}

export default nextConfig

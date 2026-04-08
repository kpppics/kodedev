import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: 'out',
  images: { unoptimized: true },
  devIndicators: false,
}

export default nextConfig

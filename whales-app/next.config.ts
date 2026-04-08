import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  devIndicators: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig

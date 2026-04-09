import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: 'out',
  images: { unoptimized: true },
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: '/polymarket-api/:path*',
        destination: 'https://gamma-api.polymarket.com/:path*',
      },
    ]
  },
}

export default nextConfig

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
      {
        source: '/polymarket-lb/:path*',
        destination: 'https://lb-api.polymarket.com/:path*',
      },
      {
        source: '/polymarket-data/:path*',
        destination: 'https://data-api.polymarket.com/:path*',
      },
    ]
  },
}

export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ebayimg.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
    ],
  },
  devIndicators: false,
  env: {
    NEXT_PUBLIC_REGION: process.env.REGION || 'uk',
    NEXT_PUBLIC_USE_MOCK: process.env.USE_MOCK || '0',
  },
}

export default nextConfig

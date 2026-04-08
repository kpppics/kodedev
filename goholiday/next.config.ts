import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Picsum is the default placeholder for demo deal images. Add real
  // provider image hosts here when you wire up live APIs.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  devIndicators: false,
}

export default nextConfig

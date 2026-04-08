import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  devIndicators: false,
  trailingSlash: true,
}

export default nextConfig

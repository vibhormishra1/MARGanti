import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [],
  reactStrictMode: true,
  experimental: {
    turbo: {
      resolveAlias: {}
    }
  }
};

export default nextConfig;

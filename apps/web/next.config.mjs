/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],
  reactStrictMode: true,
  experimental: {
    turbo: {
      resolveAlias: {}
    }
  }
};

export default nextConfig;

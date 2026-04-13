import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '500mb' } },
  typescript: { ignoreBuildErrors: true }
};

export default nextConfig;

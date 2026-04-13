import type { NextConfig } from 'next';
export default { 
  experimental: { serverActions: { bodySizeLimit: '500mb' } },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true }
};

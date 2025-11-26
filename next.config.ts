import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['byteforge-aegis-client-js'],
  output: 'standalone',
};

export default nextConfig;

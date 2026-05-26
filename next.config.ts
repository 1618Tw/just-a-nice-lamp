import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Allow phones / other devices on the LAN to use HMR when running `next dev -H 0.0.0.0`.
  allowedDevOrigins: ['192.168.1.90', '192.168.1.13'],
};

export default nextConfig;

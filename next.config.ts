import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@splinetool/react-spline'],
  // Webpack externals — matches Reown lab pattern (apps/laboratory/next.config.mjs)
  // Reown's own lab does NOT use Turbopack for builds — webpack only
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

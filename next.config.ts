import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  bundlePagesRouterDependencies: true,
  transpilePackages: [
    '@splinetool/react-spline',
    '@solana/kit',
    '@coinbase/cdp-sdk',
    '@solana-program/system',
    '@solana-program/token',
    '@solana-program/compute-budget',
    '@solana-program/stake',
  ],
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

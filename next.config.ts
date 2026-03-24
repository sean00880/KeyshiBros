import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@splinetool/react-spline'],
  // Server external packages — prevents bundling WalletConnect/Reown on server
  // Matches MEMELinked next.config.mjs serverExternalPackages (lines 320-360)
  serverExternalPackages: [
    '@walletconnect/core',
    '@walletconnect/logger',
    '@walletconnect/utils',
    '@walletconnect/universal-provider',
    '@walletconnect/sign-client',
    '@walletconnect/types',
    '@reown/appkit',
    '@reown/appkit-controllers',
    '@reown/appkit-adapter-ethers',
    '@reown/appkit-adapter-solana',
    '@reown/appkit-siwx',
    '@reown/appkit-utils',
    '@reown/appkit-wallet',
    'pino',
    'pino-pretty',
  ],
  // Webpack config — matches MEMELinked pattern for client-side aliases
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pino': false,
        'pino-pretty': false,
        'lokijs': false,
        'encoding': false,
      };
    }

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

'use client';

/**
 * AppKit Provider — WagmiAdapter + SolanaAdapter
 * Solana default chain, configured via ConstantsUtil for easy chain management.
 */

import React, { type ReactNode, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { DefaultSIWX } from '@reown/appkit-siwx';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConstantsUtil } from '@/lib/constants';

const projectId = (process.env.NEXT_PUBLIC_PROJECT_ID || '').trim();
const isClient = typeof window !== 'undefined';

const { AllNetworks, SolanaNetworks, FeaturedWalletIds } = ConstantsUtil;

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: AllNetworks,
  ssr: true,
});

const solanaAdapter = new SolanaAdapter();

const metadata = (() => {
  const origin = isClient ? window.location.origin : 'https://keyshibros.com';
  const hostname = isClient ? window.location.hostname : 'keyshibros.com';
  const domainName = hostname.replace(/^www\./, '').replace(/\.(com|org|net|io|app)$/, '');

  return {
    name: 'Keyshi Bros',
    description: 'GameFi Private Sale',
    url: origin,
    icons: ['https://keyshibros.com/icon.png'],
    redirect: {
      native: `${domainName}://wc`,
      universal: `${origin}/wc`,
    },
  };
})();

if (projectId) {
  createAppKit({
    adapters: [wagmiAdapter, solanaAdapter],
    projectId,
    networks: SolanaNetworks,        // Solana only
    defaultNetwork: SolanaNetworks[0], // Solana mainnet
    enableWallets: true,
    metadata,
    themeMode: 'dark' as const,
    siwx: new DefaultSIWX(),
    features: {
      analytics: false,
      email: false,
      socials: false,
      headless: false,
    },
    allWallets: 'SHOW',
    featuredWalletIds: FeaturedWalletIds,
  });
}

const queryClient = new QueryClient();

export function AppKitProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies?: string | null;
}) {
  useEffect(() => {
    document.cookie = `wc_return_path=${window.location.pathname};path=/;max-age=300`;
  }, []);

  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies ?? undefined,
  );

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

'use client';

/**
 * AppKit Provider — exact normie-tool pattern
 *
 * WagmiAdapter + SolanaAdapter, NO customWallets.
 * customWallets bypass WC relay and break mobile deep linking.
 * Let the WC registry handle deep linking natively via featuredWalletIds.
 */

import React, { type ReactNode, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import {
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
  solana, solanaTestnet, solanaDevnet,
} from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { DefaultSIWX } from '@reown/appkit-siwx';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const isClient = typeof window !== 'undefined';

const allNetworks = [
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
  solana, solanaTestnet, solanaDevnet,
] as [AppKitNetwork, ...AppKitNetwork[]];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: allNetworks,
  ssr: true,
});

const solanaAdapter = new SolanaAdapter();

// Metadata with redirect — matching normie-tool exactly
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
    networks: allNetworks,
    defaultNetwork: allNetworks[0],
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
    // Show ALL wallets — WC registry handles deep linking natively
    allWallets: 'SHOW',
    // Featured wallets shown at top (hex IDs from WC Explorer)
    featuredWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
      '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79', // Solflare
    ],
    // NO customWallets — they bypass WC relay and break mobile deep linking
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
  // Store current path so /wc can redirect back here after wallet approval
  useEffect(() => {
    document.cookie = `wc_return_path=${window.location.pathname};path=/;max-age=300`;
  }, []);

  // SSR hydration: restore wagmi state from cookies (matching normie-tool)
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

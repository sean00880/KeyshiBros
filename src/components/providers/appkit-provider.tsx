'use client';

/**
 * AppKit Provider — matches official next-wagmi-solana example exactly.
 *
 * Source: appkit-main/examples/next-wagmi-solana-bitcoin-app-router/src/config/index.ts
 *
 * KEY FINDINGS from official example:
 * 1. SolanaAdapter from '@reown/appkit-adapter-solana' (NOT /react)
 * 2. SolanaAdapter({}) — empty object, NOT { wallets: [] }
 * 3. WagmiAdapter REQUIRED alongside SolanaAdapter
 * 4. WagmiProvider MUST wrap children
 * 5. createAppKit called at module scope
 */

import { type ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Config, WagmiProvider } from 'wagmi';

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { solana, mainnet, type AppKitNetwork } from '@reown/appkit/networks';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
// WagmiAdapter requires at least one EVM network for initialization
// mainnet included for wagmi but defaultNetwork is solana
const networks = [solana, mainnet] as [AppKitNetwork, ...AppKitNetwork[]];

const queryClient = new QueryClient();

// Adapters + modal — client-only initialization
let wagmiAdapterInstance: WagmiAdapter | null = null;

function getWagmiAdapter(): WagmiAdapter {
  if (!wagmiAdapterInstance) {
    wagmiAdapterInstance = new WagmiAdapter({ networks, projectId });
  }
  return wagmiAdapterInstance;
}

if (typeof window !== 'undefined' && projectId) {
  const wagmiAdapter = getWagmiAdapter();
  const solanaAdapter = new SolanaAdapter({});

  const origin = window.location.origin;
  const domainName = window.location.hostname
    .replace(/^www\./, '')
    .replace(/\.(com|org|net|io|app|xyz|co)$/, '');

  createAppKit({
    adapters: [wagmiAdapter, solanaAdapter] as any,
    networks,
    projectId,
    defaultNetwork: solana,
    themeMode: 'dark',
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    allWallets: 'SHOW',
    featuredWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
      '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',  // Trust Wallet
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    ],
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: origin,
      icons: [`${origin}/icon.png`],
      redirect: {
        native: `${domainName}://wc`,
        universal: `${origin}/wc`,
      },
    } as any,
  });
}

// Provider wraps children with WagmiProvider + QueryClientProvider
// (same as official example ContextProvider, line 42-54)
export function AppKitProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  const adapter = getWagmiAdapter();

  return (
    <WagmiProvider config={adapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

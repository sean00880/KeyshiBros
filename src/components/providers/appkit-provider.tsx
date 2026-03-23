'use client';

/**
 * AppKit Provider — WagmiAdapter + SolanaAdapter
 *
 * CONFIRMED ROOT CAUSE: customWallets don't create WC sessions.
 * The onConnectMobile() function checks: if (wallet.mobile_link && wcUri)
 * wcUri is only set when WC pairing is initiated — which only happens
 * for API-backed wallets, not customWallets.
 *
 * Solution: WagmiAdapter creates UniversalProvider which enables WC.
 * defaultNetwork: mainnet so API wallet fetch works (Solana-only = 0 wallets).
 * User can switch to Solana in the modal's network selector.
 *
 * This is the SAME architecture as MEMELinked/normie-tool.
 */

import { type ReactNode, useState, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { solana, mainnet, type AppKitNetwork } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Config, WagmiProvider } from 'wagmi';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
// mainnet MUST be first — WagmiAdapter needs EVM chain for init
// Solana included for SolanaAdapter connections
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, solana];

const queryClient = new QueryClient();
let wagmiConfig: Config | null = null;

if (typeof window !== 'undefined' && projectId) {
  const wagmiAdapter = new WagmiAdapter({ projectId, networks });
  wagmiConfig = wagmiAdapter.wagmiConfig;

  const solanaAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    registerWalletStandard: true,
  });

  createAppKit({
    adapters: [wagmiAdapter, solanaAdapter],
    networks,
    projectId,
    // defaultNetwork: mainnet so API wallet discovery works
    // (Solana-only defaultNetwork causes 0 wallets in API response filter)
    defaultNetwork: mainnet,
    themeMode: 'dark',
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon.png`],
    },
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    allWallets: 'SHOW',
    // These are wallets that support BOTH EVM and Solana
    featuredWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',  // Trust Wallet
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
      '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX
    ],
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready || !wagmiConfig) return <>{children}</>;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

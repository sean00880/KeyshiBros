'use client';

/**
 * AppKit Solana-Only Provider
 *
 * CRITICAL: All adapter creation and createAppKit MUST be inside
 * typeof window !== 'undefined' guard. 'use client' does NOT prevent
 * module-scope code from running during SSR in Next.js.
 *
 * If createAppKit runs on server, it creates a broken modal instance
 * with no wallet-standard registry — wallets will never be detected.
 */

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

// MUST only run on client — wallet-standard requires window/navigator
if (typeof window !== 'undefined' && projectId) {
  const solanaAdapter = new SolanaAdapter();

  createAppKit({
    adapters: [solanaAdapter],
    networks: [solana, solanaTestnet, solanaDevnet],
    projectId,
    themeMode: 'dark',
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon.png`],
    },
    featuredWalletIds: [
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',  // Trust Wallet
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    ],
    allWallets: 'SHOW',
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

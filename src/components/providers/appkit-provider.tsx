"use client";

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana } from '@reown/appkit/networks';
import type { AppKit } from '@reown/appkit';
import { type ReactNode, useEffect } from 'react';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || '';

// Singleton — initialized once at module load time (NOT in useEffect)
// This is the Reown-recommended pattern for Next.js
// Web components (<appkit-button>) must be registered BEFORE React renders them
let modalInstance: AppKit | null = null;
let initAttempted = false;

function initializeAppKit(): AppKit | null {
  if (typeof window === 'undefined') return null;
  if (modalInstance) return modalInstance;
  if (initAttempted) return null;
  if (!PROJECT_ID) { console.warn('[AppKit] NEXT_PUBLIC_PROJECT_ID not set'); return null; }

  initAttempted = true;

  try {
    const solanaAdapter = new SolanaAdapter({ wallets: [] });

    const hostname = window.location.hostname;
    const origin = window.location.origin;
    const domainName = hostname
      .replace(/^www\./, '')
      .replace(/\.(com|org|net|io|app|xyz|co)$/, '');

    modalInstance = createAppKit({
      adapters: [solanaAdapter],
      projectId: PROJECT_ID,
      networks: [solana],
      defaultNetwork: solana,
      allWallets: 'SHOW',
      enableWallets: true,
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
        '1ca0bdd4747578705b1939af023d120677c64fe38e4fd00e1a1bc2f6b9b5e4a1', // Solflare
        '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',  // Trust Wallet
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
        'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18', // Zerion
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
      features: {
        analytics: false,
      },
    });

    console.log('[AppKit] Initialized successfully');
    return modalInstance;
  } catch (error) {
    console.error('[AppKit] Failed to initialize:', error);
    return null;
  }
}

// CRITICAL: Initialize at module load time (synchronously on client)
// This registers the web components before React renders <appkit-button>
if (typeof window !== 'undefined') {
  initializeAppKit();
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  // Fallback: ensure initialization if module-level init was skipped
  useEffect(() => {
    if (typeof window !== 'undefined' && !modalInstance) {
      initializeAppKit();
    }
  }, []);

  return <>{children}</>;
}

"use client";

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana } from '@reown/appkit/networks';
import type { AppKit } from '@reown/appkit';
import { type ReactNode, useEffect } from 'react';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || '';

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

    const origin = window.location.origin;
    const domainName = window.location.hostname
      .replace(/^www\./, '')
      .replace(/\.(com|org|net|io|app|xyz|co)$/, '');

    modalInstance = createAppKit({
      adapters: [solanaAdapter],
      projectId: PROJECT_ID,
      networks: [solana],
      defaultNetwork: solana,
      themeMode: 'dark' as const,
      features: {
        analytics: false,
        email: false,
        socials: false,
      },
      allWallets: 'SHOW',
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
        'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
        '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
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

    console.log('[AppKit] Initialized');
    return modalInstance;
  } catch (error) {
    console.error('[AppKit] Init failed:', error);
    return null;
  }
}

if (typeof window !== 'undefined') {
  initializeAppKit();
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !modalInstance) {
      initializeAppKit();
    }
  }, []);

  return <>{children}</>;
}

"use client";

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana } from '@reown/appkit/networks';
import { type ReactNode, useEffect, useRef } from 'react';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || '';

let initialized = false;

function initAppKit() {
  if (initialized || typeof window === 'undefined' || !PROJECT_ID) return;
  initialized = true;

  const solanaAdapter = new SolanaAdapter({ wallets: [] });

  createAppKit({
    adapters: [solanaAdapter],
    projectId: PROJECT_ID,
    networks: [solana],
    defaultNetwork: solana,
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token',
      url: window.location.origin,
      icons: ['/icon.png'],
    },
    allWallets: 'SHOW',
    featuredWalletIds: [
      // Phantom — #1 Solana wallet
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
      // Solflare
      '1ca0bdd4747578705b1939af023d120677c64fe38e4fd00e1a1bc2f6b9b5e4a1',
      // Backpack
      'ebac7b26e5f01f5a828b5c8b05174fdb199deb14ec2b8a0e36aa7e0b1b09091c',
      // Trust Wallet
      '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
      // Coinbase Wallet
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    ],
    features: {
      analytics: false,
    },
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      initAppKit();
    }
  }, []);

  return <>{children}</>;
}

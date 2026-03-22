"use client";

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana } from '@reown/appkit/networks';
import { type ReactNode, useEffect, useRef } from 'react';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || '';

const solanaAdapter = new SolanaAdapter();

let initialized = false;

function initAppKit() {
  if (initialized || typeof window === 'undefined' || !PROJECT_ID) return;
  initialized = true;

  createAppKit({
    adapters: [solanaAdapter],
    projectId: PROJECT_ID,
    networks: [solana],
    defaultNetwork: solana,
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://keyshibros.com',
      icons: ['/icon.png'],
    },
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

'use client';

/**
 * AppKit Provider — matches official next-solana-app-router example EXACTLY
 * Source: appkit-web-examples/nextjs/next-solana-app-router
 *
 * STRIPPED TO BARE MINIMUM to isolate 0-wallet issue.
 * No wagmi. No SIWX. No features. No customWallets.
 */

import React, { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const networks = [solana, solanaTestnet, solanaDevnet] as [AppKitNetwork, ...AppKitNetwork[]];
const solanaAdapter = new SolanaAdapter();

const metadata = {
  name: 'Keyshi Bros',
  description: 'GameFi Private Sale',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://keyshibros.com',
  icons: ['https://keyshibros.com/icon.png'],
};

if (projectId) {
  createAppKit({
    adapters: [solanaAdapter],
    projectId,
    networks,
    metadata,
    themeMode: 'dark' as const,
    features: {
      analytics: true,
    },
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

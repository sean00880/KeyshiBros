'use client';

/**
 * AppKit Solana-Only Provider
 *
 * Matches the EXACT official Reown Solana React example:
 * https://github.com/reown-com/reown-docs/snippets/appkit/react/solana/about/implementation.mdx
 *
 * NO wagmi, NO EVM chains. Pure Solana.
 */

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

const solanaWeb3JsAdapter = new SolanaAdapter();

const metadata = {
  name: 'Keyshi Bros',
  description: 'GameFi Private Sale — $KB Token on Solana',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://keyshibros.com',
  icons: ['https://keyshibros.com/icon.png'],
};

if (projectId) {
  createAppKit({
    adapters: [solanaWeb3JsAdapter],
    networks: [solana, solanaTestnet, solanaDevnet],
    metadata,
    projectId,
    themeMode: 'dark',
    features: {
      analytics: true,
    },
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

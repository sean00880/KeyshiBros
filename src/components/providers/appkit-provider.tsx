'use client';

/**
 * AppKit Solana Provider with WalletConnect UniversalProvider
 *
 * SolanaAdapter alone only handles wallet-standard (injected providers).
 * It does NOT create WalletConnect sessions for deep linking.
 *
 * To get proper mobile deep linking (Trust, OKX, Backpack), we need
 * UniversalProvider which creates WC pairing sessions.
 *
 * This matches what MEMELinked gets through WagmiAdapter (which
 * internally creates UniversalProvider).
 */

import { type ReactNode, useEffect, useState } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import UniversalProvider from '@walletconnect/universal-provider';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

async function initAppKit() {
  if (typeof window === 'undefined' || !projectId) return;

  const solanaAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    registerWalletStandard: true,
  });

  // UniversalProvider enables WalletConnect deep linking for mobile wallets
  const provider = await UniversalProvider.init({
    projectId,
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon.png`],
    },
  });

  createAppKit({
    adapters: [solanaAdapter],
    networks: [solana, solanaTestnet, solanaDevnet],
    projectId,
    universalProvider: provider,
    themeMode: 'dark',
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon.png`],
    },
    features: {
      analytics: false,
    },
    allWallets: 'SHOW',
  } as any);
}

// Initialize on client
let initialized = false;
if (typeof window !== 'undefined') {
  if (!initialized) {
    initialized = true;
    initAppKit().catch(console.error);
  }
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

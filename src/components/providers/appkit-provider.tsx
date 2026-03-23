'use client';

/**
 * AppKit Solana-Only Provider — FINAL FIX
 *
 * Root cause of all issues:
 * 1. customWallets bypass WalletConnect pairing — deep links open but
 *    no WC session is created, so wallet can't connect back
 * 2. Solana-only API fetch returns 0 due to chain registration race
 *
 * Solution: Use includeWalletIds (API-backed, full WC pairing) +
 * enable socials as fallback. The API wallets have proper WC integration.
 * Social login (Google) also works as a Solana wallet via Reown.
 */

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

// Verified Solana wallet IDs from api.web3modal.org
const SOLANA_WALLETS = [
  '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',  // Trust Wallet
  '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
  '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150', // SafePal
  '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance Wallet
];

if (typeof window !== 'undefined' && projectId) {
  // PhantomWalletAdapter + SolflareWalletAdapter handle detection
  // via wallet-standard (injected provider) — they don't use WalletConnect
  const solanaAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    registerWalletStandard: true,
  });

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
    features: {
      analytics: false,
      // Keep socials enabled — they work as Solana wallet via Reown
      // and provide a connection method on mobile Safari where
      // wallet-standard detection doesn't work
    },
    // API-backed wallets with full WalletConnect pairing
    includeWalletIds: SOLANA_WALLETS,
    featuredWalletIds: SOLANA_WALLETS,
    allWallets: 'SHOW',
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

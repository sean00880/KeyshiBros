'use client';

/**
 * AppKit Solana-Only Provider
 *
 * Known issue: Solana-only AppKit shows 0 wallets on mobile (GitHub #4289).
 * Perplexity research confirms:
 * - EVM wallet IDs in featuredWalletIds cause issues for Solana-only
 * - includeWalletIds + featuredWalletIds together fix empty wallet list (#3128)
 * - Domain must be in Reown Cloud allowed domains
 * - Check console for APKT002/APKT003 errors
 */

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

// Solana-supporting wallet IDs only (verified via WalletConnect explorer API)
const SOLANA_WALLET_IDS = [
  'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
  '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',  // Trust Wallet
  '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
  '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150', // SafePal
  '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance Wallet
];

if (typeof window !== 'undefined' && projectId) {
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
      email: false,
      socials: false,
    },
    // Both includeWalletIds AND featuredWalletIds needed (fix from #3128)
    includeWalletIds: SOLANA_WALLET_IDS,
    featuredWalletIds: SOLANA_WALLET_IDS,
    allWallets: 'SHOW',
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

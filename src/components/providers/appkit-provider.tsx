'use client';

/**
 * AppKit Solana-Only Provider
 *
 * WalletConnect explorer API confirms 136 Solana wallets available.
 * The issue was: social features (email/google/discord) were enabled
 * by default, taking over the modal and hiding the wallet list.
 *
 * Fix: disable socials + email, enable wallets explicitly.
 */

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

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
    // CRITICAL: Disable social logins — they take over the modal and hide wallets
    // This matches MEMELinked's config (features.email: false, socials: false)
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    // Show wallet list
    allWallets: 'SHOW',
    featuredWalletIds: [
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',  // Trust Wallet
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
      '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX
      '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150', // SafePal
    ],
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

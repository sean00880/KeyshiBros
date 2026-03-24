'use client';

/**
 * AppKit Provider — module-level init (matching f0db6c5 pattern that worked)
 *
 * Key: createAppKit at module level, NOT useEffect.
 * SIWX: bare DefaultSIWX() (no custom storage/verifiers — those can be added later)
 */

import React, { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import {
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
  solana, solanaTestnet, solanaDevnet,
} from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { DefaultSIWX } from '@reown/appkit-siwx';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

// Solana first — becomes natural default without explicit defaultNetwork
const allNetworks = [
  solana, solanaTestnet, solanaDevnet,
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
] as [AppKitNetwork, ...AppKitNetwork[]];

const ethersAdapter = new EthersAdapter();
const solanaAdapter = new SolanaAdapter();

const metadata = {
  name: 'Keyshi Bros',
  description: 'GameFi Private Sale',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://keyshibros.com',
  icons: ['https://keyshibros.com/icon.png'],
};

if (projectId) {
  createAppKit({
    adapters: [ethersAdapter, solanaAdapter],
    projectId,
    networks: allNetworks,
    metadata,
    themeMode: 'dark' as const,
    siwx: new DefaultSIWX(),
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    allWallets: 'SHOW',
    // Solana wallet IDs from WC Explorer — matches lab SolanaWalletButtons
    featuredWalletIds: [
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
      '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79', // Solflare
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
      '2bd8c14e035c2d48f184aaa168559e86b0e3433228d3c4075900a221785019b0', // Backpack
      '0ef262ca2a56b88d179c93a21383fee4e135bd7bc6680e5c2356ff8e38301037', // Jupiter
      '2a3c89040ac3b723a1972a33a125b1db11e258a6975d3a61252cd64e6ea5ea01', // Coin98
      '85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041', // Frontier
    ],
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

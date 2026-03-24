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

const allNetworks = [
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
  solana, solanaTestnet, solanaDevnet,
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
      analytics: true,
    },
    allWallets: 'SHOW',
    featuredWalletIds: [
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    ],
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

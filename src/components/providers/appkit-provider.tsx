'use client';

/**
 * AppKit Provider — EthersAdapter + SolanaAdapter
 * Matching MEMELinked's allWallets/featuredWalletIds config
 * but using EthersAdapter (not WagmiAdapter)
 */

import React, { type ReactNode, useEffect, useRef } from 'react';
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
import { supabaseSIWXStorage } from '@/services/siwx/SupabaseSIWXStorage';
import {
  SimpleEIP155Verifier,
  SimpleSolanaVerifier,
} from '@/lib/siwx/SimpleVerifiers';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? '';

const evmNetworks: AppKitNetwork[] = [
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
];
const solanaNetworks: AppKitNetwork[] = [solana, solanaTestnet, solanaDevnet];
const allNetworks = [...evmNetworks, ...solanaNetworks] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

const ethersAdapter = new EthersAdapter();
const solanaAdapter = new SolanaAdapter();

const metadata = {
  name: 'Keyshi Bros',
  description: 'GameFi Private Sale',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['https://keyshibros.com/icon.png'],
};

export function AppKitProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !projectId) return;
    initialized.current = true;

    const siwx = new DefaultSIWX({
      storage: supabaseSIWXStorage,
      verifiers: [new SimpleEIP155Verifier(), new SimpleSolanaVerifier()],
    });

    createAppKit({
      adapters: [ethersAdapter, solanaAdapter],
      projectId,
      networks: allNetworks,
      metadata,
      themeMode: 'dark' as const,
      siwx,
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
  }, []);

  return <>{children}</>;
}

'use client';

/**
 * AppKit Provider — exact siwx-default pattern from Reown Laboratory
 * Source: apps/laboratory/src/constants/appKitConfigs.ts → 'siwx-default'
 *
 * Lab config: adapters: ['ethers', 'solana', 'bitcoin'], networks: AllNetworks
 * We skip bitcoin adapter but include ALL EVM + Solana networks.
 *
 * Our additions: SupabaseSIWXStorage + SimpleVerifiers (from normie-tool)
 */

import React, { type ReactNode, useEffect, useRef } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import {
  // EVM — matches lab ConstantsUtil.EvmNetworks
  mainnet,
  optimism,
  polygon,
  zkSync,
  arbitrum,
  base,
  baseSepolia,
  sepolia,
  gnosis,
  hedera,
  aurora,
  mantle,
  // Solana — matches lab ConstantsUtil.SolanaNetworks
  solana,
  solanaTestnet,
  solanaDevnet,
} from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { DefaultSIWX } from '@reown/appkit-siwx';
import { supabaseSIWXStorage } from '@/services/siwx/SupabaseSIWXStorage';
import {
  SimpleEIP155Verifier,
  SimpleSolanaVerifier,
} from '@/lib/siwx/SimpleVerifiers';

// --- Project ID ---
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID ?? '';

// --- Networks: ALL networks matching lab ConstantsUtil.AllNetworks ---
const evmNetworks: AppKitNetwork[] = [
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
];
const solanaNetworks: AppKitNetwork[] = [solana, solanaTestnet, solanaDevnet];
const allNetworks = [...evmNetworks, ...solanaNetworks] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

// --- Adapters (bare, matching lab AppKitConfigUtil.ts) ---
const ethersAdapter = new EthersAdapter();
const solanaAdapter = new SolanaAdapter();

// --- Metadata (lab: CoreHelperUtil.isClient() ? origin : '') ---
const metadata = {
  name: 'Keyshi Bros',
  description: 'GameFi Private Sale',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['https://keyshibros.com/icon.png'],
};

// --- Provider: initializes AppKit in useEffect (lab AppKitContext.tsx pattern) ---
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
      // Show ALL wallets in modal (matching MEMELinked normie-tool config)
      allWallets: 'SHOW',
      // Featured wallet IDs from WalletConnect explorer (hex format)
      // @see https://walletconnect.com/explorer/wallets
      featuredWalletIds: [
        'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
      ],
    });
  }, []);

  return <>{children}</>;
}

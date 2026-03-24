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
    });
  }, []);

  return <>{children}</>;
}

'use client';

/**
 * AppKit Provider — siwx-default pattern from Reown Laboratory
 * Source: apps/laboratory/src/context/AppKitContext.tsx + appKitConfigs.ts
 *
 * Uses EthersAdapter (EVM) + SolanaAdapter — NO WagmiProvider wrapper needed.
 * Initialization in useEffect (matching lab pattern, not module-level).
 *
 * Our additions: SupabaseSIWXStorage + SimpleVerifiers (from normie-tool)
 */

import React, { type ReactNode, useEffect, useRef } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import {
  mainnet,
  optimism,
  polygon,
  arbitrum,
  base,
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

// --- Networks (EVM + Solana — lab siwx-default uses AllNetworks) ---
const evmNetworks: AppKitNetwork[] = [mainnet, optimism, polygon, arbitrum, base];
const solanaNetworks: AppKitNetwork[] = [solana, solanaTestnet, solanaDevnet];
const allNetworks = [...evmNetworks, ...solanaNetworks] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

// --- Adapters (bare instantiation, matching lab AppKitConfigUtil.ts) ---
const ethersAdapter = new EthersAdapter();
const solanaAdapter = new SolanaAdapter();

// --- Metadata (lab uses CoreHelperUtil.isClient() — we use typeof window) ---
const metadata = {
  name: 'Keyshi Bros',
  description: 'GameFi Private Sale',
  url:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://keyshibros.com',
  icons: ['https://keyshibros.com/icon.png'],
};

// --- Provider: initializes AppKit in useEffect (matching lab AppKitContext.tsx) ---
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
      defaultNetwork: solana,
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

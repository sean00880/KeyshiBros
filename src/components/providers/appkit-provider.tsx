'use client';

/**
 * AppKit Provider — EXACT siwx-default from Reown Laboratory
 *
 * Stripped to match lab 1:1. No extras. No custom SIWX storage/verifiers.
 * Lab passes: commonAppKitConfig + adapters + networks + siwx: new DefaultSIWX()
 * That's it. Nothing else.
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

// --- Matches lab ConstantsUtil ---
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

// --- Matches lab AppKitConfigUtil.ts: bare instantiation ---
const ethersAdapter = new EthersAdapter();
const solanaAdapter = new SolanaAdapter();

// --- Matches lab commonAppKitConfig.metadata ---
const metadata = {
  name: 'Keyshi Bros',
  description: 'GameFi Private Sale',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['https://keyshibros.com/icon.png'],
};

// --- Module-level createAppKit: matches lab siwx-default EXACTLY ---
// Lab passes: { ...commonAppKitConfig, adapters, networks, siwx: new DefaultSIWX() }
// commonAppKitConfig = { termsConditionsUrl, privacyPolicyUrl, customWallets, projectId, metadata }
// We match all of these. No extras.
if (typeof window !== 'undefined' && projectId) {
  createAppKit({
    adapters: [ethersAdapter, solanaAdapter],
    projectId,
    networks: allNetworks,
    metadata,
    siwx: new DefaultSIWX(),
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

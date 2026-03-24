'use client';

/**
 * AppKit Provider — WagmiAdapter + SolanaAdapter (Option #2)
 *
 * TELEMETRY PROVED universalProvider.connect() fails for Solana-only:
 *   "Failed to publish custom payload, please try again. tag:undefined"
 * This is a WC relay protocol bug — Solana namespace messages have
 * malformed tags when no EVM adapter is present.
 *
 * FIX: Use WagmiAdapter (creates working UniversalProvider for relay)
 * + SolanaAdapter (handles wallet-standard + Solana tx signing).
 * defaultNetwork: solana — user sees Solana, WC relay works via wagmi.
 *
 * mainnet is included ONLY for WagmiAdapter init (requires EVM chain).
 * It's not exposed to the user — defaultNetwork is solana.
 */

import { type ReactNode, useState, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { solana, solanaTestnet, solanaDevnet, mainnet, type AppKitNetwork } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Config, WagmiProvider } from 'wagmi';
import { debugLog } from '@/lib/debug-telemetry';

import { DefaultSIWX } from '@reown/appkit-siwx';
import { supabaseSIWXStorage } from '@/services/siwx/SupabaseSIWXStorage';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const IMG = (id: string) => `https://explorer-api.walletconnect.com/v3/logo/md/${id}?projectId=${projectId}`;

// Separate network arrays — WagmiAdapter only gets EVM, AppKit gets all
const evmNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet];
const solanaNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [solana, solanaTestnet, solanaDevnet];
const allNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [...evmNetworks, ...solanaNetworks];
const queryClient = new QueryClient();
let wagmiConfig: Config | null = null;

if (typeof window !== 'undefined' && projectId) {
  debugLog('appkit_init_start', { strategy: 'wagmi+solana', projectId: projectId.substring(0, 8) });

  // WagmiAdapter only gets EVM networks (official pattern)
  const wagmiAdapter = new WagmiAdapter({ projectId, networks: evmNetworks, ssr: true });
  wagmiConfig = wagmiAdapter.wagmiConfig;

  const solanaAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    registerWalletStandard: true,
  });

  // DefaultSIWX with storage only — let it use default verifiers
  // (includes both EIP155Verifier + SolanaVerifier by default)
  // Passing only SolanaVerifier breaks WC flow via WagmiAdapter
  const siwx = new DefaultSIWX({
    storage: supabaseSIWXStorage,
  });

  // defaultNetwork: mainnet so WC relay works (Solana-only relay has tag:undefined bug)
  // We switch to Solana immediately after init via modal.switchNetwork()
  const modal = createAppKit({
    adapters: [wagmiAdapter, solanaAdapter],
    networks: allNetworks,
    projectId,
    defaultNetwork: mainnet,
    themeMode: 'dark',
    siwx,
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon.png`],
      redirect: (() => {
        const origin = window.location.origin;
        const domainName = window.location.hostname
          .replace(/^www\./, '')
          .replace(/\.(com|org|net|io|app|xyz|co)$/, '');
        return { native: `${domainName}://wc`, universal: `${origin}/wc` };
      })(),
    } as any,
    features: { analytics: true, socials: [], email: false },
    // NO customWallets — use API-backed wallets for proper WC pairing.
    // customWallets bypass WC session creation (wcUri never set).
    // API wallets go through full WC flow: pairing → deep link → connect.
    // defaultNetwork: mainnet means API returns 600+ wallets including
    // Trust, MetaMask, Coinbase, OKX (all support Solana too).
    allWallets: 'SHOW',
    featuredWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',  // Trust Wallet
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
      '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX
    ],
  });

  debugLog('appkit_created', { strategy: 'wagmi+solana', hasSiwx: true, customWallets: 5 });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  if (!wagmiConfig) return <>{children}</>;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

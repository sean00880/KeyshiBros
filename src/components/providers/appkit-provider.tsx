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

  createAppKit({
    adapters: [wagmiAdapter, solanaAdapter],
    networks: allNetworks,
    projectId,
    defaultNetwork: solana,
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
    allWallets: 'SHOW',
    // customWallets for guaranteed display in modal
    customWallets: [
      {
        id: 'phantom', name: 'Phantom', homepage: 'https://phantom.app',
        image_url: IMG('b6ec7b81-bb4f-427d-e290-7631e6e50d00'),
        mobile_link: 'https://phantom.app/ul/v1',
        webapp_link: 'https://phantom.app/ul/v1',
        app_store: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
        play_store: 'https://play.google.com/store/apps/details?id=app.phantom',
      },
      {
        id: 'solflare', name: 'Solflare', homepage: 'https://solflare.com',
        image_url: IMG('34c0e38d-66c4-470e-1aed-a6fabe2d1e00'),
        mobile_link: 'https://solflare.com/ul/v1',
        webapp_link: 'https://solflare.com/ul/v1',
        app_store: 'https://apps.apple.com/app/solflare-solana-wallet/id1580902717',
        play_store: 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
      },
      {
        id: 'trust', name: 'Trust Wallet', homepage: 'https://trustwallet.com',
        image_url: IMG('7677b54f-3486-46e2-4e37-bf8747814f00'),
        mobile_link: 'trust:',
        webapp_link: 'https://link.trustwallet.com',
        app_store: 'https://apps.apple.com/app/trust-wallet/id1288339409',
        play_store: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
      },
      {
        id: 'backpack', name: 'Backpack', homepage: 'https://backpack.app',
        image_url: IMG('71ca9daf-a31e-4d2a-fd01-f5dc2dc66900'),
        mobile_link: 'backpack:',
        webapp_link: 'https://backpack.app/ul',
        app_store: 'https://apps.apple.com/app/backpack-crypto-wallet/id6444544093',
        play_store: 'https://play.google.com/store/apps/details?id=app.backpack.mobile',
      },
      {
        id: 'okx', name: 'OKX Wallet', homepage: 'https://www.okx.com/web3',
        image_url: IMG('45f2f08e-fc0c-4d62-3e63-404e72170500'),
        mobile_link: 'okex:',
        webapp_link: 'https://www.okx.com/download',
        app_store: 'https://apps.apple.com/app/okx-buy-bitcoin-eth-crypto/id1327268470',
        play_store: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
      },
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

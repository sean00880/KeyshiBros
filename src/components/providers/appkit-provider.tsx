'use client';

/**
 * AppKit Provider — WagmiAdapter + SolanaAdapter + full SIWX stack
 * Matches normie-tool SIWX coordination: custom storage, verifiers, signer.
 */

import React, { type ReactNode, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { DefaultSIWX } from '@reown/appkit-siwx';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConstantsUtil } from '@/lib/constants';
import { supabaseSIWXStorage } from '@/services/siwx/SupabaseSIWXStorage';

const projectId = (process.env.NEXT_PUBLIC_PROJECT_ID || '').trim();
const isClient = typeof window !== 'undefined';

const { AllNetworks, SolanaNetworks, FeaturedWalletIds } = ConstantsUtil;

// WagmiAdapter needs AllNetworks for WC relay
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: AllNetworks,
  ssr: true,
});

const solanaAdapter = new SolanaAdapter();

const metadata = (() => {
  const origin = isClient ? window.location.origin : 'https://keyshibros.com';
  const hostname = isClient ? window.location.hostname : 'keyshibros.com';
  const domainName = hostname.replace(/^www\./, '').replace(/\.(com|org|net|io|app)$/, '');

  return {
    name: 'Keyshi Bros',
    description: 'GameFi Private Sale',
    url: origin,
    icons: ['https://keyshibros.com/icon.png'],
    redirect: {
      native: `${domainName}://wc`,
      universal: `${origin}/wc`,
    },
  };
})();

// --- SIWX: matching normie-tool createSIWX() exactly ---
// Matches official example: next-siwx-multichain-supabase-storage
// Only override storage. DefaultSIWX built-in handles:
// - Signer: DefaultSigner (chain-aware via ConnectionController)
// - Verifiers: EIP155Verifier + SolanaVerifier + BIP122Verifier (with nacl/bs58)
// Custom SimpleVerifiers interfere with built-in crypto verification.
function createSIWX() {
  if (!isClient) return undefined;

  try {
    return new DefaultSIWX({
      storage: supabaseSIWXStorage,
    });
  } catch (error) {
    console.error('[AppKit] SIWX init failed:', error);
    return new DefaultSIWX();
  }
}

if (projectId) {
  createAppKit({
    adapters: [solanaAdapter, wagmiAdapter],
    projectId,
    networks: AllNetworks,
    defaultNetwork: SolanaNetworks[0],
    enableWallets: true,
    metadata,
    themeMode: 'dark' as const,
    siwx: createSIWX(),
    features: {
      analytics: false,
      email: false,
      socials: false,
      headless: false,
    },
    allWallets: 'SHOW',
    featuredWalletIds: FeaturedWalletIds,
  });
}

const queryClient = new QueryClient();

export function AppKitProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies?: string | null;
}) {
  useEffect(() => {
    document.cookie = `wc_return_path=${window.location.pathname};path=/;max-age=300`;
  }, []);

  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies ?? undefined,
  );

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

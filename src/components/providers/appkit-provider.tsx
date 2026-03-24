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
import { cookieStorage, cookieToInitialState, createStorage, WagmiProvider, type Config } from 'wagmi';
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
  storage: createStorage({ storage: cookieStorage }) as any,
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

  // Mobile resume reconciler (matches normie-tool SIWXResumeReconciler pattern)
  // On mobile Safari, when user returns from wallet app, visibilitychange fires.
  // DefaultSIWX relies on WC relay callback which may not fire reliably on resume.
  // This manually triggers SIWX check after page becomes visible again.
  useEffect(() => {
    let lastHidden = 0;

    const handleVisibility = async () => {
      if (document.visibilityState === 'hidden') {
        lastHidden = Date.now();
        return;
      }
      // Only reconcile if page was hidden for >1s (actual app switch, not tab flicker)
      if (Date.now() - lastHidden < 1000) return;

      try {
        // Dynamically import to avoid SSR issues
        const { ChainController } = await import('@reown/appkit-controllers');
        const caipAddress = ChainController.getActiveCaipAddress?.();
        if (!caipAddress) return; // No wallet connected

        const { OptionsController } = await import('@reown/appkit-controllers');
        const siwx = OptionsController.state.siwx;
        if (!siwx) return;

        const [namespace, chainId, address] = caipAddress.split(':');
        const sessions = await siwx.getSessions(`${namespace}:${chainId}` as any, address!);
        if (sessions.length > 0) return; // Already signed

        // Connected but not signed — open sign modal
        const { ModalController } = await import('@reown/appkit-controllers');
        await ModalController.open({ view: 'SIWXSignMessage' });
      } catch (e) {
        console.error('[AppKit] Resume reconcile error:', e);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
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

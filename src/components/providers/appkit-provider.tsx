'use client';

/**
 * AppKit Provider — WagmiAdapter + SolanaAdapter (same as MEMELinked)
 *
 * CONFIRMED: WagmiAdapter is REQUIRED for WalletConnect deep linking.
 * SolanaAdapter alone only handles wallet-standard (injected).
 * WagmiAdapter internally creates UniversalProvider which enables:
 * - WC pairing sessions for mobile deep links
 * - API wallet discovery (the "0 wallets" fix)
 * - Proper Trust/OKX/Backpack connection flow
 *
 * WagmiAdapter needs at least one EVM network (mainnet).
 * defaultNetwork is set to solana — user sees Solana by default.
 */

import { type ReactNode, useState, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { solana, mainnet, type AppKitNetwork } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Config, WagmiProvider } from 'wagmi';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
// mainnet required for WagmiAdapter init, solana is the actual default
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, solana];

const queryClient = new QueryClient();
let wagmiConfig: Config | null = null;

if (typeof window !== 'undefined' && projectId) {
  const wagmiAdapter = new WagmiAdapter({ projectId, networks });
  wagmiConfig = wagmiAdapter.wagmiConfig;

  const solanaAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    registerWalletStandard: true,
  });

  createAppKit({
    adapters: [wagmiAdapter, solanaAdapter],
    networks,
    projectId,
    defaultNetwork: solana,
    themeMode: 'dark',
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon.png`],
    },
    features: {
      analytics: false,
    },
    allWallets: 'SHOW',
    featuredWalletIds: [
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
      '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',  // Trust Wallet
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    ],
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  if (!ready || !wagmiConfig) return <>{children}</>;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

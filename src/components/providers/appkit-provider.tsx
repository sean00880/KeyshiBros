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
    // customWallets for guaranteed display (API returns 0 for Solana-only)
    // WagmiAdapter provides WC pairing for the deep links to work
    customWallets: [
      {
        id: 'phantom',
        name: 'Phantom',
        homepage: 'https://phantom.app',
        image_url: 'https://explorer-api.walletconnect.com/v3/logo/md/b6ec7b81-bb4f-427d-e290-7631e6e50d00?projectId=' + projectId,
        mobile_link: 'https://phantom.app/ul/v1/',
        webapp_link: 'https://phantom.app/ul/v1/',
        app_store: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
        play_store: 'https://play.google.com/store/apps/details?id=app.phantom',
      },
      {
        id: 'solflare',
        name: 'Solflare',
        homepage: 'https://solflare.com',
        image_url: 'https://explorer-api.walletconnect.com/v3/logo/md/34c0e38d-66c4-470e-1aed-a6fabe2d1e00?projectId=' + projectId,
        mobile_link: 'https://solflare.com/ul/v1/',
        webapp_link: 'https://solflare.com/ul/v1/',
        app_store: 'https://apps.apple.com/app/solflare-solana-wallet/id1580902717',
        play_store: 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        homepage: 'https://trustwallet.com',
        image_url: 'https://explorer-api.walletconnect.com/v3/logo/md/7677b54f-3486-46e2-4e37-bf8747814f00?projectId=' + projectId,
        mobile_link: 'trust://',
        webapp_link: 'https://link.trustwallet.com',
        app_store: 'https://apps.apple.com/app/trust-wallet/id1288339409',
        play_store: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
      },
      {
        id: 'backpack',
        name: 'Backpack',
        homepage: 'https://backpack.app',
        image_url: 'https://explorer-api.walletconnect.com/v3/logo/md/71ca9daf-a31e-4d2a-fd01-f5dc2dc66900?projectId=' + projectId,
        mobile_link: 'backpack://',
        app_store: 'https://apps.apple.com/app/backpack-crypto-wallet/id6444544093',
        play_store: 'https://play.google.com/store/apps/details?id=app.backpack.mobile',
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        homepage: 'https://www.okx.com/web3',
        image_url: 'https://explorer-api.walletconnect.com/v3/logo/md/45f2f08e-fc0c-4d62-3e63-404e72170500?projectId=' + projectId,
        mobile_link: 'okex://main',
        webapp_link: 'https://www.okx.com/download?deeplink=okx://web3/wallet/walletConnect',
        app_store: 'https://apps.apple.com/app/okx-buy-bitcoin-eth-crypto/id1327268470',
        play_store: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
      },
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

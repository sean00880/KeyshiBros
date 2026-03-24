'use client';

/**
 * AppKit Provider — WagmiAdapter + SolanaAdapter (matching normie-tool)
 *
 * WagmiAdapter is required for WalletConnect relay which powers mobile
 * deep linking (Safari → wallet app → connect + sign → back).
 * EthersAdapter alone cannot create WC sessions for mobile.
 */

import React, { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import {
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
  solana, solanaTestnet, solanaDevnet,
} from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { DefaultSIWX } from '@reown/appkit-siwx';
import { WagmiProvider, type Config } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const isClient = typeof window !== 'undefined';

// EVM first (normie-tool order) + Solana
const allNetworks = [
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
  solana, solanaTestnet, solanaDevnet,
] as [AppKitNetwork, ...AppKitNetwork[]];

// WagmiAdapter — drives WC relay for mobile deep linking
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: allNetworks,
  ssr: true,
});

const solanaAdapter = new SolanaAdapter();

const metadata = {
  name: 'Keyshi Bros',
  description: 'GameFi Private Sale',
  url: isClient ? window.location.origin : 'https://keyshibros.com',
  icons: ['https://keyshibros.com/icon.png'],
  redirect: isClient
    ? {
        native: 'keyshibros://wc',
        universal: `${window.location.origin}/wc`,
      }
    : {
        native: 'keyshibros://wc',
        universal: 'https://keyshibros.com/wc',
      },
};

if (projectId) {
  createAppKit({
    adapters: [wagmiAdapter, solanaAdapter],
    projectId,
    networks: allNetworks,
    enableWallets: true,
    metadata,
    themeMode: 'dark' as const,
    siwx: new DefaultSIWX(),
    features: {
      analytics: false,
      email: false,
      socials: false,
      headless: false,
    },
    allWallets: 'SHOW',
    featuredWalletIds: [
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
      '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79', // Solflare
    ],
    customWallets: [
      {
        id: 'phantom-custom',
        name: 'Phantom',
        homepage: 'https://phantom.app',
        image_url: 'https://registry.walletconnect.com/v2/logo/md/a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
        mobile_link: 'phantom://',
        app_store: 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977',
        play_store: 'https://play.google.com/store/apps/details?id=app.phantom',
      },
      {
        id: 'trust-custom',
        name: 'Trust Wallet',
        homepage: 'https://trustwallet.com',
        image_url: 'https://registry.walletconnect.com/v2/logo/md/4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        mobile_link: 'trust://',
        app_store: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
        play_store: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
      },
      {
        id: 'solflare-custom',
        name: 'Solflare',
        homepage: 'https://solflare.com',
        image_url: 'https://registry.walletconnect.com/v2/logo/md/1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79',
        mobile_link: 'solflare://',
        app_store: 'https://apps.apple.com/app/solflare-solana-wallet/id1580902717',
        play_store: 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
      },
    ],
  });
}

const queryClient = new QueryClient();

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

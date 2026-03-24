'use client';

/**
 * AppKit Provider — EthersAdapter + SolanaAdapter
 * Matches normie-tool pattern: enableWallets, featuredWalletIds, allWallets,
 * metadata.redirect for mobile deep linking, customWallets for guaranteed
 * mobile wallet visibility.
 */

import React, { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import {
  solana, solanaTestnet, solanaDevnet,
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
} from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { DefaultSIWX } from '@reown/appkit-siwx';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const isClient = typeof window !== 'undefined';

// EVM first (matching normie-tool) to test mobile wallet deep linking
const allNetworks = [
  mainnet, optimism, polygon, zkSync, arbitrum, base,
  baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
  solana, solanaTestnet, solanaDevnet,
] as [AppKitNetwork, ...AppKitNetwork[]];

const ethersAdapter = new EthersAdapter();
const solanaAdapter = new SolanaAdapter();

// Dynamic metadata with mobile redirect (matching normie-tool pattern)
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
    adapters: [ethersAdapter, solanaAdapter],
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
    // Featured wallet IDs from WC Explorer (hex format)
    featuredWalletIds: [
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
      '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79', // Solflare
    ],
    // Custom wallets — forces these to appear on mobile even without extensions
    // mobile_link enables deep linking: Safari → wallet app → connect + sign
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
      {
        id: 'backpack-custom',
        name: 'Backpack',
        homepage: 'https://backpack.app',
        image_url: 'https://registry.walletconnect.com/v2/logo/md/2bd8c14e035c2d48f184aaa168559e86b0e3433228d3c4075900a221785019b0',
        mobile_link: 'backpack://',
        app_store: 'https://apps.apple.com/app/backpack-crypto-wallet/id6444544067',
        play_store: 'https://play.google.com/store/apps/details?id=app.backpack.mobile',
      },
    ],
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

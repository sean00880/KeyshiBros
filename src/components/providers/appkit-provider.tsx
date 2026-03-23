'use client';

/**
 * AppKit Solana-Only Provider
 *
 * Uses customWallets to bypass Solana-only wallet discovery bug (#4289).
 * Image IDs and mobile links verified against WalletConnect API.
 *
 * Phantom/Solflare use webapp_link (universal links) — not mobile_link.
 * Their mobile_link is null in the API. Deep links like phantom:// only
 * work for WalletConnect URI passing, not for browse/connect.
 */

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const IMG = (id: string) => `https://api.web3modal.org/getWalletImage/${id}?projectId=${projectId}`;

if (typeof window !== 'undefined' && projectId) {
  const solanaAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    registerWalletStandard: true,
  });

  createAppKit({
    adapters: [solanaAdapter],
    networks: [solana, solanaTestnet, solanaDevnet],
    projectId,
    themeMode: 'dark',
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon.png`],
    },
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    allWallets: 'SHOW',
    customWallets: [
      {
        id: 'phantom',
        name: 'Phantom',
        homepage: 'https://phantom.app',
        image_url: IMG('b6ec7b81-bb4f-427d-e290-7631e6e50d00'),
        // Phantom has no mobile_link — uses webapp_link for universal deep linking
        webapp_link: 'https://phantom.app/ul/browse/' + encodeURIComponent(window.location.href),
        app_store: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
        play_store: 'https://play.google.com/store/apps/details?id=app.phantom',
      },
      {
        id: 'solflare',
        name: 'Solflare',
        homepage: 'https://solflare.com',
        image_url: IMG('34c0e38d-66c4-470e-1aed-a6fabe2d1e00'),
        webapp_link: 'https://solflare.com/ul/v1/browse/' + encodeURIComponent(window.location.href),
        app_store: 'https://apps.apple.com/app/solflare-solana-wallet/id1580902717',
        play_store: 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
      },
      {
        id: 'backpack',
        name: 'Backpack',
        homepage: 'https://backpack.app',
        image_url: IMG('71ca9daf-a31e-4d2a-fd01-f5dc2dc66900'),
        mobile_link: 'backpack://',
        app_store: 'https://apps.apple.com/app/backpack-crypto-wallet/id6444544093',
        play_store: 'https://play.google.com/store/apps/details?id=app.backpack.mobile',
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        homepage: 'https://trustwallet.com',
        image_url: IMG('7677b54f-3486-46e2-4e37-bf8747814f00'),
        mobile_link: 'trust://',
        app_store: 'https://apps.apple.com/app/trust-wallet/id1288339409',
        play_store: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        homepage: 'https://www.okx.com/web3',
        image_url: IMG('45f2f08e-fc0c-4d62-3e63-404e72170500'),
        mobile_link: 'okex://main',
        app_store: 'https://apps.apple.com/app/okx-buy-bitcoin-eth-crypto/id1327268470',
        play_store: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
      },
    ],
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

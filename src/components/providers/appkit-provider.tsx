'use client';

/**
 * AppKit Solana-Only Provider
 *
 * customWallets bypass the Solana-only wallet discovery bug (#4289).
 *
 * Deep linking: AppKit auto-appends "wc?uri=wc:..." to mobile_link.
 * So mobile_link should be JUST the scheme (e.g., "trust://").
 * Phantom/Solflare use webapp_link (universal links) — AppKit appends
 * the WC URI to that too.
 *
 * Images: explorer-api.walletconnect.com/v3/logo/md/{id} (NOT api.web3modal.org)
 */

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const IMG = (id: string) => `https://explorer-api.walletconnect.com/v3/logo/md/${id}?projectId=${projectId}`;

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
        // Phantom uses universal links — AppKit appends wc URI
        webapp_link: 'https://phantom.app/ul/v1/',
        app_store: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
        play_store: 'https://play.google.com/store/apps/details?id=app.phantom',
      },
      {
        id: 'solflare',
        name: 'Solflare',
        homepage: 'https://solflare.com',
        image_url: IMG('34c0e38d-66c4-470e-1aed-a6fabe2d1e00'),
        webapp_link: 'https://solflare.com/ul/v1/',
        app_store: 'https://apps.apple.com/app/solflare-solana-wallet/id1580902717',
        play_store: 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
      },
      {
        id: 'backpack',
        name: 'Backpack',
        homepage: 'https://backpack.app',
        image_url: IMG('71ca9daf-a31e-4d2a-fd01-f5dc2dc66900'),
        // Backpack uses deep link scheme — AppKit appends wc?uri=...
        mobile_link: 'backpack://',
        app_store: 'https://apps.apple.com/app/backpack-crypto-wallet/id6444544093',
        play_store: 'https://play.google.com/store/apps/details?id=app.backpack.mobile',
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        homepage: 'https://trustwallet.com',
        image_url: IMG('7677b54f-3486-46e2-4e37-bf8747814f00'),
        // Trust uses deep link — AppKit builds trust://wc?uri=wc:...
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

'use client';

/**
 * AppKit Solana-Only Provider
 *
 * Known bug: Solana-only AppKit shows 0 wallets (GitHub #4289, #3128).
 * The API returns 603 wallets but the SDK's chain registration race
 * condition causes the post-fetch filter to drop all results.
 *
 * Workaround: Use customWallets to define wallets inline — bypasses
 * the broken API-based wallet discovery entirely.
 */

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

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
    // Custom wallets bypass the broken API wallet discovery
    // These render directly in the modal without API fetch
    customWallets: [
      {
        id: 'phantom',
        name: 'Phantom',
        homepage: 'https://phantom.app',
        image_url: 'https://explorer-api.walletconnect.com/v3/logo/md/a797aa35-c0fa-4dfc-1a53-e7f675162e00?projectId=' + projectId,
        mobile_link: 'phantom://',
        link_mode: 'https://phantom.app/ul/browse/',
        app_store: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
        play_store: 'https://play.google.com/store/apps/details?id=app.phantom',
      },
      {
        id: 'solflare',
        name: 'Solflare',
        homepage: 'https://solflare.com',
        image_url: 'https://explorer-api.walletconnect.com/v3/logo/md/1ca0bdd4-7475-4a8d-1939-af023d120600?projectId=' + projectId,
        mobile_link: 'solflare://',
        link_mode: 'https://solflare.com/ul/v1/browse/',
        app_store: 'https://apps.apple.com/app/solflare-solana-wallet/id1580902717',
        play_store: 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        homepage: 'https://trustwallet.com',
        image_url: 'https://explorer-api.walletconnect.com/v3/logo/md/7677b54f-3486-46e2-4e37-bf8747814f00?projectId=' + projectId,
        mobile_link: 'trust://',
        link_mode: 'https://link.trustwallet.com',
        app_store: 'https://apps.apple.com/app/trust-wallet/id1288339409',
        play_store: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        homepage: 'https://www.okx.com/web3',
        image_url: 'https://explorer-api.walletconnect.com/v3/logo/md/45f2f08e-fc0c-4d62-3e63-404e72170500?projectId=' + projectId,
        mobile_link: 'okex://main',
        link_mode: 'https://www.okx.com/download',
        app_store: 'https://apps.apple.com/app/okx-buy-bitcoin-eth-crypto/id1327268470',
        play_store: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
      },
      {
        id: 'backpack',
        name: 'Backpack',
        homepage: 'https://backpack.app',
        image_url: 'https://explorer-api.walletconnect.com/v3/logo/md/ebac7b26-e5f0-4f5a-828b-5c8b05174f00?projectId=' + projectId,
        mobile_link: 'backpack://',
        link_mode: 'https://backpack.app/ul/browse/',
        app_store: 'https://apps.apple.com/app/backpack-crypto-wallet/id6444544093',
        play_store: 'https://play.google.com/store/apps/details?id=app.backpack.mobile',
      },
    ],
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

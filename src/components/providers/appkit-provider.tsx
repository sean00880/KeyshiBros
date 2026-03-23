'use client';

/**
 * AppKit Solana Provider — with display_uri patch
 *
 * BUG FOUND: SolanaAdapter.setUniversalProvider() calls listenWcProvider()
 * but does NOT pass onDisplayUri callback. The base client (appkit-base-client.js
 * line 1514) DOES pass it. Without onDisplayUri, ConnectionController.state.wcUri
 * is never set, so onConnectMobile()'s condition `wallet.mobile_link && wcUri`
 * is always false — the deep link never fires.
 *
 * FIX: Monkey-patch the SolanaAdapter's setUniversalProvider to also
 * listen for display_uri and call ConnectionController.setUri().
 */

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConnectionController } from '@reown/appkit-controllers';

import { DefaultSIWX, SolanaVerifier } from '@reown/appkit-siwx';
import { supabaseSIWXStorage } from '@/services/siwx/SupabaseSIWXStorage';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const IMG = (id: string) => `https://explorer-api.walletconnect.com/v3/logo/md/${id}?projectId=${projectId}`;

if (typeof window !== 'undefined' && projectId) {
  const solanaAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    registerWalletStandard: true,
  });

  // PATCH: Wrap setUniversalProvider to add the missing onDisplayUri listener
  const originalSetUniversalProvider = solanaAdapter.setUniversalProvider.bind(solanaAdapter);
  (solanaAdapter as any).setUniversalProvider = async (universalProvider: any) => {
    // Call the original (registers connect/disconnect/accountsChanged listeners)
    await originalSetUniversalProvider(universalProvider);

    // Add the MISSING display_uri listener that the SolanaAdapter forgot
    // This is what appkit-base-client.js does at line 1514
    universalProvider.on('display_uri', (uri: string) => {
      console.log('[AppKit Patch] display_uri received, setting wcUri');
      ConnectionController.setUri(uri);
    });
  };

  // Configure SIWX using Solana Verifier
  // IMPORTANT: Since WagmiAdapter isn't available, we strictly omit `signer` to ensure AppKit uses its 
  // ConnectionController defaults to fire signature requests native to the Solana Adapter (Phantom / Solflare).
  const siwx = new DefaultSIWX({
    verifiers: [new SolanaVerifier()],
    storage: supabaseSIWXStorage,
  });

  createAppKit({
    adapters: [solanaAdapter],
    networks: [solana, solanaTestnet, solanaDevnet],
    projectId,
    themeMode: 'dark',
    siwx, // Applying SIWX integration tailored for Solana 
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon.png`],
      // STRICT FIX FOR MOBILE WALLET DEEP LINKING
      // Required so that apps like Phantom and Solflare can redirect back to the PWA after wallet connections/signing
      // @ts-ignore - Reown AppKit generic metadata might not include redirect in types, but it is required for deep linking
      redirect: (() => {
        const origin = window.location.origin;
        const hostname = window.location.hostname;
        const domainName = hostname
          .replace(/^www\./, '')
          .replace(/\.(com|org|net|io|app|xyz|co)$/, '');

        return {
          native: `${domainName}://wc`,
          universal: `${origin}/wc`,
        };
      })()
    } as any,
    features: {
      analytics: false,
    },
    allWallets: 'SHOW',
    customWallets: [
      {
        id: 'phantom',
        name: 'Phantom',
        homepage: 'https://phantom.app',
        image_url: IMG('b6ec7b81-bb4f-427d-e290-7631e6e50d00'),
        mobile_link: 'https://phantom.app/ul/v1',
        webapp_link: 'https://phantom.app/ul/v1',
        app_store: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
        play_store: 'https://play.google.com/store/apps/details?id=app.phantom',
      },
      {
        id: 'solflare',
        name: 'Solflare',
        homepage: 'https://solflare.com',
        image_url: IMG('34c0e38d-66c4-470e-1aed-a6fabe2d1e00'),
        mobile_link: 'https://solflare.com/ul/v1',
        webapp_link: 'https://solflare.com/ul/v1',
        app_store: 'https://apps.apple.com/app/solflare-solana-wallet/id1580902717',
        play_store: 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        homepage: 'https://trustwallet.com',
        image_url: IMG('7677b54f-3486-46e2-4e37-bf8747814f00'),
        mobile_link: 'trust:',
        webapp_link: 'https://link.trustwallet.com',
        app_store: 'https://apps.apple.com/app/trust-wallet/id1288339409',
        play_store: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
      },
      {
        id: 'backpack',
        name: 'Backpack',
        homepage: 'https://backpack.app',
        image_url: IMG('71ca9daf-a31e-4d2a-fd01-f5dc2dc66900'),
        mobile_link: 'backpack:',
        webapp_link: 'https://backpack.app/ul',
        app_store: 'https://apps.apple.com/app/backpack-crypto-wallet/id6444544093',
        play_store: 'https://play.google.com/store/apps/details?id=app.backpack.mobile',
      },
      {
        id: 'okx',
        name: 'OKX Wallet',
        homepage: 'https://www.okx.com/web3',
        image_url: IMG('45f2f08e-fc0c-4d62-3e63-404e72170500'),
        mobile_link: 'okex:',
        webapp_link: 'https://www.okx.com/download',
        app_store: 'https://apps.apple.com/app/okx-buy-bitcoin-eth-crypto/id1327268470',
        play_store: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
      },
    ],
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

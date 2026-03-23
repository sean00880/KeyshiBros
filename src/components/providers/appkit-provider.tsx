'use client';

/**
 * AppKit Solana Provider — with WC connect fix for bugs #3843 and #3183
 *
 * TELEMETRY CONFIRMED: universalProvider.connect() hangs forever.
 * display_uri never fires. connectWalletConnect never resolves.
 *
 * FIX: Override the SolanaAdapter's connectWalletConnect to manually
 * call universalProvider.connect() with explicit Solana namespaces
 * and a timeout. Also manually emit display_uri if the provider
 * generates a URI but fails to emit the event.
 */

import { type ReactNode } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConnectionController } from '@reown/appkit-controllers';
import { debugLog } from '@/lib/debug-telemetry';

import { DefaultSIWX, SolanaVerifier } from '@reown/appkit-siwx';
import { supabaseSIWXStorage } from '@/services/siwx/SupabaseSIWXStorage';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';
const IMG = (id: string) => `https://explorer-api.walletconnect.com/v3/logo/md/${id}?projectId=${projectId}`;

if (typeof window !== 'undefined' && projectId) {
  const solanaAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    registerWalletStandard: true,
  });

  debugLog('appkit_init_start', { projectId: projectId.substring(0, 8) });

  // Store reference to universalProvider when it's set
  let _universalProvider: any = null;

  // PATCH 1: Capture universalProvider + add display_uri listener
  const originalSetUP = solanaAdapter.setUniversalProvider.bind(solanaAdapter);
  (solanaAdapter as any).setUniversalProvider = async (up: any) => {
    _universalProvider = up;
    debugLog('set_universal_provider_called');

    await originalSetUP(up);

    // Add missing display_uri listener
    up.on('display_uri', (uri: string) => {
      debugLog('display_uri_fired', { uri_prefix: uri.substring(0, 60) });
      ConnectionController.setUri(uri);
    });

    debugLog('set_universal_provider_patched');
  };

  // PATCH 2: Override connectWalletConnect to fix the hanging connect()
  // Bug #3843: syncWalletConnectAccount only handles wagmi, not Solana
  // Bug #3183: SolanaWalletConnectProvider doesn't emit events properly
  const originalConnectWC = solanaAdapter.connectWalletConnect.bind(solanaAdapter);
  (solanaAdapter as any).connectWalletConnect = async (chainId: string) => {
    debugLog('adapter_connectWC_start', { chainId, hasUP: !!_universalProvider });

    if (!_universalProvider) {
      debugLog('adapter_connectWC_no_provider');
      return originalConnectWC(chainId);
    }

    try {
      // Manually call universalProvider.connect with Solana namespaces
      // This bypasses the WalletConnectConnector which hangs
      const solanaChainId = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';

      debugLog('adapter_connectWC_manual_connect', { solanaChainId });

      const connectPromise = _universalProvider.connect({
        optionalNamespaces: {
          solana: {
            methods: ['solana_signMessage', 'solana_signTransaction'],
            chains: [solanaChainId],
            events: ['chainChanged', 'accountsChanged'],
          },
        },
      });

      // Timeout after 30 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('WC connect timeout after 30s')), 30000)
      );

      await Promise.race([connectPromise, timeoutPromise]);

      debugLog('adapter_connectWC_connected');

      const clientId = await _universalProvider.client?.core?.crypto?.getClientId();
      return { clientId, session: _universalProvider.session };
    } catch (err: any) {
      debugLog('adapter_connectWC_error', { error: err?.message || String(err) });
      throw err;
    }
  };

  // Configure SIWX
  const siwx = new DefaultSIWX({
    verifiers: [new SolanaVerifier()],
    storage: supabaseSIWXStorage,
  });

  createAppKit({
    adapters: [solanaAdapter],
    networks: [solana, solanaTestnet, solanaDevnet],
    projectId,
    themeMode: 'dark',
    siwx,
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: window.location.origin,
      icons: [`${window.location.origin}/icon.png`],
      // @ts-ignore
      redirect: (() => {
        const origin = window.location.origin;
        const domainName = window.location.hostname
          .replace(/^www\./, '')
          .replace(/\.(com|org|net|io|app|xyz|co)$/, '');
        return { native: `${domainName}://wc`, universal: `${origin}/wc` };
      })(),
    } as any,
    features: { analytics: false },
    allWallets: 'SHOW',
    customWallets: [
      {
        id: 'phantom', name: 'Phantom', homepage: 'https://phantom.app',
        image_url: IMG('b6ec7b81-bb4f-427d-e290-7631e6e50d00'),
        mobile_link: 'https://phantom.app/ul/v1',
        webapp_link: 'https://phantom.app/ul/v1',
        app_store: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
        play_store: 'https://play.google.com/store/apps/details?id=app.phantom',
      },
      {
        id: 'solflare', name: 'Solflare', homepage: 'https://solflare.com',
        image_url: IMG('34c0e38d-66c4-470e-1aed-a6fabe2d1e00'),
        mobile_link: 'https://solflare.com/ul/v1',
        webapp_link: 'https://solflare.com/ul/v1',
        app_store: 'https://apps.apple.com/app/solflare-solana-wallet/id1580902717',
        play_store: 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
      },
      {
        id: 'trust', name: 'Trust Wallet', homepage: 'https://trustwallet.com',
        image_url: IMG('7677b54f-3486-46e2-4e37-bf8747814f00'),
        mobile_link: 'trust:',
        webapp_link: 'https://link.trustwallet.com',
        app_store: 'https://apps.apple.com/app/trust-wallet/id1288339409',
        play_store: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
      },
      {
        id: 'backpack', name: 'Backpack', homepage: 'https://backpack.app',
        image_url: IMG('71ca9daf-a31e-4d2a-fd01-f5dc2dc66900'),
        mobile_link: 'backpack:',
        webapp_link: 'https://backpack.app/ul',
        app_store: 'https://apps.apple.com/app/backpack-crypto-wallet/id6444544093',
        play_store: 'https://play.google.com/store/apps/details?id=app.backpack.mobile',
      },
      {
        id: 'okx', name: 'OKX Wallet', homepage: 'https://www.okx.com/web3',
        image_url: IMG('45f2f08e-fc0c-4d62-3e63-404e72170500'),
        mobile_link: 'okex:',
        webapp_link: 'https://www.okx.com/download',
        app_store: 'https://apps.apple.com/app/okx-buy-bitcoin-eth-crypto/id1327268470',
        play_store: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
      },
    ],
  });

  debugLog('appkit_created', { hasSiwx: true, customWallets: 5 });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

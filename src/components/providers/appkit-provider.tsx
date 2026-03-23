"use client";

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana } from '@reown/appkit/networks';
import { type ReactNode, useEffect, useRef } from 'react';

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || '';

let initialized = false;

function initAppKit() {
  if (initialized || typeof window === 'undefined' || !PROJECT_ID) return;
  initialized = true;

  const solanaAdapter = new SolanaAdapter({ wallets: [] });

  // Deep linking: derive scheme from current domain
  // keyshibros.com → keyshibros://wc, https://keyshibros.com/wc
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  const domainName = hostname
    .replace(/^www\./, '')
    .replace(/\.(com|org|net|io|app|xyz|co)$/, '');

  createAppKit({
    adapters: [solanaAdapter],
    projectId: PROJECT_ID,
    networks: [solana],
    defaultNetwork: solana,

    // Show ALL wallets (Phantom, Solflare, Backpack, MetaMask, Zerion,
    // Rainbow, Ledger, Trust, Coinbase, etc.) — same as normie-tool
    allWallets: 'SHOW',

    // Featured wallets shown first (hex IDs from WalletConnect explorer)
    // @see https://walletconnect.com/explorer/wallets
    featuredWalletIds: [
      // MetaMask — supports Solana now
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
      // Phantom — #1 Solana wallet
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
      // Solflare — Solana-native
      '1ca0bdd4747578705b1939af023d120677c64fe38e4fd00e1a1bc2f6b9b5e4a1',
      // Trust Wallet — multi-chain
      '4622a2b2d6af1c984494291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
      // Coinbase Wallet
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
      // Zerion
      'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18',
    ],

    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: origin,
      icons: [`${origin}/icon.png`],
      // Mobile deep linking — wallet apps redirect back here after signing
      // Same pattern as normie-tool's multi-domain deep link support
      // @see https://docs.reown.com/appkit/react/core/options#metadata-redirect
      redirect: {
        native: `${domainName}://wc`,
        universal: `${origin}/wc`,
      },
    } as any,

    features: {
      analytics: false,
    },
  });
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      initAppKit();
    }
  }, []);

  return <>{children}</>;
}

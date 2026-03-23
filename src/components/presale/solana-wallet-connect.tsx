"use client";

import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { CheckCircle } from '@phosphor-icons/react';

const WALLETS = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: 'https://explorer-api.walletconnect.com/v3/logo/md/b6ec7b81-bb4f-427d-e290-7631e6e50d00',
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: 'https://explorer-api.walletconnect.com/v3/logo/md/34c0e38d-66c4-470e-1aed-a6fabe2d1e00',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: 'https://explorer-api.walletconnect.com/v3/logo/md/7677b54f-3486-46e2-4e37-bf8747814f00',
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: 'https://explorer-api.walletconnect.com/v3/logo/md/71ca9daf-a31e-4d2a-fd01-f5dc2dc66900',
  },
  {
    id: 'okx',
    name: 'OKX',
    icon: 'https://explorer-api.walletconnect.com/v3/logo/md/45f2f08e-fc0c-4d62-3e63-404e72170500',
  },
];

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

/**
 * Custom Solana wallet connect buttons.
 *
 * Uses useAppKit().open() which triggers the AppKit's internal
 * WC connection flow with proper pairing + deep linking.
 *
 * The AppKit modal handles the "Continue in [Wallet]" flow
 * including WC URI generation and deep link construction.
 */
export function SolanaWalletConnect() {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
        <CheckCircle weight="fill" className="text-green-400" size={14} />
        <span className="text-green-400 text-[10px] font-mono truncate">{address}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Primary: Opens AppKit modal which handles WC pairing */}
      <button
        onClick={() => open()}
        className="w-full py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white font-bold text-sm hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
      >
        Connect Wallet
      </button>

      {/* Wallet icons grid — visual only, all trigger same modal */}
      <div className="flex items-center justify-center gap-3">
        {WALLETS.map((w) => (
          <button
            key={w.id}
            onClick={() => open()}
            className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-colors"
            title={w.name}
          >
            <img
              src={w.icon + '?projectId=' + projectId}
              alt={w.name}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      <p className="text-white/40 text-[9px] text-center font-mono">
        Phantom · Solflare · Trust · Backpack · OKX
      </p>
    </div>
  );
}

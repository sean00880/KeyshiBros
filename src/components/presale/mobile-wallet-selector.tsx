"use client";

import { SOLANA_WALLETS, getWalletBrowseLink } from '@/lib/wallet-deeplinks';
import { isMobilePlatform } from '@/lib/browser/platform';

/**
 * Mobile Wallet Selector — native deep links
 *
 * On mobile, Solana wallets don't use WalletConnect.
 * Instead, the dApp opens INSIDE the wallet's built-in browser.
 * The wallet's injected provider (wallet-standard) then auto-connects.
 *
 * Flow: Tap Phantom → opens keyshibros.com in Phantom browser →
 *       PhantomWalletAdapter auto-detects → connected
 */
export function MobileWalletSelector() {
  if (typeof window === 'undefined') return null;
  if (!isMobilePlatform()) return null;

  const dappUrl = window.location.href;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-white/40 text-[9px] font-mono uppercase tracking-widest text-center mb-1">
        Open in wallet app
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SOLANA_WALLETS.map((wallet) => {
          const link = getWalletBrowseLink(wallet.id, dappUrl);
          if (!link) return null;

          return (
            <a
              key={wallet.id}
              href={link}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors no-underline"
            >
              <img
                src={wallet.icon + '?projectId=' + (process.env.NEXT_PUBLIC_PROJECT_ID || '')}
                alt={wallet.name}
                className="w-7 h-7 rounded-lg"
              />
              <span className="text-white text-sm font-medium">{wallet.name}</span>
            </a>
          );
        })}
      </div>
      <p className="text-white/30 text-[9px] text-center mt-1">
        Opens this page inside the wallet&apos;s browser for secure connection
      </p>
    </div>
  );
}

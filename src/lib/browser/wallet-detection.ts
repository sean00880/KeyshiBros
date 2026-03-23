/**
 * Wallet in-app browser detection — ported from MEMELinked's walletBrowserDetection.ts
 *
 * Detects if user is in a mobile wallet's WebView (Phantom, MetaMask, Trust, etc.)
 * which affects: deep linking, OAuth availability, wallet connection flow.
 */

import { detectPlatform } from './platform';

export interface WalletBrowserInfo {
  isWalletBrowser: boolean;
  walletName: string | null;
  isMobile: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  hasInjectedSolana: boolean;
}

const WALLET_PATTERNS = [
  { name: 'Phantom', patterns: [/Phantom/i], solanaKey: 'isPhantom' },
  { name: 'Solflare', patterns: [/Solflare/i], solanaKey: 'isSolflare' },
  { name: 'Backpack', patterns: [/Backpack/i], solanaKey: 'isBackpack' },
  { name: 'MetaMask', patterns: [/MetaMask/i, /MetaMaskMobile/i] },
  { name: 'Coinbase Wallet', patterns: [/CoinbaseWallet/i, /Coinbase/i] },
  { name: 'Trust Wallet', patterns: [/Trust/i, /TrustWallet/i] },
  { name: 'OKX Wallet', patterns: [/OKX/i, /OKApp/i] },
  { name: 'Zerion', patterns: [/Zerion/i] },
  { name: 'Bitget Wallet', patterns: [/Bitget/i, /BitKeep/i] },
] as const;

const WEBVIEW_PATTERNS = [/wv\)/i, /WebView/i, /Android.*wv/i];

export function detectWalletBrowser(): WalletBrowserInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isWalletBrowser: false, walletName: null, isMobile: false, platform: 'unknown', hasInjectedSolana: false };
  }

  const platform = detectPlatform();
  const isMobile = platform === 'ios' || platform === 'android';
  const ua = navigator.userAgent;
  const solana = (window as any).solana || (window as any).phantom?.solana;
  const hasInjectedSolana = !!solana;

  let walletName: string | null = null;

  // Check UA patterns
  for (const wallet of WALLET_PATTERNS) {
    for (const pattern of wallet.patterns) {
      if (pattern.test(ua)) { walletName = wallet.name; break; }
    }
    if (walletName) break;
  }

  // Check Solana provider on mobile (provider without UA match = wallet browser)
  if (!walletName && isMobile && hasInjectedSolana) {
    if (solana?.isPhantom) walletName = 'Phantom';
    else if (solana?.isSolflare) walletName = 'Solflare';
    else if (solana?.isBackpack) walletName = 'Backpack';
    else walletName = 'Unknown Wallet';
  }

  // Generic WebView fallback (mobile only)
  if (!walletName && isMobile) {
    for (const pattern of WEBVIEW_PATTERNS) {
      if (pattern.test(ua)) { walletName = 'Unknown Wallet'; break; }
    }
  }

  return {
    isWalletBrowser: !!walletName,
    walletName,
    isMobile,
    platform,
    hasInjectedSolana,
  };
}

/**
 * Get deep link URL for a specific wallet app.
 * Used for "Open in Phantom" / "Open in Solflare" buttons on mobile.
 */
export function getWalletDeepLink(walletName: string, url: string): string | null {
  const encoded = encodeURIComponent(url);
  switch (walletName.toLowerCase()) {
    case 'phantom':
      return `https://phantom.app/ul/browse/${encoded}?ref=${encodeURIComponent(new URL(url).origin)}`;
    case 'solflare':
      return `https://solflare.com/ul/v1/browse/${encoded}`;
    case 'backpack':
      return `https://backpack.app/ul/browse/${encoded}`;
    default:
      return null;
  }
}

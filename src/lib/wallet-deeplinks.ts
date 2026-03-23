/**
 * Solana Wallet Deep Links — Native deep link protocol
 *
 * Phantom, Solflare, Backpack use their OWN deep link protocols,
 * NOT WalletConnect. Each wallet has a /connect endpoint that
 * opens the wallet app and initiates a connection.
 *
 * For web dApps on mobile Safari:
 * - Phantom: Opens dApp in Phantom's in-app browser via browse link
 * - Trust: Opens via WalletConnect URI (if available)
 * - Solflare: Opens dApp in Solflare's in-app browser
 * - Backpack: Opens dApp in Backpack's in-app browser
 */

/**
 * Build a deep link URL that opens the dApp inside the wallet's browser.
 * The wallet then detects itself as the provider (wallet-standard).
 */
export function getWalletBrowseLink(
  walletId: string,
  dappUrl: string
): string | null {
  const encoded = encodeURIComponent(dappUrl);

  switch (walletId) {
    case 'phantom':
      // Opens keyshibros.com inside Phantom's in-app browser
      // Phantom auto-connects via wallet-standard in its browser
      return `https://phantom.app/ul/browse/${encoded}?ref=${encodeURIComponent(new URL(dappUrl).origin)}`;

    case 'solflare':
      return `https://solflare.com/ul/v1/browse/${encoded}`;

    case 'backpack':
      return `https://backpack.app/ul/browse/${encoded}`;

    case 'trust':
      // Trust Wallet doesn't have a browse deep link for Solana
      // Users need to open the dApp URL manually in Trust's browser
      return `https://link.trustwallet.com/open_url?coin_id=501&url=${encoded}`;

    case 'okx':
      return `https://www.okx.com/download?deeplink=${encodeURIComponent('okx://web3/browser?url=' + encoded)}`;

    default:
      return null;
  }
}

export const SOLANA_WALLETS = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: 'https://explorer-api.walletconnect.com/v3/logo/md/b6ec7b81-bb4f-427d-e290-7631e6e50d00',
    iosApp: 'https://apps.apple.com/app/phantom-crypto-wallet/id1598432977',
    androidApp: 'https://play.google.com/store/apps/details?id=app.phantom',
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: 'https://explorer-api.walletconnect.com/v3/logo/md/34c0e38d-66c4-470e-1aed-a6fabe2d1e00',
    iosApp: 'https://apps.apple.com/app/solflare-solana-wallet/id1580902717',
    androidApp: 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: 'https://explorer-api.walletconnect.com/v3/logo/md/71ca9daf-a31e-4d2a-fd01-f5dc2dc66900',
    iosApp: 'https://apps.apple.com/app/backpack-crypto-wallet/id6444544093',
    androidApp: 'https://play.google.com/store/apps/details?id=app.backpack.mobile',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: 'https://explorer-api.walletconnect.com/v3/logo/md/7677b54f-3486-46e2-4e37-bf8747814f00',
    iosApp: 'https://apps.apple.com/app/trust-wallet/id1288339409',
    androidApp: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp',
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: 'https://explorer-api.walletconnect.com/v3/logo/md/45f2f08e-fc0c-4d62-3e63-404e72170500',
    iosApp: 'https://apps.apple.com/app/okx-buy-bitcoin-eth-crypto/id1327268470',
    androidApp: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
  },
];

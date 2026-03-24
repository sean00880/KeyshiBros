import {
  solana,
  solanaTestnet,
  solanaDevnet,
  mainnet,
  optimism,
  polygon,
  zkSync,
  arbitrum,
  base,
  baseSepolia,
  sepolia,
  gnosis,
  hedera,
  aurora,
  mantle,
} from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

/**
 * ConstantsUtil — dynamic network + wallet config
 *
 * Solana-first for KeyshiBros. Only wallets that support Solana signing
 * via WalletConnect on mobile are featured.
 *
 * REMOVED from featured (mobile Solana incompatible):
 * - MetaMask: EVM-only via WalletConnect, cannot sign Solana messages on mobile
 * - Phantom: Uses wallet-standard (in-app browser only), not WC from Safari
 *
 * KEPT but deprioritized:
 * - Solflare: Known mobile detection issues (reown-com/appkit#4289)
 */
export const ConstantsUtil = {
  SolanaNetworks: [solana, solanaTestnet, solanaDevnet] as [
    AppKitNetwork,
    ...AppKitNetwork[],
  ],

  EvmNetworks: [
    mainnet, optimism, polygon, zkSync, arbitrum, base,
    baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
  ] as [AppKitNetwork, ...AppKitNetwork[]],

  get AllNetworks() {
    return [...this.SolanaNetworks, ...this.EvmNetworks] as [
      AppKitNetwork,
      ...AppKitNetwork[],
    ];
  },

  // --- Featured Wallet IDs (WC Explorer hex format) ---
  // Only wallets confirmed to support Solana WalletConnect on mobile Safari
  SolanaWalletIds: [
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet — CONFIRMED working (connect + sign)
    '0ef262ca2a56b88d179c93a21383fee4e135bd7bc6680e5c2356ff8e38301037', // Jupiter
  ],

  // EVM wallets — available when EVM chains are added
  EvmWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
  ],

  // Featured: Solana wallets only (KeyshiBros is Solana-first)
  get FeaturedWalletIds() {
    return this.SolanaWalletIds;
  },
} as const;

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
 * ConstantsUtil — dynamic network + wallet config (matching lab pattern)
 *
 * Solana-first for KeyshiBros. Add/remove chains here to change
 * what's available across the app without touching provider config.
 */
export const ConstantsUtil = {
  // --- Networks (Solana default, first in array) ---
  SolanaNetworks: [solana, solanaTestnet, solanaDevnet] as [
    AppKitNetwork,
    ...AppKitNetwork[],
  ],

  EvmNetworks: [
    mainnet, optimism, polygon, zkSync, arbitrum, base,
    baseSepolia, sepolia, gnosis, hedera, aurora, mantle,
  ] as [AppKitNetwork, ...AppKitNetwork[]],

  // AllNetworks: Solana first = default chain
  get AllNetworks() {
    return [...this.SolanaNetworks, ...this.EvmNetworks] as [
      AppKitNetwork,
      ...AppKitNetwork[],
    ];
  },

  // --- Featured Wallet IDs (WC Explorer hex format) ---
  // Solana-focused wallets first, then multichain
  SolanaWalletIds: [
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
    '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79', // Solflare
    '2bd8c14e035c2d48f184aaa168559e86b0e3433228d3c4075900a221785019b0', // Backpack
    '0ef262ca2a56b88d179c93a21383fee4e135bd7bc6680e5c2356ff8e38301037', // Jupiter
    '2a3c89040ac3b723a1972a33a125b1db11e258a6975d3a61252cd64e6ea5ea01', // Coin98
    '85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041', // Frontier
  ],

  EvmWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
  ],

  // Combined featured wallets — Solana first
  get FeaturedWalletIds() {
    return [...this.SolanaWalletIds, ...this.EvmWalletIds];
  },
} as const;

/**
 * KeyshiBros Network Configuration
 *
 * Mirrors MEMELinked's ConstantsUtil network setup.
 * Uses Solana as primary with mainnet for WagmiAdapter relay.
 */

import {
  mainnet,
  solana,
  solanaDevnet,
  solanaTestnet,
} from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '';

// EVM networks — needed for WagmiAdapter relay infrastructure
export const EvmNetworks = [mainnet] as const;

// Solana networks — the actual chains KeyshiBros uses
export const SolanaNetworks = [solana, solanaTestnet, solanaDevnet] as const;

// All networks — passed to createAppKit
export const AllNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [
  ...EvmNetworks,
  ...SolanaNetworks,
];

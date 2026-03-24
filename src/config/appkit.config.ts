/**
 * KeyshiBros AppKit Configuration
 *
 * Cloned from MEMELinked's appkit.config.ts with these changes:
 * - Networks: Solana-focused (mainnet for WagmiAdapter relay only)
 * - No Bitcoin adapter
 * - Metadata: KeyshiBros branding
 * - Same SIWX pattern: DefaultSIWX + custom verifiers + WagmiSigner + SupabaseStorage
 */

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import type { CreateAppKit } from '@reown/appkit';
import { DefaultSIWX } from '@reown/appkit-siwx';
import { createStorage, cookieStorage } from 'wagmi';
import { cookieToInitialState } from 'wagmi';
import type { Config } from 'wagmi';

import { projectId, AllNetworks, EvmNetworks } from './networks';
import { SimpleVerifierFactory as DefaultSIWXVerifierFactory } from '@/lib/siwx/SimpleVerifiers';
import { createWagmiSigner } from '@/lib/siwx/WagmiSigner';
import { supabaseSIWXStorage } from '@/services/siwx/SupabaseSIWXStorage';

const networks = AllNetworks;

// Lazy-initialized adapters
let _wagmiAdapter: WagmiAdapter | null = null;
let _solanaAdapter: SolanaAdapter | null = null;

export function getWagmiAdapter(): WagmiAdapter | null {
  if (typeof window === 'undefined') return null;
  if (!_wagmiAdapter) {
    _wagmiAdapter = new WagmiAdapter({
      projectId,
      networks: AllNetworks as any, // Must include ALL networks (same as MEMELinked)
      storage: createStorage({ storage: cookieStorage }),
      ssr: true,
    });
  }
  return _wagmiAdapter;
}

function getSolanaAdapter(): SolanaAdapter | null {
  if (typeof window === 'undefined') return null;
  if (!_solanaAdapter) {
    _solanaAdapter = new SolanaAdapter({ wallets: [] });
  }
  return _solanaAdapter;
}

// Re-export for WagmiProvider in ReownAppKitProvider
export const wagmiAdapter = new Proxy({} as WagmiAdapter, {
  get(_, prop) {
    const adapter = getWagmiAdapter();
    if (!adapter) return undefined;
    return (adapter as any)[prop];
  },
});

export function getInitialState(cookies: string | null) {
  const adapter = getWagmiAdapter();
  if (!adapter || !cookies) return undefined;
  return cookieToInitialState(adapter.wagmiConfig as Config, cookies);
}

/**
 * Create SIWX instance — same pattern as MEMELinked
 */
function createSIWX() {
  if (typeof window === 'undefined') return undefined;

  const wagmi = getWagmiAdapter();
  if (!wagmi) return undefined;

  try {
    const customVerifiers = DefaultSIWXVerifierFactory.createAllVerifiers();
    const customSigner = createWagmiSigner(wagmi.wagmiConfig as Config);

    return new DefaultSIWX({
      storage: supabaseSIWXStorage,
      verifiers: customVerifiers,
      signer: customSigner as any,
    } as any);
  } catch (error) {
    console.error('[KeyshiBros AppKit] SIWX creation failed:', error);
    return undefined;
  }
}

/**
 * Get AppKit configuration — mirrors MEMELinked's getAppKitConfig()
 */
export function getAppKitConfig(): Omit<CreateAppKit, 'projectId'> {
  const isClient = typeof window !== 'undefined';

  const wagmi = getWagmiAdapter();
  const solana = getSolanaAdapter();

  const adapters = ([wagmi, solana].filter(Boolean) as any[]);

  return {
    adapters,
    enableWallets: true,
    networks,
    defaultNetwork: networks[0], // mainnet — for WC relay to work
    themeMode: 'dark' as const,
    siwx: isClient ? createSIWX() : undefined,
    features: {
      analytics: false,
      email: false,
      socials: false,
      headless: false,
      eip6963: true, // Enable injected wallet detection (MetaMask etc.)
    },
    allWallets: 'SHOW',
    // Using VERIFIED wallet IDs from api.web3modal.org
    featuredWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet (correct ID)
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    ],
    metadata: {
      name: 'Keyshi Bros',
      description: 'GameFi Private Sale — $KB Token on Solana',
      url: isClient ? window.location.origin : 'https://keyshibros.com',
      icons: ['https://keyshibros.com/icon.png'],
      redirect: isClient ? (() => {
        const origin = window.location.origin;
        const domainName = window.location.hostname
          .replace(/^www\./, '')
          .replace(/\.(com|org|net|io|app|xyz|co)$/, '');
        return { native: `${domainName}://wc`, universal: `${origin}/wc` };
      })() : { native: 'keyshibros://wc', universal: 'https://keyshibros.com/wc' },
    } as any,
  };
}

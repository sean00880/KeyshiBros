'use client';

/**
 * AppKitProvider — re-exports ReownAppKitProvider
 *
 * The actual AppKit init is in:
 * - config/appkit.config.ts (adapters, networks, SIWX)
 * - context/ReownAppKitProvider.tsx (singleton modal, WagmiProvider)
 *
 * This file exists for import compatibility with existing components.
 */

import ReownAppKitProvider from '@/context/ReownAppKitProvider';

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  return <ReownAppKitProvider>{children}</ReownAppKitProvider>;
}

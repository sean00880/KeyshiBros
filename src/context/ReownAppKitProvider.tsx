"use client";

/**
 * ReownAppKitProvider — cloned from MEMELinked
 *
 * Same pattern: singleton modal init at module scope,
 * WagmiProvider wrapping children for SSR hydration.
 */

import { ReactNode, useEffect } from "react";
import { WagmiProvider, type State } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import type { AppKit } from "@reown/appkit";
import { getAppKitConfig, getWagmiAdapter, wagmiAdapter, getInitialState } from "@/config/appkit.config";
import { projectId } from "@/config/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

if (!projectId) {
  console.warn("NEXT_PUBLIC_PROJECT_ID is not set");
}

const queryClient = new QueryClient();

let modalInstance: AppKit | null = null;
let initializationAttempted = false;

function initializeAppKit(): AppKit | null {
  if (typeof window === 'undefined') return null;
  if (modalInstance) return modalInstance;
  if (initializationAttempted) return null;

  initializationAttempted = true;

  try {
    const config = getAppKitConfig();

    if (!config.adapters || config.adapters.length === 0) {
      console.error('[ReownAppKitProvider] No adapters available');
      return null;
    }

    modalInstance = createAppKit({
      ...config,
      projectId: projectId!,
    });

    console.log('[ReownAppKitProvider] AppKit initialized successfully');
    return modalInstance;
  } catch (error) {
    console.error('[ReownAppKitProvider] Failed to initialize:', error);
    return null;
  }
}

// Initialize at module scope (same as MEMELinked line 68)
if (typeof window !== 'undefined') {
  initializeAppKit();
}

export function getModal(): AppKit | null {
  return modalInstance;
}

interface ReownAppKitProviderProps {
  children: ReactNode;
  cookies?: string | null;
}

export default function ReownAppKitProvider({ children, cookies }: ReownAppKitProviderProps) {
  const wagmiConfig = wagmiAdapter.wagmiConfig;
  const initialState = getInitialState(cookies ?? null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !modalInstance) {
      initializeAppKit();
    }
  }, []);

  if (!wagmiConfig) return <>{children}</>;

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

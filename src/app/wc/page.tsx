'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * WalletConnect universal link handler
 *
 * Wallet apps redirect here: keyshibros.com/wc?wc_ev=2&topic=...
 * MUST preserve WC query params — AppKit needs them to complete the connection.
 * Client-side redirect preserves search params in the URL.
 */
function WCHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Read return path from cookie, default to /join-presale
    const cookies = document.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=');
      if (k && v) acc[k] = v;
      return acc;
    }, {} as Record<string, string>);
    const returnPath = cookies['wc_return_path'] || '/join-presale';

    // Preserve ALL WC query params (wc_ev, topic, etc.)
    const params = searchParams.toString();
    const target = params ? `${returnPath}?${params}` : returnPath;

    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="min-h-svh bg-kb-bg flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

export default function WCRedirect() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-kb-bg" />}>
      <WCHandler />
    </Suspense>
  );
}

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * WalletConnect deep link redirect page.
 * Mobile wallets redirect here after signing — we bounce back to /join-presale.
 * Same pattern as normie-tool's /wc route.
 */
export default function WCRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/join-presale');
  }, [router]);

  return (
    <div className="min-h-svh bg-kb-bg flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

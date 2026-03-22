"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  useEffect(() => {
    const supabase = createClient();

    // The browser client automatically detects the OAuth code in the URL
    // and exchanges it for a session using the PKCE verifier it stored earlier.
    // We just need to wait for the auth state to change, then redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        router.replace(next);
      }
    });

    // Also handle the case where the session is already established
    // (e.g., if onAuthStateChange fires before our listener is set up)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(next);
      }
    });

    return () => subscription.unsubscribe();
  }, [next, router]);

  return (
    <div className="min-h-svh bg-kb-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/40 text-sm font-mono">Completing sign-in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-kb-bg" />}>
      <CallbackHandler />
    </Suspense>
  );
}

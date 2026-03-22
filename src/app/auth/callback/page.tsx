"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) {
      setError('No authorization code received.');
      return;
    }

    const supabase = createClient();

    supabase.auth.exchangeCodeForSession(code).then(({ error: sessionError }) => {
      if (sessionError) {
        console.error('[KB OAuth] Exchange failed:', sessionError.message);
        setError(sessionError.message);
        return;
      }
      router.replace(next);
    });
  }, [code, next, router]);

  if (error) {
    return (
      <div className="min-h-svh bg-kb-bg flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button onClick={() => router.replace('/join-presale')} className="text-white/50 text-sm underline">
            Back to presale
          </button>
        </div>
      </div>
    );
  }

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

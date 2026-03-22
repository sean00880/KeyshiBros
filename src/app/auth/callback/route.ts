import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * OAuth Callback Route — KeyshiBros (Per-Domain PKCE)
 *
 * Same pattern as MEMELinked's /auth/callback/route.ts:
 * 1. Receives code from Google via Supabase OAuth
 * 2. Exchanges code for session using PKCE (same-domain)
 * 3. Redirects to ?next param (defaults to /)
 *
 * REQUIRED: Add these to Supabase Dashboard → Auth → URL Configuration → Redirect URLs:
 *   - https://keyshi-bros.vercel.app/auth/callback
 *   - https://keyshibros.com/auth/callback  (if custom domain)
 *   - http://localhost:3000/auth/callback
 *   - http://localhost:3002/auth/callback
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (error) {
    console.error('[KB OAuth] Provider error:', error);
    return NextResponse.redirect(new URL(`/join-presale?auth_error=${error}`, requestUrl.origin));
  }

  if (!code) {
    console.error('[KB OAuth] No authorization code');
    return NextResponse.redirect(new URL('/join-presale?auth_error=no_code', requestUrl.origin));
  }

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('[KB OAuth] Session exchange failed:', sessionError.message);
      return NextResponse.redirect(new URL(`/join-presale?auth_error=session_failed`, requestUrl.origin));
    }

    console.log('[KB OAuth] Session established, redirecting to:', next);
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (err) {
    console.error('[KB OAuth] Unexpected error:', err);
    return NextResponse.redirect(new URL('/join-presale?auth_error=unexpected', requestUrl.origin));
  }
}

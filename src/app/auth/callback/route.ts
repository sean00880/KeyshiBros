import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * OAuth Callback Route — KeyshiBros (Per-Domain PKCE)
 *
 * Mirrors MEMELinked's /auth/callback/route.ts pattern:
 * 1. Receives code from Google via Supabase OAuth
 * 2. Exchanges code for session using PKCE (same-domain)
 * 3. Redirects to ?next param (defaults to /)
 *
 * CRITICAL: Cookie handling must use request/response pattern (not `cookies()`)
 * because exchangeCodeForSession needs to both READ the PKCE verifier cookie
 * AND SET the session cookies on the response.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (error) {
    console.error('[KB OAuth] Provider error:', error);
    return NextResponse.redirect(new URL(`${next}?auth_error=${error}`, requestUrl.origin));
  }

  if (!code) {
    console.error('[KB OAuth] No authorization code');
    return NextResponse.redirect(new URL(`${next}?auth_error=no_code`, requestUrl.origin));
  }

  // Build the redirect URL early so we can attach cookies to it
  const redirectUrl = new URL(next, requestUrl.origin);

  try {
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                maxAge: 60 * 60 * 24 * 90, // 90-day session
              });
            });
          },
        },
      }
    );

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error('[KB OAuth] Session exchange failed:', sessionError.message);
      return NextResponse.redirect(new URL(`${next}?auth_error=session_failed`, requestUrl.origin));
    }

    console.log('[KB OAuth] Session established, redirecting to:', next);
    return response;
  } catch (err) {
    console.error('[KB OAuth] Unexpected error:', err);
    return NextResponse.redirect(new URL(`${next}?auth_error=unexpected`, requestUrl.origin));
  }
}

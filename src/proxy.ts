import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

/**
 * Next.js 16 Proxy — KeyshiBros Session Management
 *
 * Mirrors MEMELinked's proxy.ts pattern:
 * - Refreshes Supabase session cookies on every request
 * - Keeps PKCE flow working for OAuth callback
 * - 90-day extended sessions for persistent login
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip session refresh for static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Static files
  ) {
    return;
  }

  return await updateSession(request);
}

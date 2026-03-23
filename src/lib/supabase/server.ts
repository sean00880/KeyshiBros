import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with service role for admin operations.
 * Only use in API routes / server components — never expose to client.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Server-side Supabase client with anon key (respects RLS).
 */
export function createServerAnon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

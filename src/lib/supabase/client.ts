import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Browser Supabase client — uses localStorage for auth storage.
 *
 * WHY NOT @supabase/ssr createBrowserClient:
 * The SSR browser client stores PKCE code verifier in cookies, which
 * can get lost during OAuth redirects (Google → Supabase → our callback).
 * The standard JS client uses localStorage, which persists across
 * navigations on the same domain — reliable for PKCE exchange.
 *
 * Singleton pattern ensures the same client instance is reused,
 * so auth state listeners work correctly across the app.
 */
export function createClient() {
  if (client) return client;

  client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // We handle this manually in the callback page
      },
    }
  );

  return client;
}

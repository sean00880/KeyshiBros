import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/profile?user_id=xxx — Get account profile for user
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  if (!userId) return Response.json({ error: 'user_id required' }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('accounts')
    .select('id, user_id, username, display_name, profile_image_url, is_complete, is_master, oauth_email')
    .eq('user_id', userId)
    .eq('is_master', true)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ account: data });
}

/**
 * POST /api/profile — Complete profile (set is_complete = true)
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { user_id, display_name, username } = body;

  if (!user_id || !display_name || !username) {
    return Response.json({ error: 'user_id, display_name, and username required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Check username uniqueness
  const { data: existing } = await supabase
    .from('accounts')
    .select('id')
    .eq('username', username.toLowerCase())
    .neq('user_id', user_id)
    .maybeSingle();

  if (existing) {
    return Response.json({ error: 'Username already taken' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('accounts')
    .update({
      display_name,
      username: username.toLowerCase(),
      is_complete: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user_id)
    .eq('is_master', true)
    .select('id, display_name, username, is_complete')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ account: data });
}

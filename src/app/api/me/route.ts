import { createAdminClient } from '@/lib/supabase/server';

const KB_PROJECT_ID = '896437f6-a401-40d0-bdee-d65d27714e5d';

/**
 * GET /api/me?user_id=xxx — Returns account + role for current user
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  if (!userId) return Response.json({ error: 'user_id required' }, { status: 400 });

  const supabase = createAdminClient();

  // Get account
  const { data: account } = await supabase
    .from('accounts')
    .select('id, user_id, username, display_name, profile_image_url, is_complete, oauth_email')
    .eq('user_id', userId)
    .eq('is_master', true)
    .maybeSingle();

  // Get role for this project
  const { data: roleRecord } = await supabase
    .from('presale_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('project_id', KB_PROJECT_ID)
    .maybeSingle();

  return Response.json({
    account,
    role: roleRecord?.role || null,
  });
}

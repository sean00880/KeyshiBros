import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    await supabase.from('appkit_debug_logs').insert({
      event: body.event || 'unknown',
      data: body.data || {},
      user_agent: request.headers.get('user-agent') || '',
      url: body.url || '',
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

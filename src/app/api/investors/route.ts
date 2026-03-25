import { createAdminClient } from '@/lib/supabase/server';
import { PRODUCTS, type ProductId } from '@/lib/presale-products';

const KB_PROJECT_ID = '896437f6-a401-40d0-bdee-d65d27714e5d';

/**
 * POST /api/investors — Record a presale investment
 * Called after successful Stripe checkout or Solana payment.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email, full_name, telegram_handle, wallet_address,
      delivery_wallet_address, product_id,
      payment_method, stripe_session_id, stripe_payment_intent_id,
      solana_tx_signature, usd_amount, sol_amount, sol_price_at_purchase,
      user_id,
    } = body;

    if (!email || !full_name || !payment_method) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = PRODUCTS[(product_id || 'main') as ProductId] || PRODUCTS.main;

    const supabase = createAdminClient();

    // Check for duplicate (idempotency)
    if (payment_method === 'solana' && solana_tx_signature) {
      const { data: existing } = await supabase
        .from('presale_investors')
        .select('id')
        .eq('solana_tx_signature', solana_tx_signature)
        .maybeSingle();
      if (existing) {
        return Response.json({ id: existing.id, duplicate: true });
      }
    }
    if (payment_method === 'stripe' && stripe_session_id) {
      const { data: existing } = await supabase
        .from('presale_investors')
        .select('id')
        .eq('stripe_session_id', stripe_session_id)
        .maybeSingle();
      if (existing) {
        return Response.json({ id: existing.id, duplicate: true });
      }
    }

    const { data, error } = await supabase
      .from('presale_investors')
      .insert({
        project_id: KB_PROJECT_ID,
        user_id: user_id || null,
        email,
        full_name,
        telegram_handle: telegram_handle || null,
        wallet_address: wallet_address || null,
        delivery_wallet_address: delivery_wallet_address || wallet_address || null,
        payment_method,
        stripe_session_id: stripe_session_id || null,
        stripe_payment_intent_id: stripe_payment_intent_id || null,
        solana_tx_signature: solana_tx_signature || null,
        usd_amount: usd_amount || product.usdAmount,
        sol_amount: sol_amount || null,
        sol_price_at_purchase: sol_price_at_purchase || null,
        token_allocation: product.tokenAllocation,
        status: body.status || (payment_method === 'solana' ? 'confirmed' : 'pending'),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Investors API] Insert error:', error);
      return Response.json({ error: 'Failed to record investment' }, { status: 500 });
    }

    return Response.json({ id: data.id, status: 'recorded' });
  } catch (err) {
    console.error('[Investors API] Error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/investors — Update investor status after tx confirmation
 * Called after Solana tx is confirmed or fails on-chain.
 */
export async function PATCH(request: Request) {
  try {
    const { id, status, solana_tx_signature } = await request.json();
    if (!id || !status) {
      return Response.json({ error: 'id and status required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (solana_tx_signature) {
      updateData.solana_tx_signature = solana_tx_signature;
    }

    const { error } = await supabase
      .from('presale_investors')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('[Investors API] PATCH error:', error);
      return Response.json({ error: 'Failed to update investor' }, { status: 500 });
    }

    return Response.json({ id, status });
  } catch (err) {
    console.error('[Investors API] PATCH error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * GET /api/investors — Admin endpoint to list all investors
 * Requires x-admin-secret OR x-user-id with admin/owner/superadmin role.
 */
export async function GET(request: Request) {
  const supabase = createAdminClient();

  // Auth: check secret OR role
  const secret = request.headers.get('x-admin-secret');
  const userId = request.headers.get('x-user-id');

  if (secret === process.env.ADMIN_SECRET) {
    // Legacy secret auth — OK
  } else if (userId) {
    const { data: roleRecord } = await supabase
      .from('presale_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('project_id', KB_PROJECT_ID)
      .maybeSingle();
    if (!roleRecord) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('presale_investors')
    .select('*, presale_projects(slug, name)')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: 'Failed to fetch investors' }, { status: 500 });
  }

  return Response.json({ investors: data });
}

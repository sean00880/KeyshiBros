import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';

const KB_PROJECT_ID = '896437f6-a401-40d0-bdee-d65d27714e5d';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  });
}

/**
 * POST /api/webhook — Stripe webhook handler
 *
 * Handles checkout.session.completed events:
 * 1. Verifies webhook signature
 * 2. Creates/updates presale_investors record
 * 3. Marks payment as confirmed
 */
export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return Response.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && webhookSecret !== 'whsec_your_webhook_secret_here') {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Dev mode — parse without verification
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabase = createAdminClient();

    // Update existing pending record to confirmed, or insert new one
    const { data: existing } = await supabase
      .from('presale_investors')
      .select('id')
      .eq('email', session.customer_email || '')
      .eq('payment_method', 'stripe')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Update pending → confirmed
      const { error } = await supabase
        .from('presale_investors')
        .update({
          stripe_session_id: session.id,
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          usd_amount: (session.amount_total || 0) / 100,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) console.error('[Webhook] Update error:', error);
      else console.log('[Webhook] Investor confirmed:', session.customer_email);
    } else {
      // Insert new (webhook-only, no prior record)
      const { error } = await supabase
        .from('presale_investors')
        .insert({
          project_id: KB_PROJECT_ID,
          email: session.customer_email || 'unknown',
          full_name: session.metadata?.investor_name || 'Unknown',
          telegram_handle: session.metadata?.telegram_handle || null,
          wallet_address: session.metadata?.wallet_address || null,
          payment_method: 'stripe',
          stripe_session_id: session.id,
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          usd_amount: (session.amount_total || 0) / 100,
          token_allocation: parseInt(session.metadata?.allocation || '5000000'),
          status: 'confirmed',
        });

      if (error) console.error('[Webhook] Insert error:', error);
      else console.log('[Webhook] New investor recorded:', session.customer_email);
    }
  }

  // Handle embedded PaymentIntent confirmation (no Checkout Session)
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const supabase = createAdminClient();

    if (pi.metadata?.project === 'keyshi-bros') {
      // Update any pending record with this payment intent
      const { data: existing } = await supabase
        .from('presale_investors')
        .select('id')
        .eq('stripe_payment_intent_id', pi.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('presale_investors')
          .update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        console.log('[Webhook] PaymentIntent confirmed:', pi.id);
      } else {
        // Record from embedded checkout (investor already recorded client-side, just confirm)
        const { data: pending } = await supabase
          .from('presale_investors')
          .select('id')
          .eq('email', pi.metadata?.investor_name ? undefined : '')
          .eq('payment_method', 'stripe')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pending) {
          await supabase
            .from('presale_investors')
            .update({
              stripe_payment_intent_id: pi.id,
              status: 'confirmed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', pending.id);
        }
        console.log('[Webhook] PaymentIntent recorded:', pi.id);
      }
    }
  }

  return Response.json({ received: true });
}

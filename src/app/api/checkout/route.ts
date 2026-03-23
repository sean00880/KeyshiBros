import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2026-02-25.clover' });
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const { name, email, telegram, wallet_address } = body;

    if (!email || !name) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || 'https://keyshibros.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Keyshi Bros Private Sale — 0.5% Token Allocation',
              description: '5,000,000 $KB tokens (0.5% of 500M total supply). Private investor early-entry valuation.',
            },
            unit_amount: 450000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: {
        investor_name: name,
        telegram_handle: telegram || '',
        wallet_address: wallet_address || '',
        allocation: '5000000',
        supply_percent: '0.5',
      },
      success_url: `${origin}/join-presale?status=success`,
      cancel_url: `${origin}/join-presale?status=cancelled`,
    });

    return Response.json({ url: session.url });
  } catch (error: any) {
    const message = error?.message || 'Unknown error';
    const code = error?.code || error?.type || 'unknown';
    console.error('Stripe checkout error:', { message, code, type: error?.type });

    // Return actionable error to frontend
    return Response.json(
      { error: `Checkout failed: ${message}`, code },
      { status: 500 }
    );
  }
}

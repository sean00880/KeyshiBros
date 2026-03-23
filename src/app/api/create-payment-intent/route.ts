import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
}

/**
 * POST /api/create-payment-intent
 * Creates a PaymentIntent for embedded on-site checkout.
 * Returns client_secret for Stripe Elements to render the payment form.
 */
export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const { name, email, telegram, wallet_address } = body;

    if (!email || !name) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Find or create customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer: Stripe.Customer;

    if (customers.data.length > 0) {
      customer = customers.data[0]!;
    } else {
      customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          project: 'keyshi-bros',
          telegram_handle: telegram || '',
          wallet_address: wallet_address || '',
        },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 450000, // $4,500.00
      currency: 'usd',
      customer: customer.id,
      metadata: {
        project: 'keyshi-bros',
        investor_name: name,
        telegram_handle: telegram || '',
        wallet_address: wallet_address || '',
        allocation: '5000000',
        supply_percent: '0.5',
      },
      automatic_payment_methods: { enabled: true },
      description: 'Keyshi Bros Private Sale — 5M $KB tokens (0.5% of 500M supply)',
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('PaymentIntent error:', error?.message);
    return Response.json(
      { error: error?.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}

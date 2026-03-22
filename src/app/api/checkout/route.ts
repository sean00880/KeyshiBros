import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, telegram } = body;

    if (!email || !name) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Keyshi Bros Private Sale — 1% Token Allocation',
              description: '10,000,000 $KB tokens (1% of 1B total supply). Private investor early-entry valuation.',
              images: ['https://keyshibros.com/assets/images/keyshibros2.png'],
            },
            unit_amount: 900000, // $9,000.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      metadata: {
        investor_name: name,
        telegram_handle: telegram || '',
        allocation: '10000000',
        supply_percent: '1',
      },
      success_url: `${request.headers.get('origin')}/join-presale?status=success`,
      cancel_url: `${request.headers.get('origin')}/join-presale?status=cancelled`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

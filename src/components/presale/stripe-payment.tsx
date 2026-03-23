"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CheckCircle, CircleNotch, XCircle, ShieldCheck } from '@phosphor-icons/react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

interface StripePaymentProps {
  name: string;
  email: string;
  telegram: string;
  walletAddress: string;
  userId?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
}

function CheckoutForm({ name, email, telegram, walletAddress, userId, onSuccess, onError }: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setStatus('processing');
    setErrorMsg('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/join-presale?status=success`,
        payment_method_data: {
          billing_details: { name, email },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message || 'Payment failed');
      onError(error.message || 'Payment failed');
    } else if (paymentIntent?.status === 'succeeded') {
      setStatus('success');

      // Record investor in DB
      fetch('/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: name,
          telegram_handle: telegram,
          wallet_address: walletAddress,
          payment_method: 'stripe',
          stripe_payment_intent_id: paymentIntent.id,
          usd_amount: 4500,
          user_id: userId,
        }),
      }).catch(() => {});

      onSuccess(paymentIntent.id);
    } else {
      // Payment requires additional action (3D Secure etc.) — redirect handles it
      setStatus('idle');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Product summary */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.05] border border-white/10">
        <img src="/icon.png" alt="Keyshi Bros" className="w-12 h-12 rounded-lg" />
        <div className="flex-1">
          <div className="text-white text-sm font-bold">Keyshi Bros Private Sale</div>
          <div className="text-white/40 text-xs">5,000,000 $KB tokens · 0.5% of supply</div>
        </div>
        <div className="text-white font-bold text-lg font-mono">$4,500</div>
      </div>

      {/* Stripe Payment Element */}
      <div className="rounded-xl overflow-hidden">
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: { name, email },
            },
          }}
        />
      </div>

      {/* Status */}
      {status === 'success' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle weight="fill" className="text-green-400" size={20} />
          <span className="text-green-400 text-sm font-bold">Payment successful — allocation reserved</span>
        </motion.div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-400/10 border border-red-400/20">
          <XCircle weight="fill" className="text-red-400" size={20} />
          <span className="text-red-400 text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Pay button */}
      <button
        type="submit"
        disabled={!stripe || !elements || status === 'processing' || status === 'success'}
        className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold text-sm tracking-wide hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {status === 'processing' ? (
          <><CircleNotch size={18} className="animate-spin" /> Processing...</>
        ) : status === 'success' ? (
          <><CheckCircle size={18} weight="fill" /> Payment Complete</>
        ) : (
          <>Pay $4,500</>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-white/20">
        <ShieldCheck size={12} weight="duotone" />
        <span className="text-[9px] uppercase tracking-[0.15em] font-mono">Secured by Stripe</span>
      </div>
    </form>
  );
}

export function StripePayment(props: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: props.name,
        email: props.email,
        telegram: props.telegram,
        wallet_address: props.walletAddress,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setError(data.error || 'Failed to initialize payment');
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [props.name, props.email, props.telegram, props.walletAddress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <CircleNotch size={24} className="text-white/30 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
        {error}
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#ffffff',
            colorBackground: '#0d0d12',
            colorText: '#e8eaed',
            colorDanger: '#ef4444',
            fontFamily: '"Space Grotesk", sans-serif',
            borderRadius: '12px',
            spacingUnit: '4px',
          },
          rules: {
            '.Input': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e8eaed',
            },
            '.Input:focus': {
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: 'none',
            },
            '.Label': {
              color: 'rgba(255,255,255,0.3)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontFamily: '"JetBrains Mono", monospace',
            },
            '.Tab': {
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)',
            },
            '.Tab--selected': {
              backgroundColor: '#ffffff',
              color: '#0d0d12',
            },
          },
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}

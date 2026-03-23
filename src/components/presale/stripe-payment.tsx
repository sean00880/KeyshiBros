"use client";

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CheckCircle, CircleNotch, XCircle, ShieldCheck, CreditCard } from '@phosphor-icons/react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'error';

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

  const recordInvestor = useCallback((paymentIntentId: string) => {
    fetch('/api/investors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, full_name: name, telegram_handle: telegram,
        wallet_address: walletAddress, payment_method: 'stripe',
        stripe_payment_intent_id: paymentIntentId,
        usd_amount: 4500, user_id: userId,
      }),
    }).catch(() => {});
  }, [email, name, telegram, walletAddress, userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (status === 'processing' || status === 'succeeded') return;

    setStatus('processing');
    setErrorMsg('');

    // Validate the form fields first
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setStatus('error');
      setErrorMsg(submitError.message || 'Please check your payment details');
      return;
    }

    // Confirm the payment
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
    } else if (paymentIntent) {
      if (paymentIntent.status === 'succeeded') {
        setStatus('succeeded');
        recordInvestor(paymentIntent.id);
        onSuccess(paymentIntent.id);
      } else if (paymentIntent.status === 'processing') {
        // ACH/bank transfers — payment is pending
        setStatus('processing');
      } else {
        // requires_action handled by redirect
        setStatus('idle');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Product card — image on top */}
      <div className="rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden">
        <div className="flex justify-center p-5 bg-white/[0.02]">
          <img src="/icon.png" alt="Keyshi Bros" className="w-20 h-20 rounded-2xl" />
        </div>
        <div className="px-4 pb-4 text-center">
          <div className="text-white font-bold">Keyshi Bros Private Sale</div>
          <div className="text-white/40 text-xs mt-1">5,000,000 $KB tokens · 0.5% of supply</div>
          <div className="text-white font-bold text-3xl font-mono mt-3">$4,500</div>
          <div className="flex items-center justify-center gap-1.5 mt-2 opacity-30">
            <ShieldCheck size={10} weight="fill" className="text-white" />
            <span className="text-white text-[8px] font-mono uppercase tracking-widest">Powered by Stripe</span>
          </div>
        </div>
      </div>

      {/* Stripe Payment Element — card fields render here */}
      <PaymentElement
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: { name, email },
          },
          business: { name: 'Keyshi Bros' },
        }}
      />

      {/* Status */}
      {status === 'succeeded' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle weight="fill" className="text-green-400" size={20} />
          <span className="text-green-400 text-sm font-bold">Payment successful — allocation reserved</span>
        </motion.div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-400/10 border border-red-400/20">
          <XCircle weight="fill" className="text-red-400 flex-shrink-0" size={20} />
          <span className="text-red-400 text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Pay button */}
      <button
        type="submit"
        disabled={!stripe || !elements || status === 'processing' || status === 'succeeded'}
        className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold text-sm tracking-wide hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
      >
        {status === 'processing' ? (
          <><CircleNotch size={18} className="animate-spin" /> Processing payment...</>
        ) : status === 'succeeded' ? (
          <><CheckCircle size={18} weight="fill" className="text-green-600" /> Payment Complete</>
        ) : (
          <>
            <CreditCard size={18} weight="fill" />
            Pay $4,500
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-white/20">
        <ShieldCheck size={12} weight="duotone" />
        <span className="text-[9px] uppercase tracking-[0.15em] font-mono">256-bit SSL · PCI compliant</span>
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
    setError('');
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: props.name, email: props.email,
        telegram: props.telegram, wallet_address: props.walletAddress,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.clientSecret) setClientSecret(data.clientSecret);
        else setError(data.error || 'Failed to initialize payment');
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-3">
        <CircleNotch size={20} className="text-white/30 animate-spin" />
        <span className="text-white/30 text-xs font-mono">Initializing secure payment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</div>
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
              textTransform: 'uppercase' as const,
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

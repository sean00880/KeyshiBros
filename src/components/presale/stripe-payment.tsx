"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CheckCircle, CircleNotch, XCircle, ShieldCheck, CreditCard } from '@phosphor-icons/react';

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
  const [ready, setReady] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || status === 'processing') return;

    setStatus('processing');
    setErrorMsg('');

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/join-presale?status=success`,
        payment_method_data: {
          billing_details: { name, email },
        },
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setStatus('error');
      const msg = result.error.message || 'Payment failed';
      setErrorMsg(msg);
      onError(msg);
      return;
    }

    const pi = result.paymentIntent;
    if (pi?.status === 'succeeded') {
      setStatus('success');
      fetch('/api/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, full_name: name, telegram_handle: telegram,
          wallet_address: walletAddress, payment_method: 'stripe',
          stripe_payment_intent_id: pi.id, usd_amount: 4500, user_id: userId,
        }),
      }).catch(() => {});
      onSuccess(pi.id);
    } else if (pi?.status === 'processing') {
      // Card networks like ACH take time — show pending
      setStatus('processing');
    } else if (pi?.status === 'requires_action') {
      // 3D Secure or other action — Stripe Elements handles this automatically
      // If redirect: 'if_required' triggers a redirect, this won't be reached
      setStatus('idle');
    } else {
      // Fallback — redirect will handle it
      setStatus('idle');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Product card */}
      <div className="rounded-xl bg-white/[0.05] border border-white/10 overflow-hidden">
        <div className="flex justify-center p-4 bg-white/[0.03]">
          <img src="/icon.png" alt="Keyshi Bros" className="w-16 h-16 rounded-xl" />
        </div>
        <div className="p-4 text-center">
          <div className="text-white text-sm font-bold">Keyshi Bros Private Sale</div>
          <div className="text-white/40 text-xs mt-0.5">5,000,000 $KB tokens · 0.5% of supply</div>
          <div className="text-white font-bold text-2xl font-mono mt-2">$4,500</div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <svg viewBox="0 0 60 25" className="h-3 opacity-40" fill="white">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a13.3 13.3 0 0 1-4.56.83c-4.14 0-6.87-2.37-6.87-7.15 0-4.23 2.34-7.49 6.28-7.49 3.97 0 5.96 3.02 5.96 7.28v1.61zm-4.11-5.59c-1.26 0-2.18.96-2.32 2.7h4.54c-.04-1.63-.81-2.7-2.22-2.7zM40.84 18.33c-1.47 0-2.85-.5-3.57-1.07l-.05 4.65h-4.22V6.04h3.48l.28 1.3c.87-.95 2.22-1.6 3.86-1.6 3.48 0 5.76 3.13 5.76 6.91s-2.31 5.68-5.54 5.68zm-.72-9.22c-1.04 0-1.84.42-2.35 1.04v4.58c.5.5 1.22.87 2.27.87 1.72 0 2.72-1.43 2.72-3.35 0-1.88-.93-3.14-2.64-3.14zM28.24 5.71c-2.07 0-3.47.45-4.52 1.11V.45h-4.22v17.2h4.22v-7.7c0-1.47 1.02-2.15 2.48-2.15.52 0 1.08.07 1.53.18V5.71h.51zM15.78 6.04h-3.5l-.33-1.87C11.12 5 9.73 5.71 8.06 5.71c-2.72 0-4.56-1.72-4.56-4.36C3.5.86 5.1 0 8.3 0c1.79 0 3.57.31 5.15.87l.33-2.08h4V17.65h-2V6.04zm0 1.45c-.68-.28-1.7-.5-2.95-.5-1.46 0-2.25.45-2.25 1.36s.71 1.35 1.99 1.35c1.38 0 2.46-.62 3.21-1.4V7.49zM4.22 12.66c0 2.57 1.58 4.85 5.28 4.85.92 0 1.99-.17 2.67-.41v-3.43c-.56.14-1.2.22-1.77.22-1.73 0-2.28-.79-2.28-1.98V9.32h3.86V6.04H8.12V2.35L4.22 3.1v9.56z"/>
            </svg>
            <span className="text-white/20 text-[9px] font-mono uppercase tracking-widest">Powered by Stripe</span>
          </div>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="rounded-xl overflow-hidden">
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: { name, email },
            },
          }}
        />
      </div>

      {/* Status messages */}
      {status === 'success' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
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

      {/* Pay button with Stripe logo */}
      <button
        type="submit"
        disabled={!stripe || !elements || !ready || status === 'processing' || status === 'success'}
        className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold text-sm tracking-wide hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
      >
        {status === 'processing' ? (
          <><CircleNotch size={18} className="animate-spin" /> Processing payment...</>
        ) : status === 'success' ? (
          <><CheckCircle size={18} weight="fill" /> Payment Complete</>
        ) : (
          <>
            <CreditCard size={18} weight="fill" />
            Pay $4,500
            <span className="text-gray-400 text-xs ml-1">via</span>
            <svg viewBox="0 0 60 25" className="h-3.5" fill="currentColor">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a13.3 13.3 0 0 1-4.56.83c-4.14 0-6.87-2.37-6.87-7.15 0-4.23 2.34-7.49 6.28-7.49 3.97 0 5.96 3.02 5.96 7.28v1.61zm-4.11-5.59c-1.26 0-2.18.96-2.32 2.7h4.54c-.04-1.63-.81-2.7-2.22-2.7zM40.84 18.33c-1.47 0-2.85-.5-3.57-1.07l-.05 4.65h-4.22V6.04h3.48l.28 1.3c.87-.95 2.22-1.6 3.86-1.6 3.48 0 5.76 3.13 5.76 6.91s-2.31 5.68-5.54 5.68zm-.72-9.22c-1.04 0-1.84.42-2.35 1.04v4.58c.5.5 1.22.87 2.27.87 1.72 0 2.72-1.43 2.72-3.35 0-1.88-.93-3.14-2.64-3.14zM28.24 5.71c-2.07 0-3.47.45-4.52 1.11V.45h-4.22v17.2h4.22v-7.7c0-1.47 1.02-2.15 2.48-2.15.52 0 1.08.07 1.53.18V5.71h.51zM15.78 6.04h-3.5l-.33-1.87C11.12 5 9.73 5.71 8.06 5.71c-2.72 0-4.56-1.72-4.56-4.36C3.5.86 5.1 0 8.3 0c1.79 0 3.57.31 5.15.87l.33-2.08h4V17.65h-2V6.04zm0 1.45c-.68-.28-1.7-.5-2.95-.5-1.46 0-2.25.45-2.25 1.36s.71 1.35 1.99 1.35c1.38 0 2.46-.62 3.21-1.4V7.49zM4.22 12.66c0 2.57 1.58 4.85 5.28 4.85.92 0 1.99-.17 2.67-.41v-3.43c-.56.14-1.2.22-1.77.22-1.73 0-2.28-.79-2.28-1.98V9.32h3.86V6.04H8.12V2.35L4.22 3.1v9.56z"/>
            </svg>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-white/20">
        <ShieldCheck size={12} weight="duotone" />
        <span className="text-[9px] uppercase tracking-[0.15em] font-mono">256-bit SSL encryption · PCI compliant</span>
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
  }, []); // Only create PaymentIntent once

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-3">
        <CircleNotch size={20} className="text-white/30 animate-spin" />
        <span className="text-white/30 text-xs font-mono">Initializing payment...</span>
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

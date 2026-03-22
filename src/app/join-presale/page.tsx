"use client";

import { useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  Coins,
  GameController,
  RocketLaunch,
  Storefront,
  Trophy,
  ArrowLeft,
  CreditCard,
  CheckCircle,
  XCircle,
  Wallet,
  CaretRight,
  AppleLogo,
  GooglePlayLogo,
} from '@phosphor-icons/react';
import { useSearchParams } from 'next/navigation';

type PaymentMethod = 'card' | 'solana';

export default function JoinPresaleWrapper() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-kb-bg" />}>
      <JoinPresalePage />
    </Suspense>
  );
}

function JoinPresalePage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const [method, setMethod] = useState<PaymentMethod>('card');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [solWallet, setSolWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formValid = useMemo(() => {
    if (!name.trim() || !email.trim()) return false;
    if (method === 'solana' && !solWallet.trim()) return false;
    return true;
  }, [name, email, method, solWallet]);

  async function handleStripeCheckout() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, telegram }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSolanaPayment() {
    setLoading(true);
    setError('');
    try {
      // Dynamic import to avoid SSR issues
      const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = await import('@solana/web3.js');

      const provider = (window as any).solana;
      if (!provider?.isPhantom && !provider) {
        setError('Please install Phantom or a Solana wallet extension.');
        setLoading(false);
        return;
      }

      await provider.connect();
      const senderPubkey = provider.publicKey;

      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
        'confirmed'
      );

      const PRESALE_WALLET = new PublicKey(
        process.env.NEXT_PUBLIC_PRESALE_SOL_WALLET || '11111111111111111111111111111111'
      );
      const solAmount = parseFloat(process.env.NEXT_PUBLIC_PRESALE_SOL_AMOUNT || '60');
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPubkey,
          toPubkey: PRESALE_WALLET,
          lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubkey;

      const signed = await provider.signAndSendTransaction(transaction);

      // Success — redirect with tx signature
      window.location.href = `/join-presale?status=success&tx=${signed.signature}`;
    } catch (err: any) {
      if (err?.code === 4001) {
        setError('Transaction rejected by wallet.');
      } else {
        setError(err?.message || 'Solana transaction failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit() {
    if (!formValid) return;
    if (method === 'card') handleStripeCheckout();
    else handleSolanaPayment();
  }

  // Success / Cancelled states
  if (status === 'success') {
    return (
      <div className="min-h-svh bg-kb-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <CheckCircle weight="fill" className="text-green-400 mx-auto mb-6" size={80} />
          <h1 className="text-3xl font-bold text-white mb-4">Payment Received</h1>
          <p className="text-white/60 mb-8 leading-relaxed">
            Thank you for joining the Keyshi Bros private sale. Your allocation of 10,000,000 $KB tokens (1% of supply) has been reserved.
            We&apos;ll be in touch via email with next steps.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="min-h-svh bg-kb-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <XCircle weight="fill" className="text-red-400 mx-auto mb-6" size={80} />
          <h1 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h1>
          <p className="text-white/60 mb-8">No charges were made. You can try again when ready.</p>
          <Link
            href="/join-presale"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors"
          >
            Try Again
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-kb-bg relative">
      {/* Background */}
      <div className="absolute inset-0 bg-cyber-grid opacity-5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-white/[0.02] blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-12 text-sm"
        >
          <ArrowLeft size={16} />
          Back to KeyshiBros
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
            <Star weight="fill" className="text-white/80" size={14} />
            <span className="text-xs font-bold text-white/80 uppercase tracking-[0.2em]">Private Invitation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-4">
            Exclusive Early Ownership
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            You are invited to secure <span className="text-white font-semibold">1% of the total Keyshibros token supply</span> —
            10,000,000 tokens out of 1,000,000,000 — at a special early-entry valuation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 flex flex-col gap-8"
          >
            {/* Investment Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { label: 'Total Supply', value: '1,000,000,000', sub: '$KB Tokens' },
                  { label: 'Your Allocation', value: '10,000,000', sub: '1% of Supply' },
                  { label: 'Investment', value: '$9,000', sub: 'USD or SOL equivalent' },
                  { label: 'Tax', value: '0%', sub: 'Zero Tax Forever' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1">{item.label}</div>
                    <div className="text-xl md:text-2xl font-bold text-white tracking-tight">{item.value}</div>
                    <div className="text-xs text-white/40 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <GameController weight="fill" size={20} />
                  Why Keyshibros?
                </h3>
                <div className="flex flex-col gap-4">
                  {[
                    {
                      icon: GameController,
                      title: 'Live Mobile Game',
                      desc: 'Already on App Store & Google Play. Join Shiba & Momo battling Pepe\'s minions in FOMOland.',
                      links: [
                        { label: 'App Store', href: 'https://apps.apple.com/us/app/keyshi-bros/id6742747011', icon: AppleLogo },
                        { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.zerogravity.keyshibros', icon: GooglePlayLogo },
                      ],
                    },
                    {
                      icon: RocketLaunch,
                      title: 'Version 2 — July 2026',
                      desc: 'In-game marketplace for power-ups, outfits, custom characters. Casual play becomes real economic activity.',
                    },
                    {
                      icon: Storefront,
                      title: 'Revenue-Generating Ecosystem',
                      desc: 'Marketplace transactions drive revenue directly back into the project, creating sustainable value.',
                    },
                    {
                      icon: Trophy,
                      title: 'Staking Rewards for Holders',
                      desc: 'Token holders earn passive rewards as the game grows. No lock-up — just hold $KB and earn.',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
                        <item.icon weight="duotone" className="text-white/60" size={20} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                        <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                        {'links' in item && item.links && (
                          <div className="flex gap-3 mt-2">
                            {item.links.map((link, j) => (
                              <a
                                key={j}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
                              >
                                <link.icon size={14} />
                                {link.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <ShieldCheck weight="fill" size={20} />
                Key Benefits of Early Ownership
              </h3>
              <ul className="flex flex-col gap-3">
                {[
                  'Significant allocation (1% of supply) at pre-launch pricing',
                  'Priority access to staking and future ecosystem perks',
                  'Alignment with real revenue from in-game purchases and marketplace fees',
                  'Positioned for growth as Version 2 attracts mainstream mobile gamers into crypto',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/50 text-sm leading-relaxed">
                    <CheckCircle weight="fill" className="text-white/30 flex-shrink-0 mt-0.5" size={16} />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <p className="text-white/20 text-[10px] font-mono leading-relaxed">
              This is not financial advice. Token allocations are subject to smart contract deployment on Solana mainnet.
              By proceeding with payment, you acknowledge this is a private investment in an early-stage GameFi project.
              All sales are final. Tokens will be distributed after the Token Generation Event (TGE).
            </p>
          </motion.div>

          {/* Right: Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 flex flex-col gap-6">

              <div className="text-center">
                <div className="text-4xl font-bold text-white tracking-tighter">$9,000</div>
                <div className="text-white/40 text-sm mt-1">10,000,000 $KB Tokens</div>
              </div>

              <div className="h-px bg-white/10" />

              {/* Payment method toggle */}
              <div className="flex p-1 rounded-xl bg-white/[0.05] border border-white/10">
                <button
                  onClick={() => setMethod('card')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    method === 'card'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <CreditCard size={16} weight={method === 'card' ? 'fill' : 'regular'} />
                  Card
                </button>
                <button
                  onClick={() => setMethod('solana')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    method === 'solana'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  <Wallet size={16} weight={method === 'solana' ? 'fill' : 'regular'} />
                  Solana
                </button>
              </div>

              {/* Form fields */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1.5 block">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1.5 block">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@example.com"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1.5 block">Telegram Handle</label>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  />
                </div>

                <AnimatePresence>
                  {method === 'solana' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1.5 block">Your Solana Wallet *</label>
                      <input
                        type="text"
                        value={solWallet}
                        onChange={(e) => setSolWallet(e.target.value)}
                        placeholder="Your SOL address for token delivery"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm font-mono text-xs"
                      />
                      <p className="text-white/20 text-[10px] mt-1.5">This is where your $KB tokens will be sent after TGE.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error */}
              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!formValid || loading}
                className="group w-full py-4 rounded-xl bg-white text-gray-900 font-bold text-sm tracking-wide hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                ) : method === 'card' ? (
                  <>
                    Pay $9,000 via Stripe
                    <CaretRight weight="bold" size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    <Wallet size={16} weight="fill" />
                    Pay with Solana
                  </>
                )}
              </button>

              {/* Trust signals */}
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                {[
                  { icon: ShieldCheck, label: 'Secure' },
                  { icon: Coins, label: 'Solana' },
                  { icon: Star, label: 'Invite Only' },
                ].map((signal, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-white/20">
                    <signal.icon size={12} weight="duotone" />
                    <span className="text-[9px] uppercase tracking-[0.15em] font-mono">{signal.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

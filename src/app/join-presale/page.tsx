"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Star, ShieldCheck, Coins, GameController, RocketLaunch, Storefront, Trophy,
  ArrowLeft, CreditCard, CheckCircle, XCircle, Wallet, CaretRight,
  AppleLogo, GooglePlayLogo, ArrowsClockwise, GoogleLogo,
} from '@phosphor-icons/react';
import { useSearchParams } from 'next/navigation';
import { AppKitProvider } from '@/components/providers/appkit-provider';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-solana';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { TxTracker, type TxStage } from '@/components/presale/tx-tracker';
import { createClient } from '@/lib/supabase/client';

type PaymentMethod = 'card' | 'solana';

interface SolPrice {
  solPrice: number;
  solAmount: number;
  presaleUsd: number;
  timestamp: number;
}

export default function JoinPresaleWrapper() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-kb-bg" />}>
      <AppKitProvider>
        <JoinPresalePage />
      </AppKitProvider>
    </Suspense>
  );
}

function JoinPresalePage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const txParam = searchParams.get('tx');

  const [method, setMethod] = useState<PaymentMethod>('card');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txStage, setTxStage] = useState<TxStage>('idle');
  const [txSignature, setTxSignature] = useState('');

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Reown AppKit wallet
  const { address: walletAddress, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('solana');

  // SOL price from Jupiter oracle
  const [solPrice, setSolPrice] = useState<SolPrice | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  const fetchPrice = useCallback(async () => {
    setPriceLoading(true);
    try {
      const res = await fetch('/api/sol-price');
      if (res.ok) setSolPrice(await res.json());
    } catch { /* silent */ } finally {
      setPriceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  // Check Supabase auth on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto-fill email from OAuth
  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
    if (user?.user_metadata?.full_name && !name) setName(user.user_metadata.full_name);
  }, [user, email, name]);

  async function handleGoogleSignIn() {
    setAuthLoading(true);
    try {
      const supabase = createClient();
      // Per-domain PKCE pattern (same as MEMELinked SessionManager):
      // Build callback URL on THIS domain with ?next= for post-auth redirect
      const currentPath = window.location.pathname + window.location.search;
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('next', currentPath);

      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
          skipBrowserRedirect: false,
        },
      });
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  const formValid = name.trim() && email.trim() && (method === 'card' || (method === 'solana' && isConnected && solPrice));

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
      if (data.url) window.location.href = data.url;
      else setError(data.error || 'Failed to create checkout');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSolanaPayment() {
    if (!walletProvider || !walletAddress || !solPrice) return;
    setLoading(true);
    setError('');
    setTxStage('signing');

    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
        'confirmed'
      );
      const senderPubkey = new PublicKey(walletAddress);
      const PRESALE_WALLET = new PublicKey(process.env.NEXT_PUBLIC_PRESALE_SOL_WALLET!);
      const lamports = Math.floor(solPrice.solAmount * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: senderPubkey, toPubkey: PRESALE_WALLET, lamports })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubkey;

      const signed = await walletProvider.signAndSendTransaction(transaction);
      const sig = typeof signed === 'string' ? signed : (signed as any).signature;
      setTxSignature(sig);
      setTxStage('confirming');

      const confirmation = await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      if (confirmation.value.err) {
        setTxStage('error');
        setError('Transaction failed on-chain.');
      } else {
        setTxStage('success');
      }
    } catch (err: any) {
      setTxStage('error');
      setError(err?.code === 4001 ? 'Transaction rejected.' : (err?.message || 'Transaction failed.'));
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
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <CheckCircle weight="fill" className="text-green-400 mx-auto mb-6" size={80} />
          <h1 className="text-3xl font-bold text-white mb-4">Payment Received</h1>
          <p className="text-white/60 mb-4 leading-relaxed">
            Your allocation of 5,000,000 $KB tokens (0.5% of supply) has been reserved.
          </p>
          {txParam && (
            <a href={`https://solscan.io/tx/${txParam}`} target="_blank" rel="noopener noreferrer"
              className="text-white/40 hover:text-white/70 text-xs font-mono underline underline-offset-4 block mb-8">
              View on Solscan
            </a>
          )}
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} /> Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="min-h-svh bg-kb-bg flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <XCircle weight="fill" className="text-red-400 mx-auto mb-6" size={80} />
          <h1 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h1>
          <p className="text-white/60 mb-8">No charges were made.</p>
          <Link href="/join-presale" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors">Try Again</Link>
        </motion.div>
      </div>
    );
  }

  const isAuthed = !!user;

  return (
    <div className="min-h-svh bg-kb-bg relative">
      <div className="absolute inset-0 bg-cyber-grid opacity-5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-white/[0.02] blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-12 text-sm">
          <ArrowLeft size={16} /> Back to KeyshiBros
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
            <Star weight="fill" className="text-white/80" size={14} />
            <span className="text-xs font-bold text-white/80 uppercase tracking-[0.2em]">Private Invitation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-4">Exclusive Early Ownership</h1>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            You are invited to secure <span className="text-white font-semibold">0.5% of the total Keyshibros token supply</span> —
            5,000,000 tokens out of 500,000,000 — at a special early-entry valuation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3 flex flex-col gap-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { label: 'Total Supply', value: '500,000,000', sub: '$KB Tokens' },
                  { label: 'Your Allocation', value: '5,000,000', sub: '0.5% of Supply' },
                  { label: 'Investment', value: '$4,500', sub: 'USD or SOL equivalent' },
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
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><GameController weight="fill" size={20} /> Why Keyshibros?</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: GameController, title: 'Live Mobile Game', desc: 'Already on App Store & Google Play. Join Shiba & Momo battling Pepe\'s minions in FOMOland.',
                      links: [
                        { label: 'App Store', href: 'https://apps.apple.com/us/app/keyshi-bros/id6742747011', icon: AppleLogo },
                        { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.zerogravity.keyshibros', icon: GooglePlayLogo },
                      ] },
                    { icon: RocketLaunch, title: 'Version 2 — July 2026', desc: 'In-game marketplace for power-ups, outfits, custom characters.' },
                    { icon: Storefront, title: 'Revenue-Generating Ecosystem', desc: 'Marketplace transactions drive revenue directly back into the project.' },
                    { icon: Trophy, title: 'Staking Rewards for Holders', desc: 'Token holders earn passive rewards as the game grows.' },
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
                              <a key={j} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
                                <link.icon size={14} />{link.label}
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
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><ShieldCheck weight="fill" size={20} /> Key Benefits of Early Ownership</h3>
              <ul className="flex flex-col gap-3">
                {['Significant allocation (0.5% of supply) at pre-launch pricing', 'Priority access to staking and future ecosystem perks', 'Alignment with real revenue from in-game purchases and marketplace fees', 'Positioned for growth as Version 2 attracts mainstream mobile gamers into crypto'].map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/50 text-sm leading-relaxed">
                    <CheckCircle weight="fill" className="text-white/30 flex-shrink-0 mt-0.5" size={16} />{b}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-white/20 text-[10px] font-mono leading-relaxed">
              This is not financial advice. Token allocations are subject to smart contract deployment on Solana mainnet.
              All sales are final. Tokens will be distributed after the Token Generation Event (TGE).
            </p>
          </motion.div>

          {/* Right: Payment Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 flex flex-col gap-6">

              {/* Price header */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white tracking-tighter">$4,500</div>
                <div className="text-white/40 text-sm mt-1">5,000,000 $KB Tokens</div>
                <AnimatePresence mode="wait">
                  {method === 'solana' && solPrice && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10">
                        <span className="text-white font-mono font-bold text-sm">{solPrice.solAmount} SOL</span>
                        <span className="text-white/30 text-[10px]">@ ${solPrice.solPrice}/SOL</span>
                        <button onClick={fetchPrice} disabled={priceLoading} className="text-white/30 hover:text-white/60 transition-colors" title="Refresh price">
                          <ArrowsClockwise size={12} className={priceLoading ? 'animate-spin' : ''} />
                        </button>
                      </div>
                      <div className="text-white/20 text-[9px] font-mono mt-1">Live via Jupiter Oracle · 30s refresh</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-px bg-white/10" />

              {/* Google OAuth gate */}
              {!isAuthed ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="text-white/50 text-sm text-center">Sign in to access the private sale</div>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full py-3.5 rounded-xl bg-white text-gray-900 font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {authLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                    ) : (
                      <GoogleLogo size={18} weight="bold" />
                    )}
                    Continue with Google
                  </button>
                  <div className="text-white/20 text-[10px] font-mono">Secure OAuth via GROWSZ Identity</div>
                </div>
              ) : (
                <>
                  {/* Payment method toggle */}
                  <div className="flex p-1 rounded-xl bg-white/[0.05] border border-white/10">
                    <button onClick={() => setMethod('card')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${method === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/50 hover:text-white/70'}`}>
                      <CreditCard size={16} weight={method === 'card' ? 'fill' : 'regular'} /> Card
                    </button>
                    <button onClick={() => setMethod('solana')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${method === 'solana' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/50 hover:text-white/70'}`}>
                      <Wallet size={16} weight={method === 'solana' ? 'fill' : 'regular'} /> Solana
                    </button>
                  </div>

                  {/* Signed-in user info */}
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10">
                    <CheckCircle weight="fill" className="text-green-400 flex-shrink-0" size={14} />
                    <div className="min-w-0">
                      <div className="text-white/70 text-xs truncate">{user?.email}</div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1.5 block">Full Name *</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1.5 block">Telegram Handle</label>
                      <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@yourhandle"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm" />
                    </div>

                    {/* Solana: AppKit wallet button */}
                    <AnimatePresence>
                      {method === 'solana' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-3">
                          <appkit-button balance="hide" />
                          {isConnected && walletAddress && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                              <CheckCircle weight="fill" className="text-green-400" size={14} />
                              <span className="text-green-400 text-[10px] font-mono truncate">{walletAddress}</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tx tracker */}
                  <TxTracker
                    stage={txStage}
                    txSignature={txSignature}
                    error={error}
                    onDismiss={() => {
                      setTxStage('idle');
                      setTxSignature('');
                      setError('');
                      if (txStage === 'success') {
                        window.location.href = `/join-presale?status=success&tx=${txSignature}`;
                      }
                    }}
                  />

                  {/* Error (non-tx) */}
                  {error && txStage === 'idle' && (
                    <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</div>
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
                      <>Pay $4,500 via Stripe <CaretRight weight="bold" size={16} className="group-hover:translate-x-0.5 transition-transform" /></>
                    ) : (
                      <><Wallet size={16} weight="fill" /> Pay {solPrice ? `${solPrice.solAmount} SOL` : 'with Solana'}</>
                    )}
                  </button>

                  {/* Trust signals */}
                  <div className="flex flex-wrap justify-center gap-4 pt-2">
                    {[{ icon: ShieldCheck, label: 'Secure' }, { icon: Coins, label: 'Solana' }, { icon: Star, label: 'Invite Only' }].map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-white/20">
                        <s.icon size={12} weight="duotone" />
                        <span className="text-[9px] uppercase tracking-[0.15em] font-mono">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from 'framer-motion';
import { usePresale } from '../../lib/hooks/use-presale';
import { ShieldCheck, LockKey, CurrencyCircleDollar, CreditCard, CaretRight } from '@phosphor-icons/react';

export function PresaleModule() {
  const { paymentMode, setPaymentMode, amount, setAmount, tokenAmount, tokenPrice, setPreset } = usePresale();

  const tiers = [
    { name: 'Seed', percent: 100, price: '$0.02', filled: true },
    { name: 'Private', percent: 100, price: '$0.03', filled: true },
    { name: 'Public 1', percent: 85, price: '$0.045', filled: false, current: true },
    { name: 'Public 2', percent: 0, price: '$0.06', filled: false },
  ];

  const presets = ['100', '500', '1000', '2500', '5000', 'MAX'];

  return (
    <section id="presale" className="py-32 bg-kb-bg relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">Secure Your Arsenal</h2>
          <p className="text-white/70 max-w-lg mx-auto">Join the ecosystem early. Current tier ends soon.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Tiers — WHITE cards on dark bg */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div
              className="rounded-3xl bg-white p-8 flex flex-col gap-8"
              style={{ boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.7), 4px 4px 12px rgba(0,0,0,0.08)' }}
            >
              <h3 className="text-2xl font-bold text-gray-900 tracking-tighter">Funding Stages</h3>

              <div className="flex flex-col gap-4">
                {tiers.map((tier, i) => (
                  <div key={i} className={`relative flex flex-col gap-2 p-4 rounded-2xl border ${
                    tier.current ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${tier.current ? 'text-gray-900' : 'text-gray-900'}`}>{tier.name}</span>
                      <span className="font-mono text-sm text-gray-600">{tier.price}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tier.percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${tier.current ? 'bg-gray-900' : tier.filled ? 'bg-gray-400' : 'bg-transparent'}`}
                      />
                    </div>
                    <div className="flex justify-end">
                      <span className="text-[10px] font-mono text-gray-600">{tier.percent}% FILLED</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-600 text-sm uppercase tracking-widest font-mono">Stage Goal</span>
                  <span className="text-xl font-bold text-gray-900">$2.5M / $3.0M</span>
                </div>
              </div>
            </div>

            {/* Vesting — white card */}
            <div
              className="rounded-2xl bg-white p-6 flex items-start gap-4"
              style={{ boxShadow: 'inset 1px 1px 4px rgba(0,0,0,0.04), inset -1px -1px 4px rgba(255,255,255,0.5), 3px 3px 8px rgba(0,0,0,0.05)' }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex flex-shrink-0 items-center justify-center border border-gray-300">
                <LockKey weight="bold" className="text-gray-700" size={20} />
              </div>
              <div>
                <h4 className="text-gray-900 font-bold mb-1">Vesting Schedule</h4>
                <p className="text-gray-600 text-sm leading-relaxed">20% unlock at TGE, followed by linear daily vesting over 6 months.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout — WHITE card */}
          <div
            className="lg:col-span-7 rounded-3xl bg-white p-8 md:p-10 flex flex-col"
            style={{ boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.7), 4px 4px 12px rgba(0,0,0,0.08)' }}
          >
            {/* Payment Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
              <button
                onClick={() => setPaymentMode('crypto')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold tracking-wide transition-all ${
                  paymentMode === 'crypto' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CurrencyCircleDollar size={18} weight={paymentMode === 'crypto' ? 'fill' : 'regular'} />
                  CRYPTO
                </div>
              </button>
              <button
                onClick={() => setPaymentMode('card')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold tracking-wide transition-all ${
                  paymentMode === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CreditCard size={18} weight={paymentMode === 'card' ? 'fill' : 'regular'} />
                  CARD
                </div>
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="text-sm font-bold text-gray-600 mb-2 block">Payment Amount (USD)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-5 text-3xl font-mono text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all font-bold"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <span className="text-gray-600 font-bold tracking-widest text-sm">USD</span>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8">
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPreset(p === 'MAX' ? '10000' : p)}
                  className="py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-sm font-mono font-medium hover:border-cyan-300 hover:text-gray-900 transition-all active:scale-95"
                >
                  {p !== 'MAX' ? '$' : ''}{p}
                </button>
              ))}
            </div>

            {/* Calculation */}
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">You receive approximately</span>
                <span className="text-gray-600 text-sm font-mono">{tokenPrice} USD/KB</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter">
                  {tokenAmount.toLocaleString()}
                </span>
                <span className="text-xl font-bold text-gray-900 mb-1.5">$KB</span>
              </div>
            </div>

            {/* Action */}
            <button className="group relative w-full p-1 rounded-2xl bg-gradient-to-r from-gray-900 to-black overflow-hidden active:scale-[0.98] transition-all duration-300 mt-auto">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/20 transition-opacity" />
              <div className="relative w-full py-5 rounded-xl flex items-center justify-center gap-3">
                <span className="font-bold text-white text-xl tracking-wide uppercase">
                  {paymentMode === 'crypto' ? 'Approve Token' : 'Checkout via Stripe'}
                </span>
                <CaretRight weight="bold" size={24} className="text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Trust Signals */}
            <div className="flex justify-center gap-8 mt-8">
              {[
                { icon: ShieldCheck, label: 'Audited' },
                { icon: LockKey, label: 'LP Locked' },
                { icon: CurrencyCircleDollar, label: 'KYC Verified' }
              ].map((Signal, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600">
                  <Signal.icon size={16} weight="duotone" />
                  <span className="text-[10px] uppercase tracking-widest font-mono font-medium">{Signal.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

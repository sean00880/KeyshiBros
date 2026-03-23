"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, ShieldCheck, Coins, GameController, RocketLaunch, CaretRight } from '@phosphor-icons/react';

export function PresaleModule() {
  return (
    <section id="presale" className="py-32 bg-kb-bg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-[100px]" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
            <Star weight="fill" className="text-white/80" size={14} />
            <span className="text-xs font-bold text-white/80 uppercase tracking-[0.2em]">Private Investors Only</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-4">
            Own 0.5% of $KB
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            Exclusive early ownership opportunity. 5,000,000 tokens out of 1,000,000,000 total supply at pre-launch valuation.
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: 'Total Supply', value: '1B', icon: Coins },
            { label: 'Your Allocation', value: '0.5%', icon: Star },
            { label: 'Tokens', value: '5M', icon: ShieldCheck },
            { label: 'Investment', value: '$4,999', icon: RocketLaunch },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center"
            >
              <stat.icon weight="duotone" className="text-white/40 mx-auto mb-3" size={24} />
              <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 mb-12"
        >
          <h3 className="text-xl font-bold text-white tracking-tight mb-6">Why Invest Early</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: GameController, title: 'Live Mobile Game', desc: 'Already available on App Store & Google Play. Real product, real players.' },
              { icon: RocketLaunch, title: 'V2 Launch — July 2026', desc: 'In-game marketplace where players buy/sell power-ups, outfits, and characters.' },
              { icon: Coins, title: 'Revenue-Generating', desc: 'Marketplace transactions drive revenue directly back into the ecosystem.' },
              { icon: ShieldCheck, title: 'Staking Rewards', desc: 'Token holders earn passive rewards as the game grows and generates income.' },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon weight="duotone" className="text-white/60" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">{benefit.title}</h4>
                  <p className="text-white/40 text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/join-presale"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-gray-900 font-bold text-lg tracking-wide hover:bg-gray-100 active:scale-[0.98] transition-all"
            style={{ boxShadow: '0 0 40px rgba(255,255,255,0.1)' }}
          >
            Join Private Sale — $4,999
            <CaretRight weight="bold" size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-white/30 text-xs mt-4 font-mono uppercase tracking-widest">
            By Invitation Only · Solana · Zero Tax
          </p>
        </motion.div>

      </div>
    </section>
  );
}

"use client";

import { motion } from 'framer-motion';
import { GameController, CurrencyCircleDollar, Vault, ChartLineUp } from '@phosphor-icons/react';

const steps = [
  {
    icon: GameController,
    number: '01',
    title: 'Players Play',
    desc: 'Keyshi Bros is free to download. Players adventure through FOMOland, battling minions and collecting Meme Coins.',
  },
  {
    icon: CurrencyCircleDollar,
    number: '02',
    title: 'Game Earns Revenue',
    desc: 'In-app purchases and ads generate revenue. A portion of all game revenue is locked into the distribution contract.',
  },
  {
    icon: Vault,
    number: '03',
    title: 'Revenue is Locked',
    desc: 'Locked revenue accumulates in epochs. At the end of each epoch, the pool is calculated for distribution.',
  },
  {
    icon: ChartLineUp,
    number: '04',
    title: 'Holders Earn',
    desc: 'Distributions flow to $KB token holders proportional to their net supply retained. No staking required — just hold.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-600 max-w-lg mx-auto text-sm md:text-base">
            Game revenue flows to token holders. No staking. No lock-ups. Just hold $KB.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5, type: "spring", stiffness: 100 }}
              className="relative rounded-2xl bg-white p-6 flex flex-col"
              style={{
                boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.04), inset -2px -2px 6px rgba(255,255,255,0.8), 4px 4px 12px rgba(0,0,0,0.06)',
              }}
            >
              {/* Step number */}
              <span className="text-[10px] font-mono font-bold text-gray-300 tracking-widest mb-4">{step.number}</span>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4"
                style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.05)' }}
              >
                <step.icon size={24} weight="fill" className="text-white" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>

              {/* Connector line (not on last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gray-200" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-50 border border-gray-200"
            style={{ boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.03), inset -1px -1px 3px rgba(255,255,255,0.6)' }}
          >
            <Vault size={18} weight="fill" className="text-gray-600" />
            <span className="text-sm text-gray-700 font-medium">Revenue sharing powered by on-chain smart contracts on Ethereum</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from 'framer-motion';
import { useRewards } from '../../lib/hooks/use-rewards';
import { Wallet, Trophy, HandCoins, TrendUp, Gift } from '@phosphor-icons/react';

export function RewardsDashboard() {
  const { stats, leaderboard, claimRewards } = useRewards();

  const floatAnim = {
    y: [-2, 2, -2],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
  };

  return (
    <section id="rewards" className="py-24 md:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-3">Command Center</h2>
            <p className="text-gray-600 max-w-md text-lg">Your holdings, earnings, and global ranking.</p>
          </div>
          <motion.div
            className="px-5 py-2.5 rounded-full border border-gray-300 bg-gray-100 flex items-center gap-3 cursor-pointer hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrendUp weight="bold" className="text-gray-700" />
            <span className="font-bold text-sm tracking-wide text-gray-800">Rank {stats.rank}</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">

          {/* Stats Row — DARK cards on white bg */}
          <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Holdings', value: stats.holdings, icon: Wallet, color: 'text-white/80', bg: 'bg-white/10', border: 'border-white/15' },
              { label: 'Tokens Earned', value: stats.earned, icon: Trophy, color: 'text-white/70', bg: 'bg-white/10', border: 'border-white/15' },
              { label: 'Claimable Now', value: stats.claimable, icon: HandCoins, color: 'text-white/80', bg: 'bg-white/10', border: 'border-white/15' },
              { label: 'Current Multiplier', value: `${stats.multiplier}x`, icon: TrendUp, color: 'text-white/70', bg: 'bg-white/10', border: 'border-white/15' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, delay: i * 0.1 }}
                className="rounded-2xl bg-[#0a0a0a] p-8 flex flex-col justify-between"
                style={{ boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(255,255,255,0.03), 4px 4px 12px rgba(0,0,0,0.2)' }}
              >
                <div className="flex justify-between items-start mb-8">
                  <span className="text-xs font-bold tracking-wide text-white/60 uppercase">{stat.label}</span>
                  <motion.div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bg} ${stat.border} border`} animate={floatAnim}>
                    <stat.icon weight="duotone" className={stat.color} size={20} />
                  </motion.div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold tracking-tighter text-white">
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Left Column (Claim & Streak) */}
          <div className="md:col-span-12 lg:col-span-7 flex flex-col gap-6">

            {/* Claim Card — DARK */}
            <div
              className="rounded-3xl bg-[#0a0a0a] p-8 md:p-12 relative overflow-hidden"
              style={{ boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.4), inset -3px -3px 8px rgba(255,255,255,0.04), 6px 6px 16px rgba(0,0,0,0.25)' }}
            >
              <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />

              <div className="flex items-center justify-between flex-wrap gap-8 relative z-10">
                <div className="flex flex-col">
                  <span className="text-white/60 font-bold tracking-widest text-sm uppercase mb-4">Pending Airdrop</span>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{stats.claimable}</span>
                    <span className="text-2xl font-bold text-white mb-2">$KB</span>
                  </div>
                  <span className="text-sm text-white/80 font-mono">+$45.20 USD Value</span>
                </div>

                <motion.button
                  onClick={claimRewards}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative w-full sm:w-auto p-1 rounded-full bg-gradient-to-r from-white to-gray-300 overflow-hidden"
                >
                  <div className="relative px-8 py-5 bg-[#0a0a0a] rounded-full flex items-center justify-center gap-3 group-hover:bg-transparent transition-colors">
                    <Gift weight="fill" className="text-white" size={24} />
                    <span className="font-bold text-white text-lg tracking-wide">CLAIM REWARDS</span>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Daily Streak — DARK */}
            <div
              className="rounded-2xl bg-[#0a0a0a] p-8 flex flex-col md:flex-row items-center gap-8"
              style={{ boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.3), inset -2px -2px 6px rgba(255,255,255,0.03), 4px 4px 12px rgba(0,0,0,0.2)' }}
            >
              <div className="w-full md:w-1/3 flex flex-col gap-1">
                <span className="text-white/60 text-sm uppercase tracking-widest font-bold">Daily Streak</span>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold tracking-tighter text-white">{stats.streak}</span>
                  <span className="mb-1 font-mono text-white/50 tracking-widest">DAYS</span>
                </div>
              </div>

              <div className="w-full md:w-2/3 flex flex-col gap-3">
                <div className="flex justify-between items-end text-xs font-mono">
                  <span className="text-white/50">Current: {stats.multiplier}x</span>
                  <span className="text-white/80">Next: 2.0x (14 Days)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-white/80 to-white/40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Leaderboard) — DARK */}
          <div className="md:col-span-12 lg:col-span-5 h-full">
            <div
              className="rounded-3xl bg-[#0a0a0a] p-8 h-full flex flex-col"
              style={{ boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.4), inset -3px -3px 8px rgba(255,255,255,0.04), 6px 6px 16px rgba(0,0,0,0.25)' }}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white tracking-wide">Global Top 5</h3>
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <span className="text-[10px] uppercase font-mono text-white/60">View All</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {leaderboard.map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                      user.isUser
                        ? 'border-white/15 bg-white/10'
                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-mono font-bold w-6 text-center ${i < 3 ? 'text-white/70' : 'text-white/50'}`}>
                        #{i + 1}
                      </span>
                      <span className={`font-bold ${user.isUser ? 'text-white' : 'text-white/80'}`}>
                        {user.name}
                      </span>
                    </div>
                    <span className="font-mono text-sm text-white/80 tracking-widest">{user.score.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

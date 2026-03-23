"use client";

import { motion } from 'framer-motion';
import { CheckCircle, RocketLaunch, GameController, Star } from '@phosphor-icons/react';
import Link from 'next/link';

interface UserDashboardProps {
  displayName: string;
  username: string;
}

export function UserDashboard({ displayName, username }: UserDashboardProps) {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center"
      >
        <CheckCircle weight="fill" className="text-white/30 mx-auto mb-6" size={60} />
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
          Welcome, {displayName}
        </h1>
        <p className="text-white/50 text-sm font-mono mb-8">@{username}</p>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star weight="fill" className="text-white/40" size={20} />
            <span className="text-white/60 text-sm font-bold uppercase tracking-widest">Coming Soon</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            Your investor dashboard is being built. You&apos;ll be able to track your allocation,
            vesting schedule, and staking rewards here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/join-presale"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-bold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              <RocketLaunch size={16} weight="fill" />
              Join Presale
            </Link>
            <a
              href="https://play.google.com/store/apps/details?id=com.zerogravity.keyshibros"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/70 text-sm hover:text-white hover:border-white/40 transition-all"
            >
              <GameController size={16} weight="fill" />
              Play Game
            </a>
          </div>
        </div>
        <p className="text-white/30 text-[10px] font-mono">
          $KB Token on Solana · 1B Supply · Zero Tax
        </p>
      </motion.div>
    </section>
  );
}

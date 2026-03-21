"use client";

import { motion } from 'framer-motion';
import { SplineHero } from '../3d/spline-hero';
import { TelegramLogo, GooglePlayLogo, AppleLogo, TwitterLogo } from '@phosphor-icons/react';

const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.zerogravity.keyshibros&hl=en_US";
const APP_STORE = "https://apps.apple.com/tr/app/keyshi-bros/id6742747011";
const TELEGRAM = "https://t.me/keyshibros";

export function HeroSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } }
  };

  return (
    <section className="relative min-h-svh w-full flex flex-col justify-center items-center pt-16 pb-20 overflow-hidden">
      <SplineHero />

      {/* Radial gradient: deep black left → charcoal right with organic shape */}
      <div className="absolute inset-0 hidden lg:block z-[1]"
        style={{
          background: 'radial-gradient(ellipse 130% 100% at 25% 50%, #050508 0%, #050508 30%, transparent 60%), radial-gradient(ellipse 110% 130% at 80% 50%, #111113 0%, #0e0e10 40%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Content */}
        <motion.div
          className="flex flex-col items-center lg:items-start text-center lg:text-left pt-12"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Logo + badge */}
          <motion.div variants={item} className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <img src="/assets/images/icon.jpg" alt="Keyshi Bros" className="w-10 h-10 md:w-12 md:h-12 rounded-lg" />
              <span className="text-xl md:text-2xl font-bold tracking-tighter">
                <span className="holographic-text">KEYSHI</span>
                <span className="text-white ml-1 font-light">BROS</span>
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-mono font-bold border border-white/20 bg-white/10 rounded-full px-3 py-0.5">OUT NOW</span>
          </motion.div>

          <motion.h1 variants={item} className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-3">
            <span className="block text-white">Adventure</span>
            <span className="block text-white">Awaits in</span>
            <span className="block holographic-text">FOMOland.</span>
          </motion.h1>

          <motion.p variants={item} className="text-white/70 text-sm md:text-base max-w-[440px] mb-6 leading-relaxed">
            Shibo & Momo team up to battle Pepe&apos;s minions, collect Meme Coins, and recover the stolen Golden Poop from Blocktopia.
          </motion.p>

          {/* Social icons row — Telegram, iOS, Google Play, Twitter */}
          <motion.div variants={item} className="flex items-center gap-5">
            {[
              { icon: TelegramLogo, href: TELEGRAM, label: 'Telegram' },
              { icon: AppleLogo, href: APP_STORE, label: 'App Store' },
              { icon: GooglePlayLogo, href: PLAY_STORE, label: 'Google Play' },
              { icon: TwitterLogo, href: '#', label: 'Twitter' },
            ].map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="w-11 h-11 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
              >
                <social.icon size={20} weight="fill" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Hero image + buttons below */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 80, damping: 20 }}
          className="hidden lg:flex flex-col items-center gap-6"
        >
          <img
            src="/assets/images/icon.png"
            alt="Keyshi Bros"
            className="w-48 h-48 lg:w-60 lg:h-60 xl:w-72 xl:h-72"
          />

          {/* Compact buttons under image */}
          <div className="flex items-center gap-3">
            <a
              href="#presale"
              className="px-6 py-2.5 rounded-full bg-white text-[#0a0a0a] text-sm font-light tracking-wide hover:bg-white/90 transition-colors active:scale-[0.97]"
            >
              Enter Presale
            </a>
            <a
              href="#"
              className="px-6 py-2.5 rounded-full border border-white/20 text-white/70 text-sm font-light tracking-wide hover:border-white/40 hover:text-white transition-colors active:scale-[0.97]"
            >
              Connect Wallet
            </a>
          </div>
        </motion.div>
      </div>

      {/* Mobile buttons (below content, visible on small screens) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="lg:hidden z-10 flex items-center gap-3 mt-8"
      >
        <a
          href="#presale"
          className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-light tracking-wide active:scale-[0.97]"
        >
          Enter Presale
        </a>
        <a
          href="#"
          className="px-6 py-2.5 rounded-full border border-white/30 text-white text-sm font-light tracking-wide active:scale-[0.97]"
        >
          Connect Wallet
        </a>
      </motion.div>

      {/* Coming Soon Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: "spring", bounce: 0.4 }}
        className="absolute bottom-0 w-full border-t border-white/10 bg-kb-bg z-20"
      >
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-center">
          <span
            className="text-2xl md:text-3xl font-bold tracking-tighter text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(90deg, #3a3a3a 0%, #ffffff 20%, #3a3a3a 40%, #ffffff 60%, #3a3a3a 80%, #ffffff 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer-sweep 6s ease-in-out infinite',
            }}
          >
            Coming Soon
          </span>
          <style>{`
            @keyframes shimmer-sweep {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      </motion.div>
    </section>
  );
}

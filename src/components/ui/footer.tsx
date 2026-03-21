"use client";

import { motion } from 'framer-motion';
import { TwitterLogo, DiscordLogo, TelegramLogo } from '@phosphor-icons/react';

export function Footer() {
  return (
    <footer className="w-full py-12 px-6 bg-kb-bg border-t border-white/5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-kb-primary/5 blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2 group cursor-pointer">
            <img src="/assets/images/icon.jpg" alt="Keyshi Bros" className="w-7 h-7 rounded-lg" />
            <span className="text-xl font-bold tracking-tighter holographic-text">KEYSHI</span>
            <span className="text-xl font-light text-white/50 group-hover:text-white transition-colors">BROS</span>
          </div>
          <p className="text-white/40 text-sm font-mono">&copy; {new Date().getFullYear()} <a href="https://pablocro.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">PabloCro LLC</a>. All rights reserved.</p>
        </div>

        <div className="flex items-center gap-6">
          {[TwitterLogo, DiscordLogo, TelegramLogo].map((Icon, idx) => (
            <motion.a
              key={idx}
              href="#"
              whileHover={{ y: -2, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-white/40 hover:text-white transition-colors"
            >
              <Icon size={24} weight="fill" />
            </motion.a>
          ))}
        </div>

        <div className="text-xs font-mono text-white/30 uppercase tracking-[0.2em]">
          Powered by <span className="text-white/60 font-bold">GROWSZ</span>
        </div>
      </div>
    </footer>
  );
}

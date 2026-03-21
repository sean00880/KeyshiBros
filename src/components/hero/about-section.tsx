"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.zerogravity.keyshibros&hl=en_US";
const APP_STORE = "https://apps.apple.com/tr/app/keyshi-bros/id6742747011";

function StoreTablet({
  href,
  src,
  activeSrc,
  alt,
}: {
  href: string;
  src: string;
  activeSrc: string;
  alt: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.06, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className="relative block cursor-pointer"
    >
      {/* Inactive state */}
      <motion.img
        src={src}
        alt={alt}
        className="w-48 md:w-56 lg:w-64 h-auto"
        animate={{ opacity: hovered ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        draggable={false}
      />
      {/* Active state — overlaid */}
      <motion.img
        src={activeSrc}
        alt={`${alt} active`}
        className="absolute inset-0 w-48 md:w-56 lg:w-64 h-auto"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        draggable={false}
      />
      {/* Glow filter on hover — no box shadow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))' }}
      />
    </motion.a>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="relative w-full">
      {/* Background GIF */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/background.gif')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-white" />

      {/* Content — centered */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          {/* YouTube Video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden mb-10 relative"
            style={{ boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.4), inset -3px -3px 8px rgba(255,255,255,0.04), 8px 8px 24px rgba(0,0,0,0.5)' }}
          >
            <iframe
              src="https://www.youtube.com/embed/Ne_GQaNACmc?autoplay=1&mute=1&loop=1&playlist=Ne_GQaNACmc&controls=1&modestbranding=1&rel=0&playsinline=1"
              title="Keyshi Bros Gameplay"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
            />
          </motion.div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-4 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Two rivals. One mission.
          </h2>
          <p className="text-white/80 text-base md:text-lg max-w-xl leading-relaxed mb-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            Download Keyshi Bros free on iOS &amp; Android. Adventure through FOMOland now.
          </p>

          {/* Store buttons with stylized divider */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-0">
            {/* Google Play */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <StoreTablet
                href={PLAY_STORE}
                src="/assets/images/google.png"
                activeSrc="/assets/images/google_active.png"
                alt="Google Play"
              />
            </motion.div>

            {/* Stylized divider */}
            <div className="flex flex-col items-center mx-6 sm:mx-8">
              {/* Vertical line with glow */}
              <div className="hidden sm:flex flex-col items-center gap-2">
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
                <div className="w-2 h-2 rounded-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.3em] my-1">or</span>
                <div className="w-2 h-2 rounded-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
              </div>
              {/* Horizontal on mobile */}
              <div className="sm:hidden flex items-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.3em]">or</span>
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
            </div>

            {/* App Store */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <StoreTablet
                href={APP_STORE}
                src="/assets/images/apple.png"
                activeSrc="/assets/images/apple_active.png"
                alt="App Store"
              />
            </motion.div>
          </div>

          {/* Stats row below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-10 mt-12"
          >
            {[
              { value: '1K+', label: 'Downloads' },
              { value: '4.5', label: 'Rating' },
              { value: 'Free', label: 'To Play' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">{stat.value}</div>
                <div className="text-white/60 text-xs uppercase tracking-widest mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

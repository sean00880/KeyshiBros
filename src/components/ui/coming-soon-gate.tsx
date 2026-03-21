"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ComingSoonGate({ children }: { children: React.ReactNode }) {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div
      className="relative"
      onClick={(e) => {
        // Show overlay on any interactive click (buttons, inputs, etc.)
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, a, input, select, [role="button"]');
        if (isInteractive) {
          e.preventDefault();
          e.stopPropagation();
          setShowOverlay(true);
          setTimeout(() => setShowOverlay(false), 2500);
        }
      }}
    >
      {/* Block pointer events on interactive children */}
      <div className="[&_button]:pointer-events-none [&_input]:pointer-events-none [&_a[href='#']]:pointer-events-none">
        {children}
      </div>

      {/* Click catcher — captures all clicks in the section */}
      <div className="absolute inset-0 z-30 cursor-pointer" onClick={() => {
        setShowOverlay(true);
        setTimeout(() => setShowOverlay(false), 2500);
      }} />

      {/* Coming Soon overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-md bg-black/60 rounded-3xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative flex flex-col items-center gap-3"
            >
              {/* Shimmer text */}
              <span
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #3a3a3a 0%, #ffffff 20%, #3a3a3a 40%, #ffffff 60%, #3a3a3a 80%, #ffffff 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer-sweep 6s ease-in-out infinite',
                }}
              >
                Coming Soon
              </span>
              <span className="text-white/40 text-sm font-mono tracking-widest uppercase">Stay tuned</span>
            </motion.div>

            <style>{`
              @keyframes shimmer-sweep {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

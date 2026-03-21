"use client";

import { motion } from 'framer-motion';

// Set to your Spline scene URL when ready:
// import dynamic from 'next/dynamic';
// const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false });
const SPLINE_SCENE_URL: string | null = null; // Replace with your .splinecode URL

export function SplineHero() {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="w-full h-full relative"
      >
        {/* Ambient fallback — animated gradient + grid until Spline scene is provided */}
        <div className="absolute inset-0 bg-kb-bg">
          {/* Radial glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-kb-primary/5 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-kb-secondary/5 blur-[100px]" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-kb-tertiary/5 blur-[80px]" />
          {/* Cyber grid */}
          <div className="absolute inset-0 bg-cyber-grid opacity-30" />
        </div>

        {/* Gradient overlays to blend with content */}
        <div className="absolute inset-0 bg-gradient-to-t from-kb-bg via-kb-bg/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-kb-bg/80 via-transparent to-transparent z-10" />
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { GameController, Trophy, Coin, ShareNetwork, ChartLineUp, Fire, Lightning, ShieldCheck } from '@phosphor-icons/react';
import { parseGIF, decompressFrames } from 'gifuct-js';

const SLIDES = [
  {
    id: 'adventure',
    label: 'Adventure',
    icon: GameController,
    headline: 'Explore FOMOland',
    desc: 'A 2D adventure through FOMOland. Battle Pepe\'s minions, dodge traps, collect Meme Coins, and recover the stolen Golden Poop.',
    stats: [
      { label: 'Worlds', value: 'FOMOland' },
      { label: 'Heroes', value: '2' },
      { label: 'Price', value: 'Free' },
    ],
  },
  {
    id: 'characters',
    label: 'Characters',
    icon: Trophy,
    headline: 'Shibo & Momo',
    desc: 'Rivals turned allies. Shibo the Shiba Inu and Momo the Monkey must set aside their differences to save Blocktopia.',
    stats: [
      { label: 'Shibo', value: 'Shiba' },
      { label: 'Momo', value: 'Monkey' },
      { label: 'Villain', value: 'Pepe' },
    ],
  },
  {
    id: 'tokenomics',
    label: 'Tokenomics',
    icon: Coin,
    headline: '1B Supply Token',
    desc: '1,000,000,000 $KB total supply on Solana. Zero tax. Private investors receive 0.5% of supply (5M tokens) for $4,999 USD.',
    stats: [
      { label: 'Supply', value: '1B' },
      { label: 'Tax', value: '0%' },
      { label: 'Chain', value: 'SOL' },
    ],
    badge: 'Zero Tax',
  },
  {
    id: 'community',
    label: 'Community',
    icon: ShareNetwork,
    headline: 'Join the Movement',
    desc: 'Connect with fellow adventurers on Telegram and Twitter. Community-driven growth with transparent revenue sharing.',
    stats: [
      { label: 'Telegram', value: 'Active' },
      { label: 'Twitter/X', value: 'Active' },
      { label: 'Discord', value: 'Soon' },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue',
    icon: ChartLineUp,
    headline: 'Hold & Earn',
    desc: 'Game revenue flows to token holders. No staking required. Simply hold $KB and receive epoch-based distributions proportional to your share.',
    stats: [
      { label: 'Distributions', value: 'Epochs' },
      { label: 'Requirement', value: 'Hold' },
      { label: 'Source', value: 'Game Rev' },
    ],
  },
];

// GIF frame extraction
async function loadGifFrames(url: string): Promise<{ frames: ImageData[]; width: number; height: number }> {
  const resp = await fetch(url);
  const buf = await resp.arrayBuffer();
  const gif = parseGIF(buf);
  const decoded = decompressFrames(gif, true);
  if (decoded.length === 0) return { frames: [], width: 0, height: 0 };

  const first = decoded[0]!;
  const w = first.dims.width;
  const h = first.dims.height;
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  const ctx = tmp.getContext("2d")!;
  const frames: ImageData[] = [];

  for (const frame of decoded) {
    const patch = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
    const pc = document.createElement("canvas");
    pc.width = frame.dims.width;
    pc.height = frame.dims.height;
    pc.getContext("2d")!.putImageData(patch, 0, 0);
    ctx.drawImage(pc, frame.dims.left, frame.dims.top);
    frames.push(ctx.getImageData(0, 0, w, h));
    if (frame.disposalType === 2) ctx.clearRect(0, 0, w, h);
  }
  return { frames, width: w, height: h };
}

export function EcosystemOrbit() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Momo (left)
  const momoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [momoFrames, setMomoFrames] = useState<ImageData[]>([]);
  const [momoDims, setMomoDims] = useState({ width: 200, height: 200 });
  const momoCurrentRef = useRef(0);

  // Shiba (right)
  const shibaCanvasRef = useRef<HTMLCanvasElement>(null);
  const [shibaFrames, setShibaFrames] = useState<ImageData[]>([]);
  const [shibaDims, setShibaDims] = useState({ width: 200, height: 200 });
  const shibaCurrentRef = useRef(0);

  const activeSlide = SLIDES[activeIndex] ?? SLIDES[0]!;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Load GIFs
  useEffect(() => {
    let cancelled = false;
    loadGifFrames("/assets/images/momo.gif").then(({ frames, width, height }) => {
      if (cancelled) return;
      setMomoDims({ width, height });
      setMomoFrames(frames);
      if (momoCanvasRef.current && frames[0]) momoCanvasRef.current.getContext("2d")?.putImageData(frames[0], 0, 0);
    });
    loadGifFrames("/assets/images/shiba.gif").then(({ frames, width, height }) => {
      if (cancelled) return;
      setShibaDims({ width, height });
      setShibaFrames(frames);
      if (shibaCanvasRef.current && frames[0]) shibaCanvasRef.current.getContext("2d")?.putImageData(frames[0], 0, 0);
    });
    return () => { cancelled = true; };
  }, []);

  const renderMomo = useCallback((idx: number) => {
    if (!momoCanvasRef.current || momoFrames.length === 0 || idx === momoCurrentRef.current) return;
    momoCurrentRef.current = idx;
    const frame = momoFrames[idx];
    if (frame) momoCanvasRef.current.getContext("2d")?.putImageData(frame, 0, 0);
  }, [momoFrames]);

  const renderShiba = useCallback((idx: number) => {
    if (!shibaCanvasRef.current || shibaFrames.length === 0 || idx === shibaCurrentRef.current) return;
    shibaCurrentRef.current = idx;
    const frame = shibaFrames[idx];
    if (frame) shibaCanvasRef.current.getContext("2d")?.putImageData(frame, 0, 0);
  }, [shibaFrames]);

  // Scroll drives EVERYTHING: GIF frames + active slide
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    // Active slide: divide scroll into equal segments per slide
    const slideIndex = Math.min(Math.floor(progress * SLIDES.length), SLIDES.length - 1);
    setActiveIndex(Math.max(0, slideIndex));

    // GIF frames
    requestAnimationFrame(() => {
      if (momoFrames.length > 0) {
        const i = Math.max(0, Math.min(Math.floor(progress * (momoFrames.length - 1)), momoFrames.length - 1));
        renderMomo(i);
      }
      if (shibaFrames.length > 0) {
        const i = Math.max(0, Math.min(Math.floor(progress * (shibaFrames.length - 1)), shibaFrames.length - 1));
        renderShiba(i);
      }
    });
  });

  return (
    <section ref={sectionRef} id="ecosystem" className="relative" style={{ height: '400vh' }}>
      {/* Sticky pinned viewport */}
      <div className="sticky top-0 h-svh flex items-center justify-center bg-white overflow-x-clip">

        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center">

          {/* Title */}
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 mb-2">The Ecosystem</h2>
            <p className="text-gray-600 max-w-lg mx-auto text-xs md:text-sm">
              A fully integrated gaming economy. Scroll to explore.
            </p>
            {/* Tax badge */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
              <ShieldCheck size={14} weight="fill" className="text-gray-600" />
              <span className="text-[10px] font-bold text-gray-700 tracking-wide">1B SUPPLY</span>
              <span className="text-gray-300">|</span>
              <span className="text-[10px] font-bold text-gray-700 tracking-wide">0% TAX</span>
            </div>
          </div>

          {/* Main content: orbit + info card */}
          <div className="flex flex-col items-center gap-4 w-full max-w-2xl">

            {/* Orbit with active node highlighted by scroll */}
            <div className="relative w-[240px] h-[240px] md:w-[300px] md:h-[300px] flex items-center justify-center">

              {/* Center: active slide icon + label */}
              <motion.div
                key={activeSlide.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-900 flex flex-col items-center justify-center z-20"
                style={{ boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.05), 4px 4px 12px rgba(0,0,0,0.3)' }}
              >
                <activeSlide.icon size={28} weight="fill" className="text-white mb-1" />
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{activeSlide.label}</span>
              </motion.div>

              {/* Orbit ring */}
              <div className="absolute inset-0 rounded-full border border-gray-200" />

              {/* Nodes — scroll-driven active state */}
              {SLIDES.map((node, i) => {
                const rad = (i * (360 / SLIDES.length) * Math.PI) / 180;
                const radius = 125;
                const x = Math.round(Math.cos(rad) * radius * 100) / 100;
                const y = Math.round(Math.sin(rad) * radius * 100) / 100;
                const isActive = i === activeIndex;

                return (
                  <div
                    key={node.id}
                    className={`absolute top-1/2 left-1/2 w-9 h-9 -ml-[18px] -mt-[18px] rounded-full border flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? 'bg-gray-900 border-gray-900 text-white scale-125 shadow-lg'
                        : 'bg-white border-gray-200 text-gray-400 scale-100'
                    }`}
                    style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                  >
                    <node.icon size={16} weight={isActive ? "fill" : "regular"} />
                  </div>
                );
              })}
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? 'w-8 h-2 bg-gray-900'
                      : 'w-2 h-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Info card — animated per active slide */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="w-full rounded-2xl bg-white border border-gray-100 p-5 md:p-6"
                style={{ boxShadow: 'inset 2px 2px 6px rgba(0,0,0,0.04), inset -2px -2px 6px rgba(255,255,255,0.8), 3px 3px 10px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <activeSlide.icon size={20} weight="fill" className="text-gray-900" />
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">{activeSlide.label}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">{activeSlide.headline}</h3>
                  </div>
                  {activeSlide.badge && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
                      <Fire size={14} weight="fill" className="text-gray-600" />
                      <span className="text-xs font-bold text-gray-700">{activeSlide.badge}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-xs md:text-sm mb-4 leading-relaxed">{activeSlide.desc}</p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {activeSlide.stats.map((stat) => (
                    <div key={stat.label} className="text-center p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-base md:text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Momo — LEFT */}
          <div className="hidden md:block absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 z-10">
            <canvas
              ref={momoCanvasRef}
              width={momoDims.width}
              height={momoDims.height}
              className="w-32 h-32 lg:w-44 lg:h-44 object-contain"
              style={{ imageRendering: "auto" }}
            />
          </div>

          {/* Shiba — RIGHT */}
          <div className="hidden md:block absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 z-10">
            <canvas
              ref={shibaCanvasRef}
              width={shibaDims.width}
              height={shibaDims.height}
              className="w-32 h-32 lg:w-44 lg:h-44 object-contain"
              style={{ imageRendering: "auto" }}
            />
          </div>

          {/* Mobile: static GIFs */}
          <div className="md:hidden mt-6 flex justify-center gap-6">
            <img src="/assets/images/momo.gif" alt="Momo" className="w-28 h-28 object-contain" />
            <img src="/assets/images/shiba.gif" alt="Shiba" className="w-28 h-28 object-contain" />
          </div>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-7 rounded-full border border-gray-300 flex items-start justify-center p-1"
          >
            <div className="w-1 h-1.5 rounded-full bg-kb-primary" />
          </motion.div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-mono">Scroll</span>
        </div>
      </div>
    </section>
  );
}

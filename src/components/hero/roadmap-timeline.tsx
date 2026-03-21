"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RocketLaunch, Storefront, Megaphone, Users, Globe } from '@phosphor-icons/react';
import { DiagonalTransition } from '../ui/diagonal-transition';

const milestones = [
  { id: 1, title: 'Game Launch', desc: 'Keyshi Bros released on iOS App Store and Google Play. Shibo & Momo adventure through FOMOland.', status: 'complete' as const, date: 'Q3 2025', icon: Check },
  { id: 2, title: '$KB Token Launch', desc: 'Keyshi Bros ETH token presale and DEX listing. Revenue-sharing smart contracts deployed.', status: 'active' as const, date: 'Q1 2026', icon: RocketLaunch },
  { id: 3, title: 'Epoch Distributions', desc: 'First epoch-based revenue distributions to $KB holders. Transparent on-chain accounting.', status: 'upcoming' as const, date: 'Q2 2026', icon: Storefront },
  { id: 4, title: 'Game Expansion', desc: 'New FOMOland worlds, boss battles, power-ups, and seasonal content updates.', status: 'upcoming' as const, date: 'Q3 2026', icon: Megaphone },
  { id: 5, title: '100K Downloads', desc: 'Marketing push, influencer partnerships, community growth, and app store optimization.', status: 'upcoming' as const, date: 'Q4 2026', icon: Users },
  { id: 6, title: 'Ecosystem Growth', desc: 'Additional game titles, expanded token utility, merchandise, and community governance.', status: 'upcoming' as const, date: '2027', icon: Globe },
];

export function RoadmapTimeline() {
  const [expandedId, setExpandedId] = useState<number | null>(2); // Active milestone expanded by default

  return (
    <>
      {/* Diagonal transition: white (ecosystem) → black (roadmap) */}
      <DiagonalTransition fromColor="#ffffff" toColor="#050508" />

      {/* Roadmap section — black background */}
      <section id="roadmap" className="bg-kb-bg relative py-20 md:py-28 overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          {/* Header — no background, white text on dark section */}
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-3">Roadmap</h2>
            <p className="text-white/50 max-w-md mx-auto">The path to dominance. Every milestone, every victory.</p>
          </div>

          {/* Vertical timeline */}
          <div className="relative">
            {/* Central line */}
            <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-white via-white/40 to-white/10" />

            {milestones.map((m, i) => {
              const isLeft = i % 2 === 0;
              const isExpanded = expandedId === m.id;
              const statusColor = m.status === 'complete' ? '#a1a1aa' : m.status === 'active' ? '#ffffff' : '#27272a';

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08, type: "spring", stiffness: 100 }}
                  className={`relative flex items-start mb-8 md:mb-12 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-row`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{
                        borderColor: statusColor,
                        backgroundColor: m.status === 'complete' ? statusColor : m.status === 'active' ? statusColor : '#050508',
                        boxShadow: m.status !== 'upcoming' ? `0 0 12px ${statusColor}` : 'none',
                      }}
                    />
                    {m.status === 'active' && (
                      <span className="absolute inset-0 rounded-full animate-ping border-2 border-white opacity-50" />
                    )}
                  </div>

                  {/* Card — neumorphic black */}
                  <motion.div
                    onClick={() => setExpandedId(isExpanded ? null : m.id)}
                    className={`cursor-pointer ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${
                      isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                    } w-full`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`rounded-2xl p-6 md:p-8 bg-white transition-all duration-300`}
                      style={{
                        boxShadow: isExpanded
                          ? 'inset 2px 2px 6px rgba(0,0,0,0.06), inset -2px -2px 6px rgba(255,255,255,0.7), 4px 4px 12px rgba(0,0,0,0.08)'
                          : 'inset 1px 1px 4px rgba(0,0,0,0.04), inset -1px -1px 4px rgba(255,255,255,0.5), 3px 3px 8px rgba(0,0,0,0.05)',
                      }}
                    >
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                              backgroundColor: `${statusColor}15`,
                              border: `1px solid ${statusColor}30`,
                            }}
                          >
                            <m.icon size={20} weight={m.status === 'complete' ? 'bold' : 'fill'} style={{ color: statusColor }} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">{m.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono tracking-widest text-gray-400">{m.date}</span>
                          {m.status === 'complete' && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Done</span>
                          )}
                          {m.status === 'active' && (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-900 bg-gray-200 px-2 py-0.5 rounded-full">Live</span>
                          )}
                        </div>
                      </div>

                      {/* Expandable description */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="text-gray-500 text-sm leading-relaxed mt-2 pt-3 border-t border-gray-100">
                              {m.desc}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House, RocketLaunch, Trophy, Gear, SignOut, Wallet,
  CaretUpDown, User, Star, GameController, X,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { resolveProfileImage } from '@/lib/profile-image';
import { useAppKitAccount } from '@reown/appkit/react';

interface SidebarProps {
  user: any;
  account: any;
  role: string | null;
}

function ComingSoonTooltip() {
  return (
    <motion.span
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -4 }}
      className="ml-auto text-[9px] uppercase tracking-widest text-white/30 font-mono"
    >
      Coming Soon
    </motion.span>
  );
}

export function AppSidebar({ user, account, role }: SidebarProps) {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { address: walletAddress, isConnected } = useAppKitAccount();

  const displayName = account?.display_name || user?.user_metadata?.full_name || 'User';
  const username = account?.username || '';
  const avatar = resolveProfileImage(
    account?.profile_image_url,
    username,
    user?.user_metadata?.avatar_url || undefined
  );
  const email = user?.email || '';

  const navLinks = [
    { id: 'home', label: 'Home', href: '/', icon: House, active: true },
    { id: 'presale', label: 'Presale', href: '/join-presale', icon: RocketLaunch, active: true },
    { id: 'rewards', label: 'Rewards', href: '#', icon: Trophy, comingSoon: true },
    { id: 'settings', label: 'Settings', href: '#', icon: Gear, comingSoon: true },
  ];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <aside className="w-64 h-full bg-[#0a0a0e] border-r border-white/5 flex flex-col">
      {/* Profile Switcher */}
      <div className="p-3">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
        >
          {avatar ? (
            <img src={avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-white/50" />
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <div className="text-white text-sm font-bold truncate">{displayName}</div>
            <div className="text-white/40 text-[10px] font-mono truncate">
              {username ? `@${username}` : email}
            </div>
          </div>
          <CaretUpDown size={14} className="text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
        </button>

        {/* Profile dropdown */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-white/5">
                <div className="text-white/40 text-[9px] font-mono uppercase tracking-widest">Account</div>
              </div>
              <div className="p-2">
                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.05]">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                      <User size={12} className="text-white/50" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-white text-xs font-bold truncate">{displayName}</div>
                    <div className="text-white/30 text-[10px] truncate">{email}</div>
                  </div>
                  {role && (
                    <span className="ml-auto text-[8px] uppercase tracking-widest text-white/20 font-mono border border-white/10 px-1.5 py-0.5 rounded">
                      {role}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <div className="text-[9px] uppercase tracking-widest text-white/20 font-mono px-2.5 mb-2">Navigation</div>
        <div className="flex flex-col gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.comingSoon ? '#' : link.href}
              onMouseEnter={() => setHoveredLink(link.id)}
              onMouseLeave={() => setHoveredLink(null)}
              onClick={link.comingSoon ? (e) => e.preventDefault() : undefined}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all no-underline ${
                link.comingSoon
                  ? 'text-white/30 cursor-default'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <link.icon size={18} weight={link.active ? 'fill' : 'regular'} />
              <span className="font-medium">{link.label}</span>
              <AnimatePresence>
                {link.comingSoon && hoveredLink === link.id && <ComingSoonTooltip />}
              </AnimatePresence>
            </Link>
          ))}
        </div>

        {role && (
          <>
            <div className="text-[9px] uppercase tracking-widest text-white/20 font-mono px-2.5 mt-6 mb-2">Admin</div>
            <Link href="/"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all no-underline">
              <Star size={18} weight="fill" />
              <span className="font-medium">Investor Dashboard</span>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom section: Wallet + Sign Out */}
      <div className="p-3 border-t border-white/5 flex flex-col gap-2">
        {/* Connected Wallet */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/[0.03]">
          <Wallet size={16} className={isConnected ? 'text-green-400' : 'text-white/30'} weight="fill" />
          <div className="flex-1 min-w-0">
            {isConnected && walletAddress ? (
              <>
                <div className="text-white/60 text-[10px] font-mono truncate">{walletAddress}</div>
                <div className="text-green-400/60 text-[9px] font-mono">Connected</div>
              </>
            ) : (
              <div className="text-white/30 text-xs">No wallet connected</div>
            )}
          </div>
          {isConnected && (
            <appkit-button size="sm" balance="hide" />
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          <SignOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

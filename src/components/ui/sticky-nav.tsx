"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, User, SignOut, GoogleLogo } from '@phosphor-icons/react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAccount(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/profile?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => setAccount(data.account))
      .catch(() => {});
  }, [user?.id]);

  async function handleSignIn() {
    const supabase = createClient();
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('next', window.location.pathname);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString(), skipBrowserRedirect: false },
    });
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setAccount(null);
    setProfileOpen(false);
    window.location.href = '/';
  }

  const links = [
    { name: 'Ecosystem', href: '/#ecosystem' },
    { name: 'Roadmap', href: '/#roadmap' },
    { name: 'Presale', href: '/#presale' },
  ];

  const displayName = account?.display_name || user?.user_metadata?.full_name || '';
  const avatar = account?.profile_image_url || user?.user_metadata?.avatar_url || '';
  const username = account?.username || '';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 z-50 cursor-pointer group px-5 py-2.5 rounded-2xl bg-black border border-white/10 shadow-[6px_6px_12px_rgba(0,0,0,0.6),-4px_-4px_10px_rgba(255,255,255,0.05)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.7),-6px_-6px_14px_rgba(255,255,255,0.07)] transition-shadow duration-300 no-underline">
              <img src="/assets/images/icon.jpg" alt="KB" className="w-7 h-7 rounded-lg" />
              <span className="text-xl font-bold tracking-tighter holographic-text">KEYSHI</span>
              <span className="text-xl font-light text-white/90 tracking-tighter">BROS</span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center glass-panel rounded-full px-6 py-2 gap-8">
              {links.map((link) => (
                <a key={link.name} href={link.href}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group">
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* Right side: Auth + Buy */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-panel hover:bg-white/10 transition-all">
                    {avatar ? (
                      <img src={avatar} alt="" className="w-7 h-7 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                        <User size={14} className="text-white/60" />
                      </div>
                    )}
                    <span className="text-white/80 text-sm font-medium max-w-[100px] truncate">{displayName || 'Account'}</span>
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#111116] border border-white/10 shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <div className="text-white text-sm font-bold truncate">{displayName}</div>
                          {username && <div className="text-white/40 text-xs font-mono">@{username}</div>}
                          <div className="text-white/30 text-[10px] truncate">{user.email}</div>
                        </div>
                        <button onClick={handleSignOut}
                          className="w-full px-4 py-3 flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm">
                          <SignOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={handleSignIn}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
                  <GoogleLogo size={16} weight="bold" />
                  Sign In
                </button>
              )}

              <Link href="/join-presale"
                className="px-6 py-2.5 rounded-full bg-white text-[#0a0a0a] text-sm font-bold tracking-wide hover:bg-white/90 transition-colors active:scale-[0.97] no-underline">
                BUY
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden relative z-50 text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <List size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Close dropdown on outside click */}
      {profileOpen && <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />}

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-kb-bg/95 backdrop-blur-3xl pt-32 px-6 pb-8 flex flex-col justify-between"
          >
            <div className="flex flex-col gap-6">
              {/* Mobile profile */}
              {user && (
                <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-2">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <User size={18} className="text-white/60" />
                    </div>
                  )}
                  <div>
                    <div className="text-white font-bold">{displayName}</div>
                    {username && <div className="text-white/40 text-xs font-mono">@{username}</div>}
                  </div>
                </div>
              )}

              {links.map((link, i) => (
                <motion.a key={link.name} href={link.href}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-4xl font-bold tracking-tighter text-white"
                  onClick={() => setMobileMenuOpen(false)}>
                  {link.name}
                </motion.a>
              ))}

              {user && (
                <motion.button onClick={handleSignOut}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-left text-lg text-white/50 font-medium mt-4">
                  Sign Out
                </motion.button>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col gap-3">
              {!user && (
                <button onClick={handleSignIn} className="w-full py-4 rounded-xl glass-panel text-white font-bold tracking-widest text-lg flex items-center justify-center gap-2">
                  <GoogleLogo size={20} weight="bold" /> Sign In
                </button>
              )}
              <Link href="/join-presale" className="w-full py-4 rounded-xl bg-white text-black font-bold tracking-widest text-lg text-center no-underline block"
                onClick={() => setMobileMenuOpen(false)}>
                BUY NOW
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

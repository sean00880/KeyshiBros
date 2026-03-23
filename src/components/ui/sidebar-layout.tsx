"use client";

import { useState, useEffect, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppSidebar } from './app-sidebar';
import { AppKitProvider } from '@/components/providers/appkit-provider';
import { List, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';

interface SidebarLayoutProps {
  children: ReactNode;
}

/**
 * Sidebar layout wrapper. When authenticated, shows sidebar + content.
 * When not authenticated, renders children full-width (no sidebar).
 */
export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) { setAccount(null); setRole(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/me?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => { setAccount(data.account); setRole(data.role); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Not authenticated → no sidebar
  if (loading || !user) return <>{children}</>;

  return (
    <AppKitProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-kb-bg">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <AppSidebar user={user} account={account} role={role} />
        </div>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="lg:hidden fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-xl"
        >
          {mobileSidebarOpen ? <X size={20} /> : <List size={20} />}
        </button>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 z-40"
              >
                <AppSidebar user={user} account={account} role={role} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AppKitProvider>
  );
}

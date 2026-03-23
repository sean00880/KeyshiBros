"use client";

import { useState, useEffect, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserDashboard } from './user-dashboard';
import { OwnerDashboard } from './owner-dashboard';

interface AuthGateProps {
  children: ReactNode; // Landing page content (shown when not authed)
}

/**
 * Auth-aware gate for root page.
 * - Not authenticated → show landing page (children)
 * - Authenticated regular user → show UserDashboard (thank you + coming soon)
 * - Authenticated owner/admin/superadmin → show OwnerDashboard (investor table)
 */
export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (!data.user) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setAccount(null);
        setRole(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch account + role when user changes
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/me?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setAccount(data.account);
        setRole(data.role);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Not authenticated or still loading → show landing page
  if (loading || !user) return <>{children}</>;

  const displayName = account?.display_name || user?.user_metadata?.full_name || 'User';
  const username = account?.username || user?.email?.split('@')[0] || 'user';

  // Owner/Admin/Superadmin → show investor dashboard
  if (role === 'superadmin' || role === 'owner' || role === 'admin') {
    return <OwnerDashboard userId={user.id} role={role} displayName={displayName} />;
  }

  // Regular authenticated user → thank you + coming soon
  return <UserDashboard displayName={displayName} username={username} />;
}

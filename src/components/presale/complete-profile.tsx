"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle, XCircle } from '@phosphor-icons/react';

interface CompleteProfileProps {
  userId: string;
  defaultName: string;
  defaultEmail: string;
  onComplete: (account: { display_name: string; username: string }) => void;
}

/**
 * KeyshiBros-scoped profile completion form.
 * Dark theme, matches presale page aesthetic.
 * Mirrors NormieToolProfileGate + EnhancedProfileDashboard pattern
 * but lightweight — only collects display_name + username.
 */
export function CompleteProfile({ userId, defaultName, defaultEmail, onComplete }: CompleteProfileProps) {
  const [displayName, setDisplayName] = useState(defaultName || '');
  const [username, setUsername] = useState(
    defaultEmail ? defaultEmail.split('@')[0]?.replace(/[^a-z0-9_]/gi, '_').toLowerCase() || '' : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          display_name: displayName.trim(),
          username: username.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to complete profile');
        return;
      }

      onComplete(data.account);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
    >
      {/* Header — KB scoped */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
          <User weight="duotone" className="text-white/60" size={20} />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Complete Your Profile</h3>
          <p className="text-white/30 text-xs">Required before joining the Keyshi Bros private sale</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1.5 block">
            Display Name *
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono mb-1.5 block">
            Username *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
              placeholder="username"
              className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors text-sm font-mono"
            />
          </div>
          <p className="text-white/20 text-[10px] mt-1">Lowercase letters, numbers, underscores only</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
            <XCircle size={16} weight="fill" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !displayName.trim() || !username.trim()}
          className="w-full py-3.5 rounded-xl bg-white text-gray-900 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle size={18} weight="fill" />
              Complete Profile
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

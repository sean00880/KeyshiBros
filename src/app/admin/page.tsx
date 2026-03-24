"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, User, Wallet, CreditCard, CheckCircle, Clock, XCircle,
  ArrowLeft, ArrowsClockwise, Copy, CaretDown, Coins, RocketLaunch,
} from '@phosphor-icons/react';
import Link from 'next/link';

interface Investor {
  id: string;
  email: string;
  full_name: string;
  telegram_handle: string | null;
  wallet_address: string | null;
  delivery_wallet_address: string | null;
  payment_method: 'stripe' | 'solana';
  stripe_session_id: string | null;
  solana_tx_signature: string | null;
  usd_amount: number;
  sol_amount: number | null;
  sol_price_at_purchase: number | null;
  token_allocation: number;
  status: string;
  notes: string | null;
  created_at: string;
  presale_projects: { slug: string; name: string } | null;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-400', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-green-400', label: 'Confirmed' },
  tokens_sent: { icon: RocketLaunch, color: 'text-blue-400', label: 'Tokens Sent' },
  failed: { icon: XCircle, color: 'text-red-400', label: 'Failed' },
  refunded: { icon: ArrowsClockwise, color: 'text-orange-400', label: 'Refunded' },
};

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const fetchInvestors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/investors', {
        headers: { 'x-admin-secret': secret },
      });
      if (!res.ok) {
        setError(res.status === 401 ? 'Invalid admin secret' : 'Failed to fetch');
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setInvestors(data.investors || []);
      setAuthed(true);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [secret]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvestors();
  };

  const filtered = filter === 'all' ? investors : investors.filter(i => i.status === filter);

  const totalRaised = investors
    .filter(i => i.status === 'confirmed' || i.status === 'tokens_sent')
    .reduce((sum, i) => sum + Number(i.usd_amount), 0);

  const totalAllocated = investors
    .filter(i => i.status === 'confirmed' || i.status === 'tokens_sent')
    .reduce((sum, i) => sum + Number(i.token_allocation), 0);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (!authed) {
    return (
      <div className="min-h-svh bg-kb-bg flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
          <div className="text-center mb-4">
            <ShieldCheck weight="fill" className="text-white/40 mx-auto mb-3" size={40} />
            <h1 className="text-xl font-bold text-white">Admin Access</h1>
          </div>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 text-sm"
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-white text-gray-900 font-bold text-sm disabled:opacity-50">
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-kb-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Presale Admin</h1>
              <p className="text-white/40 text-sm">Manage investor submissions</p>
            </div>
          </div>
          <button onClick={fetchInvestors} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all text-sm">
            <ArrowsClockwise size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Investors', value: investors.length, icon: User },
            { label: 'Total Raised', value: `$${totalRaised.toLocaleString()}`, icon: Coins },
            { label: 'Tokens Allocated', value: `${(totalAllocated / 1e6).toFixed(1)}M`, icon: RocketLaunch },
            { label: 'Confirmed', value: investors.filter(i => i.status === 'confirmed' || i.status === 'tokens_sent').length, icon: CheckCircle },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <stat.icon weight="duotone" className="text-white/30 mb-2" size={20} />
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-mono">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'tokens_sent', 'failed', 'refunded'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                filter === f ? 'bg-white text-gray-900' : 'text-white/40 hover:text-white/70 border border-white/10'
              }`}
            >
              {f === 'all' ? `All (${investors.length})` : `${f.replace('_', ' ')} (${investors.filter(i => i.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  {['Investor', 'Payment Wallet', 'Delivery Wallet', 'Method', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-white/30 font-mono font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const sc = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG['pending']!;
                  return (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{inv.full_name}</div>
                        <div className="text-white/30 text-xs">{inv.email}</div>
                        {inv.telegram_handle && <div className="text-white/20 text-xs">{inv.telegram_handle}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {inv.wallet_address ? (
                          <button onClick={() => copyToClipboard(inv.wallet_address!)} className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors font-mono text-xs" title="Click to copy">
                            {inv.wallet_address.slice(0, 6)}...{inv.wallet_address.slice(-4)}
                            <Copy size={12} />
                          </button>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {inv.delivery_wallet_address ? (
                          <button onClick={() => copyToClipboard(inv.delivery_wallet_address!)} className="flex items-center gap-1.5 text-kb-primary/70 hover:text-kb-primary transition-colors font-mono text-xs" title="Click to copy delivery wallet">
                            {inv.delivery_wallet_address.slice(0, 6)}...{inv.delivery_wallet_address.slice(-4)}
                            <Copy size={12} />
                          </button>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {inv.payment_method === 'stripe' ? <CreditCard size={14} className="text-white/40" /> : <Wallet size={14} className="text-white/40" />}
                          <span className="text-white/50 text-xs uppercase">{inv.payment_method}</span>
                        </div>
                        {inv.solana_tx_signature && (
                          <a href={`https://solscan.io/tx/${inv.solana_tx_signature}`} target="_blank" rel="noopener noreferrer" className="text-white/20 text-[10px] hover:text-white/50 font-mono">
                            tx:{inv.solana_tx_signature.slice(0, 8)}...
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white font-mono">${Number(inv.usd_amount).toLocaleString()}</div>
                        {inv.sol_amount && (
                          <div className="text-white/20 text-[10px] font-mono">{inv.sol_amount} SOL @ ${inv.sol_price_at_purchase}</div>
                        )}
                        <div className="text-white/20 text-[10px]">{Number(inv.token_allocation).toLocaleString()} $KB</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1.5 ${sc.color}`}>
                          <sc.icon size={14} weight="fill" />
                          <span className="text-xs font-bold">{sc.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/30 text-xs font-mono">
                        {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-white/20 text-sm">No investors found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

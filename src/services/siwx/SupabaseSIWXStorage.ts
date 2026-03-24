/**
 * Official Reown-Compliant SIWX Storage for Supabase
 *
 * Implements the official SIWXStorage interface adapted for KeyshiBros:
 * - add(session: SIWXSession): Promise<void>
 * - get(chainId: CaipNetworkId, address: string): Promise<SIWXSession[]>
 * - set(sessions: SIWXSession[]): Promise<void>
 * - delete(chainId: CaipNetworkId, address: string): Promise<void>
 *
 * Database Integration:
 * - siwx_sessions_v2: Session storage (chain_id, address, session_data JSONB)
 * - accounts_v2: Wallet metadata (activeWallet, connectedWallets)
 */

import type { SIWXSession } from '@reown/appkit';
import type { SIWXStorage } from '@reown/appkit-siwx';
import type { CaipNetworkId } from '@reown/appkit-common';

import { createClient } from '@/lib/supabase/client';

const getSupabase = (): any => createClient();

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * Sync session to accounts_v2 table for wallet metadata tracking
 */
async function syncToAccountsV2(session: SIWXSession): Promise<void> {
  const address = normalizeAddress(session.data?.accountAddress || '');
  const chainId = session.data?.chainId as string;

  if (!address || !chainId) return;

  try {
    // Check if account already exists (avoids deferrable constraint upsert issue)
    const { data: existing } = await getSupabase()
      .from('accounts_v2')
      .select('id')
      .eq('wallet_address', address)
      .eq('chain_id', chainId)
      .maybeSingle();

    if (existing) {
      // Update existing
      await getSupabase()
        .from('accounts_v2')
        .update({
          is_device_active: true,
          last_connection_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Insert new
      const addressHex = address.startsWith('0x') ? address.slice(2, 10) : address.slice(0, 8);
      await getSupabase()
        .from('accounts_v2')
        .insert({
          account_type: 'wallet',
          username: `wallet_${addressHex}`,
          display_name: address.length > 10
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : address,
          wallet_address: address,
          chain_id: chainId,
          wallet_independence_level: 'independent',
          requires_user_auth: false,
          auto_created_wallet: true,
          is_device_active: true,
          last_connection_at: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('[SupabaseSIWXStorage] Error syncing to accounts_v2:', error);
  }
}

async function cleanupAccountsV2(chainId: CaipNetworkId, address: string): Promise<void> {
  const normalizedAddress = normalizeAddress(address);
  try {
    const { error } = await getSupabase()
      .from('accounts_v2')
      .update({ is_device_active: false })
      .eq('wallet_address', normalizedAddress)
      .eq('chain_id', chainId);

    if (error) console.error('[SupabaseSIWXStorage] Failed to cleanup accounts_v2:', error);
  } catch (error) {
    console.error('[SupabaseSIWXStorage] Error cleaning up accounts_v2:', error);
  }
}

export const supabaseSIWXStorage: SIWXStorage = {
  add: async (session: SIWXSession): Promise<void> => {
    const address = normalizeAddress(session.data?.accountAddress || '');
    const chainId = session.data?.chainId as CaipNetworkId;

    if (!address || !chainId) return;

    let persisted = false;

    try {
      const now = new Date().toISOString();
      const { error } = await getSupabase().from('siwx_sessions_v2').upsert(
        {
          chain_id: chainId,
          address: address,
          session_data: session,
          created_at: now,
          updated_at: now,
        },
        {
          onConflict: 'chain_id,address',
          ignoreDuplicates: false,
        }
      );

      if (error) {
        console.error('[SupabaseSIWXStorage] ⚠️ DB upsert failed:', error.message);
      } else {
        persisted = true;
      }
    } catch (error) {
      console.error('[SupabaseSIWXStorage] ⚠️ Session add failed:', error);
    }

    if (typeof window !== 'undefined') {
      if (persisted) {
        try { sessionStorage.removeItem('siwx_signing_intent'); } catch {}
      }
      window.dispatchEvent(new CustomEvent('siwx-session-added', {
        detail: { address, chainId, persisted }
      }));
    }

    if (persisted) {
      syncToAccountsV2(session).catch(err => console.warn('[SupabaseSIWXStorage] ⚠️ accounts_v2 sync failed:', err));
    }
  },

  get: async (chainId: CaipNetworkId, address: string): Promise<SIWXSession[]> => {
    const normalizedAddress = normalizeAddress(address);
    try {
      const { data, error } = await getSupabase()
        .from('siwx_sessions_v2')
        .select('session_data')
        .eq('address', normalizedAddress);

      if (error) throw new Error(`Failed to get sessions: ${error.message}`);
      return (data || []).map((row: any) => row.session_data as SIWXSession);
    } catch (error) {
      console.error('[SupabaseSIWXStorage] ⚠️ Failed to get sessions:', error);
      return [];
    }
  },

  set: async (sessions: SIWXSession[]): Promise<void> => {
    let persisted = false;

    try {
      if (sessions.length === 0) {
        const { error } = await getSupabase().from('siwx_sessions_v2').delete().neq('chain_id', '');
        if (error) console.error('[SupabaseSIWXStorage] ⚠️ Failed to clear sessions:', error.message);
        else persisted = true;

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('siwx-session-deleted', {
            detail: { address: '*', chainId: '*', persisted }
          }));
        }
        return;
      }

      const deletePromises = sessions.map((session) => {
        const address = normalizeAddress(session.data?.accountAddress || '');
        const chainId = session.data?.chainId as CaipNetworkId;
        return getSupabase().from('siwx_sessions_v2').delete().eq('chain_id', chainId).eq('address', address);
      });
      await Promise.allSettled(deletePromises);

      const { error } = await getSupabase().from('siwx_sessions_v2').upsert(
        sessions.map((session) => ({
          chain_id: session.data?.chainId as CaipNetworkId,
          address: normalizeAddress(session.data?.accountAddress || ''),
          session_data: session,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'chain_id,address', ignoreDuplicates: false }
      );

      if (error) console.error('[SupabaseSIWXStorage] ⚠️ Failed to set sessions:', error.message);
      else persisted = true;
    } catch (error) {
      console.error('[SupabaseSIWXStorage] ⚠️ Failed to set sessions:', error);
    }

    if (typeof window !== 'undefined') {
      for (const session of sessions) {
        const addr = normalizeAddress(session.data?.accountAddress || '');
        const cid = session.data?.chainId as CaipNetworkId;
        if (addr && cid) {
          window.dispatchEvent(new CustomEvent('siwx-session-added', { detail: { address: addr, chainId: cid, persisted } }));
        }
      }
    }

    if (persisted) {
      Promise.all(sessions.map(syncToAccountsV2)).catch(err => console.warn('[SupabaseSIWXStorage] ⚠️ accounts_v2 sync failed:', err));
    }
  },

  delete: async (chainId: CaipNetworkId, address: string): Promise<void> => {
    const normalizedAddress = normalizeAddress(address);
    try {
      const { error } = await getSupabase()
        .from('siwx_sessions_v2')
        .delete()
        .eq('chain_id', chainId)
        .eq('address', normalizedAddress);

      if (error) throw new Error(error.message);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('siwx-session-deleted', { detail: { address: normalizedAddress, chainId } }));
      }
      await cleanupAccountsV2(chainId, normalizedAddress);
    } catch (error) {
      console.error('[SupabaseSIWXStorage] ⚠️ Failed to delete sessions:', error);
    }
  },
};

export default supabaseSIWXStorage;

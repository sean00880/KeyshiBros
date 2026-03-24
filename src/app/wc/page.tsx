import { redirect } from 'next/navigation';

/**
 * WalletConnect universal link handler
 *
 * Wallet apps redirect here after session approval: keyshibros.com/wc?wc_ev=...
 * Server-side redirect to root preserves WC query params in the URL.
 * AppKit SDK (initialized at root layout) auto-detects and handles
 * the connection from any page — no hardcoded destination needed.
 */
export default async function WCRedirect() {
  redirect('/');
}

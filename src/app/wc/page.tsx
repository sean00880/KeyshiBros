import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

/**
 * WalletConnect universal link handler
 *
 * Wallet apps redirect here after session approval: keyshibros.com/wc?wc_ev=...
 * Redirects user back to the page they were on (stored in cookie by AppKitProvider).
 * Falls back to /join-presale if no return path is stored.
 * AppKit SDK auto-handles WC params from any page.
 */
export default async function WCRedirect() {
  const cookieStore = await cookies();
  const returnPath = cookieStore.get('wc_return_path')?.value || '/join-presale';
  redirect(returnPath);
}

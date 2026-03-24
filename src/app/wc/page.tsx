import { redirect } from 'next/navigation';

/**
 * WalletConnect deep link redirect — SERVER component (matching normie-tool)
 *
 * CRITICAL: Must be server-side redirect() to preserve WC query parameters.
 * Client-side useRouter().replace() drops the WC params that AppKit needs
 * to complete the wallet connection/signing flow.
 */
export default async function WCRedirect() {
  redirect('/join-presale');
}

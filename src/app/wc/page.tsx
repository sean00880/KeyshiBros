/**
 * WalletConnect Mobile Redirect Handler
 *
 * Catches mobile wallet redirects after signing operations.
 * Wallet apps redirect here via metadata.redirect.universal URL.
 * AppKit SDK completes the connection via WC relay (WebSocket),
 * not URL params — this page just prevents 404s.
 *
 * Matches normie-tool pattern exactly.
 */
import { redirect } from 'next/navigation';

export default function WCRedirect() {
  redirect('/join-presale');
}

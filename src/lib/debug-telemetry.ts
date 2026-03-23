/**
 * Debug telemetry — sends logs to /api/debug → Supabase appkit_debug_logs
 * Fire-and-forget. Never blocks. Catches all errors silently.
 */
export function debugLog(event: string, data?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  // Console log for local dev
  console.log(`[DEBUG] ${event}`, data || '');

  // Send to backend
  fetch('/api/debug', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      data: data || {},
      url: window.location.href,
    }),
  }).catch(() => {}); // Fire and forget
}

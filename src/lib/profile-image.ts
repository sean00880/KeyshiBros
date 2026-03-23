/**
 * Resolve profile image URL from accounts.profile_image_url
 *
 * MEMELinked stores either:
 * - Full URL (Google avatar): https://lh3.googleusercontent.com/...
 * - Filename only (uploaded): "pfp.jpg" → Supabase storage profiles/{username}/{filename}
 *
 * Uses the same Supabase storage bucket as MEMELinked.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export function resolveProfileImage(
  profileImageUrl: string | null | undefined,
  username: string | null | undefined,
  fallback?: string
): string | null {
  if (!profileImageUrl) return fallback || null;

  // Already a full URL (Google OAuth avatar or absolute path)
  if (profileImageUrl.startsWith('http') || profileImageUrl.startsWith('/')) {
    return profileImageUrl;
  }

  // Filename only — resolve from Supabase storage
  if (username && SUPABASE_URL) {
    return `${SUPABASE_URL}/storage/v1/object/public/profiles/${encodeURIComponent(username)}/${profileImageUrl}`;
  }

  return fallback || null;
}

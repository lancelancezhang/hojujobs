/**
 * Canonical public origin for auth redirects, emails, and SEO.
 * - Set VITE_SITE_URL in Vercel to https://hojujobs.com (no trailing slash).
 * - In dev, falls back to the current host so local OAuth still works.
 * - In production, defaults to hojujobs.com so OAuth never lands on *.vercel.app.
 */
export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return window.location.origin;
  return "https://hojujobs.com";
}

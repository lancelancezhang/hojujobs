import { getSiteOrigin } from "@/lib/siteUrl";

/**
 * Validates `?next=` for post-login redirects (paths on the canonical site only).
 */
export function getSafeNextPath(searchParams: URLSearchParams): string | null {
  const raw = searchParams.get("next");
  if (raw == null || !String(raw).trim()) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(String(raw).trim());
  } catch {
    return null;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
  try {
    const base = getSiteOrigin();
    const u = new URL(decoded, base);
    if (u.origin !== base && u.origin !== window.location.origin) return null;
    return u.pathname + u.search + u.hash;
  } catch {
    return null;
  }
}

export function getPostAuthDestination(searchParams: URLSearchParams): string {
  return getSafeNextPath(searchParams) ?? "/";
}

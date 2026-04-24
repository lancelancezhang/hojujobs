/**
 * Validates `?next=` for post-login redirects (same-origin paths only).
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
    const u = new URL(decoded, window.location.origin);
    if (u.origin !== window.location.origin) return null;
    return u.pathname + u.search + u.hash;
  } catch {
    return null;
  }
}

export function getPostAuthDestination(searchParams: URLSearchParams): string {
  return getSafeNextPath(searchParams) ?? "/";
}

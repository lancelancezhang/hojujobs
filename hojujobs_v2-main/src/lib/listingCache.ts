export function clearListingCaches() {
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("hoju_listing_cache_")) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    // Session storage may be unavailable in private or restricted browser contexts.
  }
}


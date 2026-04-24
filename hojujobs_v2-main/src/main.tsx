import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import App from "./App.tsx";
import "./index.css";

/**
 * Supabase OAuth often returns to the project's "Site URL" in the dashboard (e.g. *.vercel.app).
 * If that URL is still the default Vercel host, bounce to the custom domain with the same path,
 * query, and hash so tokens in #... are preserved and the session still works.
 */
const VERCEL_APP_HOST = "hojujobs.vercel.app";
const CANONICAL_HOST = "hojujobs.com";

if (import.meta.env.PROD && typeof window !== "undefined" && window.location.hostname === VERCEL_APP_HOST) {
  const next = new URL(window.location.href);
  next.hostname = CANONICAL_HOST;
  next.protocol = "https:";
  window.location.replace(next.href);
} else {
  inject();

  createRoot(document.getElementById("root")!).render(<App />);
}

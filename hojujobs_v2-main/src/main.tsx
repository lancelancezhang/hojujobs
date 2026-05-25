import { createRoot } from "react-dom/client";
import { inject, track } from "@vercel/analytics";
import App from "./App.tsx";
import "./index.css";

/**
 * Supabase OAuth often returns to the project's "Site URL" in the dashboard (e.g. *.vercel.app).
 * If that URL is still the default Vercel host, bounce to the custom domain with the same path,
 * query, and hash so tokens in #... are preserved and the session still works.
 */
const VERCEL_APP_HOST = "hojujobs.vercel.app";
const CANONICAL_HOST = "hojujobs.com";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const currentHost = typeof window !== "undefined" ? window.location.hostname : "";

function cleanQrValue(value: string | null) {
  return (value ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function redirectQrPath() {
  const path = window.location.pathname;
  if (!path.startsWith("/qr")) return false;

  const rawCampaign = path
    .replace(/^\/qr\/?/, "")
    .split("/")
    .filter(Boolean)
    .join("-");
  const campaign = cleanQrValue(rawCampaign) || "poster";
  const nextPath = window.location.search ? new URLSearchParams(window.location.search).get("to") : null;
  const targetPath = nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
  const next = new URL(targetPath, window.location.origin);

  next.searchParams.set("utm_source", "offline");
  next.searchParams.set("utm_medium", "qr");
  next.searchParams.set("utm_campaign", campaign);
  window.location.replace(next.href);
  return true;
}

function trackQrVisit() {
  const params = new URLSearchParams(window.location.search);
  const isQrVisit = params.get("utm_medium") === "qr" || params.has("qr_campaign");
  if (!isQrVisit) return;

  const campaign = cleanQrValue(params.get("utm_campaign") || params.get("qr_campaign")) || "unknown";
  const eventKey = `hoju_qr_visit_${campaign}_${window.location.pathname}`;
  if (sessionStorage.getItem(eventKey)) return;

  sessionStorage.setItem(eventKey, "1");
  track("QR Visit", {
    campaign,
    landingPath: window.location.pathname,
  });
}

if (currentHost === VERCEL_APP_HOST) {
  const next = new URL(window.location.href);
  next.hostname = CANONICAL_HOST;
  next.protocol = "https:";
  window.location.replace(next.href);
} else if (redirectQrPath()) {
  // The QR route is only an attribution entrypoint; the real pageview happens after redirect.
} else {
  inject({
    framework: "react",
    mode: LOCAL_HOSTS.has(currentHost) ? "development" : "production",
  });
  trackQrVisit();

  createRoot(document.getElementById("root")!).render(<App />);
}

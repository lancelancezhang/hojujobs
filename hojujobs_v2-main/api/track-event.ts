import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

const ALLOWED_EVENT_NAMES = new Set([
  "job_listing_viewed",
  "rental_listing_viewed",
  "contact_number_clicked",
  "email_clicked",
  "kakao_clicked",
  "text_selected_contact",
  "job_post_started",
  "job_post_submitted",
  "rental_post_started",
  "rental_post_submitted",
  "search_performed",
  "filter_changed",
]);

const ALLOWED_LISTING_TYPES = new Set(["job", "rental"]);

const ALLOWED_CONTACT_TYPES = new Set(["phone", "email", "kakao_id", "unknown_contact"]);

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("[track-event] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { event_name, listing_type, listing_id, page_url, metadata } = body;

  if (typeof event_name !== "string" || !ALLOWED_EVENT_NAMES.has(event_name)) {
    return Response.json(
      { error: `Invalid event_name. Allowed: ${[...ALLOWED_EVENT_NAMES].join(", ")}` },
      { status: 400 },
    );
  }

  if (listing_type !== undefined && listing_type !== null && !ALLOWED_LISTING_TYPES.has(listing_type as string)) {
    return Response.json(
      { error: `Invalid listing_type. Allowed: ${[...ALLOWED_LISTING_TYPES].join(", ")}` },
      { status: 400 },
    );
  }

  if (
    event_name === "text_selected_contact" &&
    metadata &&
    typeof metadata === "object" &&
    !Array.isArray(metadata)
  ) {
    const meta = metadata as Record<string, unknown>;
    const sct = meta.selected_contact_type;
    if (sct !== undefined && !ALLOWED_CONTACT_TYPES.has(sct as string)) {
      return Response.json(
        { error: `Invalid selected_contact_type. Allowed: ${[...ALLOWED_CONTACT_TYPES].join(", ")}` },
        { status: 400 },
      );
    }
  }

  const { error: insertError } = await supabase.from("user_click_events").insert({
    user_id: user.id,
    event_name,
    listing_type: listing_type ?? null,
    listing_id: listing_id != null ? String(listing_id) : null,
    page_url: typeof page_url === "string" ? page_url.slice(0, 500) : null,
    metadata: metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {},
  });

  if (insertError) {
    console.error("[track-event] Insert error:", insertError.message);
    return Response.json({ error: "Failed to record event" }, { status: 500 });
  }

  return Response.json({ success: true });
}

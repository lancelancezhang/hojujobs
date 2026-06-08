import { supabase } from "@/integrations/supabase/client";

export type TrackedEventName =
  | "job_listing_viewed"
  | "rental_listing_viewed"
  | "contact_number_clicked"
  | "email_clicked"
  | "kakao_clicked"
  | "text_selected_contact"
  | "job_post_started"
  | "job_post_submitted"
  | "rental_post_started"
  | "rental_post_submitted"
  | "search_performed"
  | "filter_changed";

export type TrackEventPayload = {
  listing_type?: "job" | "rental";
  listing_id?: string | number;
  metadata?: Record<string, unknown>;
};

export async function trackEvent(
  eventName: TrackedEventName,
  data: TrackEventPayload = {},
): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    const body = {
      event_name: eventName,
      page_url: window.location.href,
      listing_type: data.listing_type,
      listing_id: data.listing_id != null ? String(data.listing_id) : undefined,
      metadata: data.metadata,
    };

    const response = await fetch("/api/track-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok && import.meta.env.DEV) {
      const err = await response.json().catch(() => ({}));
      console.warn("[trackEvent] Failed:", eventName, err);
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("[trackEvent] Error:", eventName, err);
    }
  }
}

# User Activity Tracking

Logged-in user activity is tracked in the Supabase `user_click_events` table. This is the source of truth for per-user analytics. Vercel Analytics is used in parallel for anonymous aggregate stats.

---

## Table: `user_click_events`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | auto-generated |
| `user_id` | uuid | references `auth.users(id)` — set server-side only |
| `event_name` | text | one of the allowed event names below |
| `listing_type` | text | `job`, `rental`, or null |
| `listing_id` | text | listing's integer ID stored as text |
| `page_url` | text | `window.location.href` at time of event |
| `metadata` | jsonb | safe additional context (see below) |
| `created_at` | timestamptz | auto-set |

---

## Tracked Events

| Event | Fired When |
|---|---|
| `job_listing_viewed` | Logged-in user opens a job detail page |
| `rental_listing_viewed` | Logged-in user opens a rental/flatmate detail page |
| `contact_number_clicked` | User clicks a phone number in the contact section |
| `email_clicked` | User clicks an email link in the contact section |
| `kakao_clicked` | User clicks a KakaoTalk ID in the contact section |
| `text_selected_contact` | User highlights text inside the contact details area |
| `job_post_started` | Logged-in user loads the job post form |
| `job_post_submitted` | Job post successfully inserted into database |
| `rental_post_started` | Logged-in user loads the rental post form |
| `rental_post_submitted` | Rental post successfully inserted into database |
| `search_performed` | User types a keyword in the job search box (debounced 1.5s) |
| `filter_changed` | User changes location, industry, or other filters (debounced 1.5s) |

---

## Safe Metadata

These fields are safe to store:

```ts
suburb           // suburb name (Korean)
category         // job industry / listing category
price            // numeric price — already public
room_type        // "private" | "shared"
listing_source   // source identifier if applicable
contact_type     // "phone" | "email" | "kakao_id"
selected_contact_type  // for text_selected_contact events
selection_length // character count of selected text
selected_filters // object of active filter values
search_keyword   // search text (not a contact field)
city_filter      // "NSW" | "VIC" | "QLD" etc.
page_section     // e.g. "contact_details"
```

**Never store:** user email, full name, phone number, Kakao ID value, email address value, message content, form descriptions, raw selected text, or any actual contact detail values.

---

## How to Call `trackEvent`

```ts
import { trackEvent } from "@/lib/trackEvent";

// Basic
trackEvent("job_listing_viewed", {
  listing_type: "job",
  listing_id: job.id,
  metadata: { suburb: "스트라스필드", category: "카페" },
});

// Contact text selection
trackEvent("text_selected_contact", {
  listing_type: "rental",
  listing_id: listing.id,
  metadata: {
    selected_contact_type: "phone",  // "phone" | "email" | "kakao_id" | "unknown_contact"
    page_section: "contact_details",
    selection_length: selectedText.length,
  },
});
```

The function:
- Gets the user's JWT from their Supabase session (skips silently if not logged in)
- POSTs to `/api/track-event` with `Authorization: Bearer <token>`
- Never throws — fails silently in production, `console.warn` in dev

---

## Contact Text Selection

Text selection is tracked in `ContactRevealSection.tsx` only after the contact section is revealed. Detection uses `mouseup` and `touchend` events scoped to the contact area div via `data-contact-field` attributes:

- `data-contact-field="phone"` → `selected_contact_type: "phone"`
- `data-contact-field="email"` → `selected_contact_type: "email"`
- `data-contact-field="kakao"` → `selected_contact_type: "kakao_id"`
- anything else → `selected_contact_type: "unknown_contact"`

The actual selected text is never stored.

---

## Server-Side API: `POST /api/track-event`

Request body:
```json
{
  "event_name": "job_listing_viewed",
  "listing_type": "job",
  "listing_id": "1234",
  "page_url": "https://hojujobs.com/job/1234",
  "metadata": { "suburb": "스트라스필드" }
}
```

The handler:
1. Reads `Authorization: Bearer <jwt>` header
2. Verifies the JWT against Supabase using the service role key
3. Validates `event_name` against the allowlist
4. Inserts with `user_id` from the verified session — never from the request body

**Required env var (Vercel project settings):**
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase project's service role key (Settings → API → Service role key). Never expose this to the frontend.

The function already reads `VITE_SUPABASE_URL` from the existing env var, so no new URL var is needed.

---

## View: `user_activity_summary`

Aggregates events per user. Columns: `user_id`, `total_events`, `job_views`, `rental_views`, `phone_clicks`, `email_clicks`, `kakao_clicks`, `total_contact_clicks`, `contact_text_selections`, `job_posts_started`, `job_posts_submitted`, `rental_posts_started`, `rental_posts_submitted`, `searches_performed`, `filters_changed`, `first_activity`, `last_activity`.

---

## SQL Queries

**Single user's recent activity:**
```sql
select *
from user_click_events
where user_id = 'USER_ID_HERE'
order by created_at desc;
```

**All users summary:**
```sql
select *
from user_activity_summary
order by last_activity desc;
```

**Contact text selections:**
```sql
select *
from user_click_events
where event_name = 'text_selected_contact'
order by created_at desc;
```

**Most active users:**
```sql
select user_id, total_events, job_views, rental_views, total_contact_clicks
from user_activity_summary
order by total_events desc
limit 20;
```

---

## Adding a New Event

1. Add the event name to `ALLOWED_EVENT_NAMES` in `api/track-event.ts`
2. Add it to the `TrackedEventName` union type in `src/lib/trackEvent.ts`
3. Add a `count(*) filter` column to the `user_activity_summary` view (via migration)
4. Call `trackEvent("your_new_event", { ... })` in the relevant component
5. Document it in this file

**Privacy check before adding metadata:** confirm the field contains no personal contact details, message content, or raw user-entered text.

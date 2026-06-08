-- user_click_events: tracks meaningful logged-in user actions
-- listing_id uses text (not uuid) because job/rental IDs are integers
create table if not exists public.user_click_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  event_name   text not null,
  listing_type text,
  listing_id   text,
  page_url     text,
  metadata     jsonb default '{}'::jsonb,
  created_at   timestamptz default now()
);

-- Indexes
create index if not exists idx_uce_user_id        on public.user_click_events(user_id);
create index if not exists idx_uce_event_name     on public.user_click_events(event_name);
create index if not exists idx_uce_listing        on public.user_click_events(listing_type, listing_id);
create index if not exists idx_uce_created_at     on public.user_click_events(created_at);
create index if not exists idx_uce_user_created   on public.user_click_events(user_id, created_at desc);

-- RLS
alter table public.user_click_events enable row level security;

create policy "Users can insert their own events"
  on public.user_click_events for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own events"
  on public.user_click_events for select
  to authenticated
  using (auth.uid() = user_id);

-- user_activity_summary view
create or replace view public.user_activity_summary as
select
  user_id,
  count(*)                                                                     as total_events,
  count(*) filter (where event_name = 'job_listing_viewed')                   as job_views,
  count(*) filter (where event_name = 'rental_listing_viewed')                as rental_views,
  count(*) filter (where event_name = 'contact_number_clicked')               as phone_clicks,
  count(*) filter (where event_name = 'email_clicked')                        as email_clicks,
  count(*) filter (where event_name = 'kakao_clicked')                        as kakao_clicks,
  count(*) filter (where event_name in ('contact_number_clicked','email_clicked','kakao_clicked')) as total_contact_clicks,
  count(*) filter (where event_name = 'text_selected_contact')                as contact_text_selections,
  count(*) filter (where event_name = 'job_post_started')                     as job_posts_started,
  count(*) filter (where event_name = 'job_post_submitted')                   as job_posts_submitted,
  count(*) filter (where event_name = 'rental_post_started')                  as rental_posts_started,
  count(*) filter (where event_name = 'rental_post_submitted')                as rental_posts_submitted,
  count(*) filter (where event_name = 'search_performed')                     as searches_performed,
  count(*) filter (where event_name = 'filter_changed')                       as filters_changed,
  min(created_at)                                                              as first_activity,
  max(created_at)                                                              as last_activity
from public.user_click_events
group by user_id;

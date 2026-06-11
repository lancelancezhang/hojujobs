create table if not exists public.anonymous_click_events (
  id           uuid primary key default gen_random_uuid(),
  anonymous_id text,
  event_name   text not null,
  listing_type text,
  listing_id   text,
  page_url     text,
  metadata     jsonb default '{}'::jsonb,
  country      text,
  user_agent   text,
  created_at   timestamptz default now()
);

create index if not exists idx_ace_event_name on public.anonymous_click_events(event_name);
create index if not exists idx_ace_listing on public.anonymous_click_events(listing_type, listing_id);
create index if not exists idx_ace_created_at on public.anonymous_click_events(created_at);
create index if not exists idx_ace_anon_created on public.anonymous_click_events(anonymous_id, created_at desc);
create index if not exists idx_ace_country on public.anonymous_click_events(country);

alter table public.anonymous_click_events enable row level security;

create or replace function public.get_anonymous_activity_summary(since timestamptz default null)
returns table(
  event_name       text,
  listing_type     text,
  listing_id       text,
  label            text,
  surface          text,
  source           text,
  page_path        text,
  country          text,
  total_events     bigint,
  unique_visitors  bigint,
  first_activity   timestamptz,
  last_activity    timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ) then
    raise exception 'Unauthorized';
  end if;

  return query
    select
      ace.event_name::text,
      ace.listing_type::text,
      ace.listing_id::text,
      coalesce(
        ace.metadata->>'title',
        ace.metadata->>'label',
        ace.metadata->>'target',
        ace.metadata->>'category',
        ace.event_name
      )::text as label,
      (ace.metadata->>'surface')::text as surface,
      coalesce(ace.metadata->>'source', ace.metadata->>'source_url', ace.metadata->>'url')::text as source,
      split_part(coalesce(ace.page_url, ''), '?', 1)::text as page_path,
      ace.country::text,
      count(*)::bigint as total_events,
      count(distinct ace.anonymous_id)::bigint as unique_visitors,
      min(ace.created_at) as first_activity,
      max(ace.created_at) as last_activity
    from public.anonymous_click_events ace
    where (since is null or ace.created_at >= since)
    group by
      ace.event_name,
      ace.listing_type,
      ace.listing_id,
      coalesce(
        ace.metadata->>'title',
        ace.metadata->>'label',
        ace.metadata->>'target',
        ace.metadata->>'category',
        ace.event_name
      ),
      ace.metadata->>'surface',
      coalesce(ace.metadata->>'source', ace.metadata->>'source_url', ace.metadata->>'url'),
      split_part(coalesce(ace.page_url, ''), '?', 1),
      ace.country
    order by count(*) desc, max(ace.created_at) desc nulls last;
end;
$$;

revoke execute on function public.get_anonymous_activity_summary(timestamptz) from anon;
grant execute on function public.get_anonymous_activity_summary(timestamptz) to authenticated;

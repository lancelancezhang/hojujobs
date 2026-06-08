-- Fix: user_id return column was ambiguous with user_roles.user_id in admin check
-- Use table alias 'ur' to qualify the column reference
create or replace function public.get_user_activity_summary(since timestamptz default null)
returns table(
  user_id                uuid,
  email                  text,
  display_name           text,
  country                text,
  total_events           bigint,
  job_views              bigint,
  rental_views           bigint,
  sale_views             bigint,
  flatmates_page_views   bigint,
  sales_page_views       bigint,
  news_page_views        bigint,
  dashboard_page_views   bigint,
  phone_clicks           bigint,
  email_clicks           bigint,
  kakao_clicks           bigint,
  total_contact_clicks   bigint,
  contact_text_selections bigint,
  job_posts_started      bigint,
  job_posts_submitted    bigint,
  rental_posts_started   bigint,
  rental_posts_submitted bigint,
  searches_performed     bigint,
  filters_changed        bigint,
  first_activity         timestamptz,
  last_activity          timestamptz
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
      uce.user_id,
      au.email,
      coalesce(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        au.raw_app_meta_data->>'full_name'
      )::text as display_name,
      (
        select e2.country
        from public.user_click_events e2
        where e2.user_id = uce.user_id and e2.country is not null
          and (since is null or e2.created_at >= since)
        order by e2.created_at desc
        limit 1
      ) as country,
      count(*)                                                                        as total_events,
      count(*) filter (where uce.event_name = 'job_listing_viewed')                  as job_views,
      count(*) filter (where uce.event_name = 'rental_listing_viewed')               as rental_views,
      count(*) filter (where uce.event_name = 'sale_listing_viewed')                 as sale_views,
      count(*) filter (where uce.event_name = 'flatmates_page_viewed')               as flatmates_page_views,
      count(*) filter (where uce.event_name = 'sales_page_viewed')                   as sales_page_views,
      count(*) filter (where uce.event_name = 'news_page_viewed')                    as news_page_views,
      count(*) filter (where uce.event_name = 'dashboard_page_viewed')               as dashboard_page_views,
      count(*) filter (where uce.event_name = 'contact_number_clicked')              as phone_clicks,
      count(*) filter (where uce.event_name = 'email_clicked')                       as email_clicks,
      count(*) filter (where uce.event_name = 'kakao_clicked')                       as kakao_clicks,
      count(*) filter (where uce.event_name = any(array['contact_number_clicked','email_clicked','kakao_clicked'])) as total_contact_clicks,
      count(*) filter (where uce.event_name = 'text_selected_contact')               as contact_text_selections,
      count(*) filter (where uce.event_name = 'job_post_started')                    as job_posts_started,
      count(*) filter (where uce.event_name = 'job_post_submitted')                  as job_posts_submitted,
      count(*) filter (where uce.event_name = 'rental_post_started')                 as rental_posts_started,
      count(*) filter (where uce.event_name = 'rental_post_submitted')               as rental_posts_submitted,
      count(*) filter (where uce.event_name = 'search_performed')                    as searches_performed,
      count(*) filter (where uce.event_name = 'filter_changed')                      as filters_changed,
      min(uce.created_at)                                                             as first_activity,
      max(uce.created_at)                                                             as last_activity
    from public.user_click_events uce
    left join auth.users au on au.id = uce.user_id
    where (since is null or uce.created_at >= since)
    group by uce.user_id, au.email, au.raw_user_meta_data, au.raw_app_meta_data
    order by max(uce.created_at) desc nulls last;
end;
$$;

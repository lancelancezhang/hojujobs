drop function if exists public.get_user_activity_summary(timestamptz);

create or replace function public.get_user_activity_summary(since timestamptz default null)
returns table(
  user_id                 uuid,
  email                   text,
  display_name            text,
  country                 text,
  total_events            bigint,
  job_views               bigint,
  rental_views            bigint,
  sale_views              bigint,
  flatmates_page_views    bigint,
  sales_page_views        bigint,
  news_page_views         bigint,
  dashboard_page_views    bigint,
  phone_clicks            bigint,
  email_clicks            bigint,
  kakao_clicks            bigint,
  total_contact_clicks    bigint,
  contact_text_selections bigint,
  job_posts_started       bigint,
  job_posts_submitted     bigint,
  rental_posts_started    bigint,
  rental_posts_submitted  bigint,
  searches_performed      bigint,
  filters_changed         bigint,
  job_card_clicks         bigint,
  rental_card_clicks      bigint,
  sale_card_clicks        bigint,
  deal_outbound_clicks    bigint,
  map_clicks              bigint,
  news_article_clicks     bigint,
  navigation_clicks       bigint,
  post_cta_clicks         bigint,
  my_posts_clicks         bigint,
  admin_clicks            bigint,
  promote_cta_clicks      bigint,
  auth_events             bigint,
  sales_filters_changed   bigint,
  first_activity          timestamptz,
  last_activity           timestamptz
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
      au.id as user_id,
      au.email::text,
      coalesce(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        au.raw_app_meta_data->>'full_name'
      )::text as display_name,
      (
        select e2.country::text
        from public.user_click_events e2
        where e2.user_id = au.id and e2.country is not null
          and (since is null or e2.created_at >= since)
        order by e2.created_at desc
        limit 1
      ) as country,
      count(uce.id)::bigint,
      count(uce.id) filter (where uce.event_name = 'job_listing_viewed')::bigint,
      count(uce.id) filter (where uce.event_name = 'rental_listing_viewed')::bigint,
      count(uce.id) filter (where uce.event_name = 'sale_listing_viewed')::bigint,
      count(uce.id) filter (where uce.event_name = 'flatmates_page_viewed')::bigint,
      count(uce.id) filter (where uce.event_name = 'sales_page_viewed')::bigint,
      count(uce.id) filter (where uce.event_name = 'news_page_viewed')::bigint,
      count(uce.id) filter (where uce.event_name = 'dashboard_page_viewed')::bigint,
      count(uce.id) filter (where uce.event_name = 'contact_number_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'email_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'kakao_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = any(array['contact_number_clicked','email_clicked','kakao_clicked']))::bigint,
      count(uce.id) filter (where uce.event_name = 'text_selected_contact')::bigint,
      count(uce.id) filter (where uce.event_name = 'job_post_started')::bigint,
      count(uce.id) filter (where uce.event_name = 'job_post_submitted')::bigint,
      count(uce.id) filter (where uce.event_name = 'rental_post_started')::bigint,
      count(uce.id) filter (where uce.event_name = 'rental_post_submitted')::bigint,
      count(uce.id) filter (where uce.event_name = 'search_performed')::bigint,
      count(uce.id) filter (where uce.event_name = 'filter_changed')::bigint,
      count(uce.id) filter (where uce.event_name = 'job_card_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'rental_card_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'sale_card_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'deal_outbound_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'map_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'news_article_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'navigation_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'post_cta_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'my_posts_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'admin_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = 'promote_cta_clicked')::bigint,
      count(uce.id) filter (where uce.event_name = any(array['auth_login_clicked','auth_signup_clicked','auth_google_clicked','auth_mode_toggled']))::bigint,
      count(uce.id) filter (where uce.event_name = 'sales_filter_changed')::bigint,
      min(uce.created_at),
      max(uce.created_at)
    from auth.users au
    left join public.user_click_events uce
      on uce.user_id = au.id
      and (since is null or uce.created_at >= since)
    group by au.id, au.email, au.raw_user_meta_data, au.raw_app_meta_data
    order by max(uce.created_at) desc nulls last, au.created_at desc;
end;
$$;

revoke execute on function public.get_user_activity_summary(timestamptz) from anon;
grant execute on function public.get_user_activity_summary(timestamptz) to authenticated;

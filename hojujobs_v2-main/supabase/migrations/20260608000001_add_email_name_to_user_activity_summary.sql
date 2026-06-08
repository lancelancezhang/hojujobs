drop view if exists public.user_activity_summary;

create view public.user_activity_summary
with (security_invoker = off)
as
select
  uce.user_id,
  au.email,
  coalesce(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    au.raw_app_meta_data->>'full_name'
  ) as display_name,
  count(*)                                                                       as total_events,
  count(*) filter (where uce.event_name = 'job_listing_viewed')                 as job_views,
  count(*) filter (where uce.event_name = 'rental_listing_viewed')              as rental_views,
  count(*) filter (where uce.event_name = 'contact_number_clicked')             as phone_clicks,
  count(*) filter (where uce.event_name = 'email_clicked')                      as email_clicks,
  count(*) filter (where uce.event_name = 'kakao_clicked')                      as kakao_clicks,
  count(*) filter (where uce.event_name in ('contact_number_clicked','email_clicked','kakao_clicked')) as total_contact_clicks,
  count(*) filter (where uce.event_name = 'text_selected_contact')              as contact_text_selections,
  count(*) filter (where uce.event_name = 'job_post_started')                   as job_posts_started,
  count(*) filter (where uce.event_name = 'job_post_submitted')                 as job_posts_submitted,
  count(*) filter (where uce.event_name = 'rental_post_started')                as rental_posts_started,
  count(*) filter (where uce.event_name = 'rental_post_submitted')              as rental_posts_submitted,
  count(*) filter (where uce.event_name = 'search_performed')                   as searches_performed,
  count(*) filter (where uce.event_name = 'filter_changed')                     as filters_changed,
  min(uce.created_at)                                                            as first_activity,
  max(uce.created_at)                                                            as last_activity
from public.user_click_events uce
left join auth.users au on au.id = uce.user_id
group by uce.user_id, au.email, au.raw_user_meta_data, au.raw_app_meta_data;

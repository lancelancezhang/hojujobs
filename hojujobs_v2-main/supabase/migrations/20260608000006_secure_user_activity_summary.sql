-- Revoke direct access to the view from all public roles
revoke select on public.user_activity_summary from anon, authenticated;

-- Admin-only RPC function — checks caller is admin before returning data
create or replace function public.get_user_activity_summary()
returns setof public.user_activity_summary
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Unauthorized';
  end if;

  return query
    select * from public.user_activity_summary
    order by last_activity desc nulls last;
end;
$$;

-- Only authenticated users can call it (the function itself enforces admin check)
revoke execute on function public.get_user_activity_summary() from anon;
grant execute on function public.get_user_activity_summary() to authenticated;

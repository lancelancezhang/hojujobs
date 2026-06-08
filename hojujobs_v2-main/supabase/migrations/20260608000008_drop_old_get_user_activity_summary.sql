-- Drop the old no-param overload that causes ambiguity with the timestamptz version
drop function if exists public.get_user_activity_summary();


-- Remove permissive INSERT/UPDATE policies since increment_view_count uses SECURITY DEFINER
DROP POLICY "Anyone can insert view counts" ON public.view_counts;
DROP POLICY "Anyone can update view counts" ON public.view_counts;

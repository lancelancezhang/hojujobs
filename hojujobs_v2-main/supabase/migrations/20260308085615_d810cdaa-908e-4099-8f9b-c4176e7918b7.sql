
-- Fix: drop restrictive SELECT policy and create a permissive one
DROP POLICY IF EXISTS "Anyone can read view counts" ON public.view_counts;
CREATE POLICY "Anyone can read view counts"
  ON public.view_counts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Enable realtime for view_counts
ALTER PUBLICATION supabase_realtime ADD TABLE public.view_counts;

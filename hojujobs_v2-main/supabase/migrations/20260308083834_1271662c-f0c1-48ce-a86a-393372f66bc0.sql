
-- Create table to track view counts for job posts
CREATE TABLE public.view_counts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id INTEGER NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.view_counts ENABLE ROW LEVEL SECURITY;

-- Anyone can read view counts
CREATE POLICY "Anyone can read view counts"
  ON public.view_counts FOR SELECT
  USING (true);

-- Anyone can insert view counts
CREATE POLICY "Anyone can insert view counts"
  ON public.view_counts FOR INSERT
  WITH CHECK (true);

-- Anyone can update view counts
CREATE POLICY "Anyone can update view counts"
  ON public.view_counts FOR UPDATE
  USING (true);

-- Function to increment view count atomically
CREATE OR REPLACE FUNCTION public.increment_view_count(p_job_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO public.view_counts (job_id, count, updated_at)
  VALUES (p_job_id, 1, now())
  ON CONFLICT (job_id)
  DO UPDATE SET count = view_counts.count + 1, updated_at = now()
  RETURNING count INTO new_count;
  
  RETURN new_count;
END;
$$;

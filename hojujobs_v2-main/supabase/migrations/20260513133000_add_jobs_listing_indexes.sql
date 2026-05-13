-- Speed up public listing queries that filter to recent jobs and sort newest-first.
CREATE INDEX IF NOT EXISTS idx_jobs_uploaded_at_desc
ON public.jobs (uploaded_at DESC);

-- Speed up city pages that filter by Korean suburb arrays using overlaps("location", ...).
CREATE INDEX IF NOT EXISTS idx_jobs_location_gin
ON public.jobs USING gin (location);

-- Speed up the initial promoted jobs query used above the first listing page.
CREATE INDEX IF NOT EXISTS idx_jobs_promoted_uploaded_at_desc
ON public.jobs (uploaded_at DESC)
WHERE "Promoted" IS TRUE;


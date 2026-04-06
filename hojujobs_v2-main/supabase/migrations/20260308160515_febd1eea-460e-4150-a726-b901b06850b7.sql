WITH ranked AS (
  SELECT id,
    '2026-03-08 00:02:21+00'::timestamptz - (ROW_NUMBER() OVER (ORDER BY id ASC) - 1) * INTERVAL '1 second' AS new_uploaded_at
  FROM public.jobs
)
UPDATE public.jobs
SET uploaded_at = ranked.new_uploaded_at
FROM ranked
WHERE jobs.id = ranked.id;
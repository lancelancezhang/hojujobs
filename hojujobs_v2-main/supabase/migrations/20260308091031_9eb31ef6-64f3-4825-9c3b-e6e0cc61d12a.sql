
CREATE TABLE public.jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  industry TEXT NOT NULL,
  type TEXT NOT NULL,
  summary TEXT NOT NULL,
  pay TEXT,
  requirements TEXT[] DEFAULT '{}',
  hours TEXT,
  contact TEXT,
  email TEXT,
  description TEXT,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read jobs"
  ON public.jobs FOR SELECT
  TO anon, authenticated
  USING (true);

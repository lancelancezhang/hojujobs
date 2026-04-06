-- Step 1: Add new column
ALTER TABLE public.jobs ADD COLUMN location_tags text[] DEFAULT '{}';

-- Step 2: Migrate existing data - split on ' / ' delimiter, or use single value
UPDATE public.jobs SET location_tags = 
  CASE 
    WHEN location LIKE '%/%' THEN string_to_array(regexp_replace(location, '\s*/\s*', '/', 'g'), '/')
    ELSE ARRAY[location]
  END;

-- Step 3: Make location_tags NOT NULL
ALTER TABLE public.jobs ALTER COLUMN location_tags SET NOT NULL;

-- Step 4: Drop old column
ALTER TABLE public.jobs DROP COLUMN location;

-- Step 5: Rename new column
ALTER TABLE public.jobs RENAME COLUMN location_tags TO location;
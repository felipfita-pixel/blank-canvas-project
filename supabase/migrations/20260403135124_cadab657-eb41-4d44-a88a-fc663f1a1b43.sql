ALTER TABLE public.brokers 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.broker_presence
  ADD COLUMN IF NOT EXISTS last_assigned_at timestamptz DEFAULT '1970-01-01T00:00:00Z';
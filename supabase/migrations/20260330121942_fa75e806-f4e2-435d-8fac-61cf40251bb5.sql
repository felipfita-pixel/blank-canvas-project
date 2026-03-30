-- Fix 1: Avatar storage - replace broad INSERT with path-scoped policies
DROP POLICY IF EXISTS "Authenticated can upload avatars" ON storage.objects;

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix 2: Prevent brokers from self-approving
DROP POLICY IF EXISTS "Brokers can update own record" ON public.brokers;
CREATE POLICY "Brokers can update own record"
ON public.brokers FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status = (SELECT b.status FROM public.brokers b WHERE b.user_id = auth.uid())
);

-- Fix 3: Add email format CHECK constraints
ALTER TABLE public.contact_messages
  ADD CONSTRAINT valid_email CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$');

ALTER TABLE public.scheduling_requests
  ADD CONSTRAINT valid_email CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$');

ALTER TABLE public.companies
  ADD CONSTRAINT valid_email CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$');
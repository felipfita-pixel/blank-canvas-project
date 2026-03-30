-- Fix 1: Remove the public SELECT policy that exposes phone/email
DROP POLICY IF EXISTS "Public can view approved brokers" ON public.brokers;

-- Fix 2: Recreate brokers_public view with status filter
CREATE OR REPLACE VIEW public.brokers_public AS
SELECT id, full_name, avatar_url, bio, neighborhoods, status, manager_name, company_name, created_at, updated_at, creci
FROM public.brokers
WHERE status = 'approved';
-- Remove the public policy that exposes all columns including phone/email
DROP POLICY IF EXISTS "Public can view approved brokers non-sensitive" ON public.brokers;

-- Recreate view WITHOUT security_invoker - the view itself filters columns and rows safely
DROP VIEW IF EXISTS public.brokers_public;
CREATE VIEW public.brokers_public AS
SELECT id, full_name, avatar_url, bio, neighborhoods, status, manager_name, company_name, created_at, updated_at, creci
FROM public.brokers
WHERE status = 'approved';

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.brokers_public TO anon, authenticated;
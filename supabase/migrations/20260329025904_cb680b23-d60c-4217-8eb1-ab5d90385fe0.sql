
-- Recreate view with security_invoker = on (respects RLS)
DROP VIEW IF EXISTS public.brokers_public;

CREATE VIEW public.brokers_public
WITH (security_invoker = on) AS
SELECT 
  id, full_name, avatar_url, bio, neighborhoods, status,
  manager_name, company_name, created_at, updated_at, creci
FROM public.brokers;

GRANT SELECT ON public.brokers_public TO anon, authenticated;

-- Remove old conflicting policies
DROP POLICY IF EXISTS "Anyone can view approved brokers" ON public.brokers;
DROP POLICY IF EXISTS "Authenticated can view approved brokers" ON public.brokers;
DROP POLICY IF EXISTS "Public can view approved brokers" ON public.brokers;

-- Public (anon + authenticated): only approved brokers visible via view
CREATE POLICY "Public can view approved brokers"
ON public.brokers
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

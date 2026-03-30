-- Re-add a SELECT policy for anon/authenticated on brokers, but only for approved brokers
-- This is needed because brokers_public view with SECURITY INVOKER requires the caller to have SELECT on brokers
CREATE POLICY "Public can view approved brokers non-sensitive"
ON public.brokers
FOR SELECT
TO anon, authenticated
USING (status = 'approved');
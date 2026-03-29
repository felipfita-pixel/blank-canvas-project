-- Create a public view without sensitive contact details (email, phone)
CREATE VIEW public.brokers_public AS
SELECT id, full_name, avatar_url, bio, neighborhoods, status, manager_name, company_name, created_at, updated_at, creci
FROM public.brokers
WHERE status = 'approved';

-- Remove anonymous access to full brokers table (view bypasses RLS)
DROP POLICY "Anyone can view approved brokers" ON public.brokers;

-- Only authenticated users can see full broker details (including email/phone)
CREATE POLICY "Authenticated can view approved brokers"
ON public.brokers FOR SELECT TO authenticated
USING (status = 'approved');
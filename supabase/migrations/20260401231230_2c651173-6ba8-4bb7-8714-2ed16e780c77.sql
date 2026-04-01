DROP VIEW IF EXISTS public.brokers_public;
CREATE VIEW public.brokers_public AS
SELECT id, user_id, full_name, avatar_url, bio, neighborhoods, status, manager_name, company_name, created_at, updated_at, creci
FROM brokers
WHERE status = 'approved';
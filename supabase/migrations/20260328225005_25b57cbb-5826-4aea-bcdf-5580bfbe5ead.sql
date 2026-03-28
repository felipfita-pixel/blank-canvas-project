ALTER TABLE public.brokers ADD COLUMN manager_name text NOT NULL DEFAULT '';
ALTER TABLE public.brokers ADD COLUMN company_name text NOT NULL DEFAULT '';

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  cnpj text DEFAULT '',
  responsible_name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL,
  description text DEFAULT '',
  company_type text NOT NULL DEFAULT 'imobiliaria',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register a company" ON public.companies
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can view all companies" ON public.companies
  FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update companies" ON public.companies
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete companies" ON public.companies
  FOR DELETE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

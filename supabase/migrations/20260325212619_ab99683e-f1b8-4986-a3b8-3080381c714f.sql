
DROP POLICY "Anyone can register a company" ON public.companies;
CREATE POLICY "Anyone can register a company" ON public.companies
  FOR INSERT TO public WITH CHECK (
    length(trim(company_name)) > 0 AND
    length(trim(email)) > 3 AND
    length(trim(responsible_name)) > 0
  );

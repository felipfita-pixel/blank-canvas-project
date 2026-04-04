
CREATE TABLE public.property_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  cep text NOT NULL DEFAULT '',
  property_type text NOT NULL DEFAULT 'apartment',
  bedrooms integer DEFAULT 0,
  area numeric DEFAULT 0,
  price_range text DEFAULT '',
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a listing" ON public.property_listings
  FOR INSERT TO public
  WITH CHECK (length(TRIM(BOTH FROM name)) > 0 AND length(TRIM(BOTH FROM email)) > 3);

CREATE POLICY "Admins can view all listings" ON public.property_listings
  FOR SELECT TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update listings" ON public.property_listings
  FOR UPDATE TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete listings" ON public.property_listings
  FOR DELETE TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_property_listings_updated_at
  BEFORE UPDATE ON public.property_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

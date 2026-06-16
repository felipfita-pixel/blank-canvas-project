
CREATE TABLE public.property_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.property_collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_collections TO authenticated;
GRANT ALL ON public.property_collections TO service_role;

ALTER TABLE public.property_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read collections"
  ON public.property_collections FOR SELECT
  USING (true);

CREATE POLICY "Admins manage collections"
  ON public.property_collections FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_property_collections_updated
  BEFORE UPDATE ON public.property_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


CREATE TABLE public.property_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.property_collections(id) ON DELETE CASCADE,
  property_id text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, property_id)
);

CREATE INDEX idx_pci_collection_position
  ON public.property_collection_items (collection_id, position);

GRANT SELECT ON public.property_collection_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_collection_items TO authenticated;
GRANT ALL ON public.property_collection_items TO service_role;

ALTER TABLE public.property_collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read collection items"
  ON public.property_collection_items FOR SELECT
  USING (true);

CREATE POLICY "Admins manage collection items"
  ON public.property_collection_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

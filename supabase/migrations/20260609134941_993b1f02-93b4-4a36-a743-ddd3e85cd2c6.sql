
CREATE TABLE public.property_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, session_id)
);

CREATE INDEX property_views_property_id_idx ON public.property_views (property_id);

GRANT SELECT ON public.property_views TO anon, authenticated;
GRANT ALL ON public.property_views TO service_role;

ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read property views"
  ON public.property_views FOR SELECT
  USING (true);

CREATE POLICY "Service role manages property views"
  ON public.property_views FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE OR REPLACE VIEW public.property_view_counts
WITH (security_invoker = on) AS
  SELECT property_id, COUNT(*)::bigint AS views
  FROM public.property_views
  GROUP BY property_id;

GRANT SELECT ON public.property_view_counts TO anon, authenticated;

CREATE OR REPLACE VIEW public.property_views_total
WITH (security_invoker = on) AS
  SELECT COUNT(*)::bigint AS total FROM public.property_views;

GRANT SELECT ON public.property_views_total TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_property_view(p_property_id text, p_session_id text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count bigint;
BEGIN
  IF p_property_id IS NULL OR length(trim(p_property_id)) = 0
     OR p_session_id IS NULL OR length(trim(p_session_id)) < 8 THEN
    RAISE EXCEPTION 'Invalid arguments';
  END IF;

  INSERT INTO public.property_views (property_id, session_id)
  VALUES (p_property_id, p_session_id)
  ON CONFLICT (property_id, session_id) DO NOTHING;

  SELECT COUNT(*) INTO v_count FROM public.property_views WHERE property_id = p_property_id;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_property_view(text, text) TO anon, authenticated;


DROP POLICY IF EXISTS "Authenticated can read presence" ON public.broker_presence;

CREATE POLICY "Anyone can read presence"
ON public.broker_presence
FOR SELECT
TO public
USING (true);

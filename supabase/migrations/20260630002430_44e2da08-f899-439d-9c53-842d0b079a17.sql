
-- 1. chat_messages: restrict broker SELECT to authenticated role
DROP POLICY IF EXISTS "Brokers can view assigned chat" ON public.chat_messages;
CREATE POLICY "Brokers can view assigned chat"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (broker_id IN (SELECT id FROM public.brokers WHERE user_id = auth.uid()));

-- 2. broker_presence: remove public SELECT, restrict to authenticated
DROP POLICY IF EXISTS "Anyone can read presence" ON public.broker_presence;
CREATE POLICY "Authenticated can read presence"
ON public.broker_presence
FOR SELECT
TO authenticated
USING (true);

-- 3. Provide a safe public function returning only broker IDs that are online
CREATE OR REPLACE FUNCTION public.get_online_broker_ids()
RETURNS TABLE(broker_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id
  FROM public.brokers b
  JOIN public.broker_presence p ON p.user_id = b.user_id
  WHERE p.is_online = true
    AND b.deleted_at IS NULL
    AND b.status = 'approved';
$$;

GRANT EXECUTE ON FUNCTION public.get_online_broker_ids() TO anon, authenticated;


-- 1. Fix chat_messages anonymous insert: validate broker_id and force is_from_client
DROP POLICY IF EXISTS "Anyone can send chat" ON public.chat_messages;

CREATE POLICY "Anyone can send chat"
ON public.chat_messages
FOR INSERT
TO public
WITH CHECK (
  length(trim(sender_name)) > 0
  AND length(trim(message)) > 0
  AND is_from_client = true
  AND (
    broker_id IS NULL
    OR broker_id IN (
      SELECT id FROM public.brokers
      WHERE status = 'approved' AND deleted_at IS NULL
    )
  )
);

-- 2. Restrict user_roles inserts to service_role only (no self-escalation)
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

CREATE POLICY "Service role can insert roles"
ON public.user_roles
FOR INSERT
TO public
WITH CHECK (auth.role() = 'service_role');

-- 3. Restrict broker_presence SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can read presence" ON public.broker_presence;

CREATE POLICY "Authenticated can read presence"
ON public.broker_presence
FOR SELECT
TO authenticated
USING (true);

-- 4. Realtime channel authorization
-- Allow authenticated brokers/admins to subscribe to chat + presence topics only
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='realtime' AND table_name='messages') THEN
    EXECUTE 'ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Authenticated brokers can read realtime" ON realtime.messages';
    EXECUTE $p$
      CREATE POLICY "Authenticated brokers can read realtime"
      ON realtime.messages
      FOR SELECT
      TO authenticated
      USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR EXISTS (SELECT 1 FROM public.brokers b WHERE b.user_id = auth.uid())
      )
    $p$;
  END IF;
END $$;

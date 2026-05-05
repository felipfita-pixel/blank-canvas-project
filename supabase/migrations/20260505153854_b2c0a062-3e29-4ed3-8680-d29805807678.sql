
-- 1. Remove the dangerous public SELECT on chat_messages
DROP POLICY IF EXISTS "Anyone can read own conversation" ON public.chat_messages;

-- 2. Create a SECURITY DEFINER function for anon clients to read ONLY their own conversation
CREATE OR REPLACE FUNCTION public.get_conversation_messages(p_conversation_id text)
RETURNS TABLE (
  id uuid,
  message text,
  is_from_client boolean,
  created_at timestamptz,
  file_url text,
  file_name text,
  file_type text,
  sender_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, message, is_from_client, created_at, file_url, file_name, file_type, sender_name
  FROM public.chat_messages
  WHERE conversation_id = p_conversation_id
    AND length(trim(p_conversation_id)) >= 16
  ORDER BY created_at ASC
$$;

GRANT EXECUTE ON FUNCTION public.get_conversation_messages(text) TO anon, authenticated;

-- 3. Restore Realtime public access (capability-URL model: only known conversation UUIDs are subscribed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='realtime' AND table_name='messages') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated brokers can read realtime" ON realtime.messages';
    EXECUTE $p$
      CREATE POLICY "Public can read realtime"
      ON realtime.messages
      FOR SELECT
      TO public
      USING (true)
    $p$;
  END IF;
END $$;

-- 4. Defensive trigger: block any INSERT/UPDATE on user_roles unless caller is service_role or postgres
CREATE OR REPLACE FUNCTION public.guard_user_roles_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Role assignment is only allowed via service_role';
END;
$$;

DROP TRIGGER IF EXISTS guard_user_roles_writes_trigger ON public.user_roles;
CREATE TRIGGER guard_user_roles_writes_trigger
BEFORE INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.guard_user_roles_writes();

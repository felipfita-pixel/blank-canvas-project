
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS claimed_by uuid;

CREATE TABLE IF NOT EXISTS public.broker_presence (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  is_typing_conversation text DEFAULT ''
);

ALTER TABLE public.broker_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read presence" ON public.broker_presence FOR SELECT TO public USING (true);
CREATE POLICY "Users update own presence" ON public.broker_presence FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own presence" ON public.broker_presence FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE broker_presence;

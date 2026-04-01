CREATE POLICY "Anyone can read own conversation"
ON public.chat_messages FOR SELECT
TO public
USING (true);
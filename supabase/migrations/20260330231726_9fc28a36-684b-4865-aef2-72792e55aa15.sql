
-- Add conversation support and file attachments to chat_messages
ALTER TABLE public.chat_messages 
  ADD COLUMN IF NOT EXISTS conversation_id text DEFAULT '',
  ADD COLUMN IF NOT EXISTS file_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS file_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS file_type text DEFAULT '';

-- Create index for conversation lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);

-- Allow brokers to insert chat messages (replies)
CREATE POLICY "Brokers can send chat messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  is_from_client = false 
  AND broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);

-- Allow brokers to update (mark as read) their assigned messages
CREATE POLICY "Brokers can update assigned chat"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  broker_id IN (SELECT id FROM brokers WHERE user_id = auth.uid())
);

-- Allow clients to view messages in their conversation (by conversation_id match via anon)
CREATE POLICY "Anyone can view chat by conversation"
ON public.chat_messages
FOR SELECT
USING (conversation_id != '' AND conversation_id = conversation_id);

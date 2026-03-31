
-- Fix 1: Drop the broken "Anyone can view chat by conversation" policy
-- The condition (conversation_id <> '' AND conversation_id = conversation_id) always evaluates to true
DROP POLICY IF EXISTS "Anyone can view chat by conversation" ON public.chat_messages;

-- Fix 2: Add unique constraint on brokers.user_id to prevent duplicate registrations
-- First clean up any potential duplicates (keep the earliest)
DELETE FROM public.brokers a
USING public.brokers b
WHERE a.user_id IS NOT NULL
  AND a.user_id = b.user_id
  AND a.created_at > b.created_at;

-- Now add the unique constraint (only for non-null user_id)
CREATE UNIQUE INDEX IF NOT EXISTS brokers_user_id_unique ON public.brokers (user_id) WHERE user_id IS NOT NULL;

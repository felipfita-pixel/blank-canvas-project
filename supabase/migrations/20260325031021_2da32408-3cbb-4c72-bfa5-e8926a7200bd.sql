
-- Fix the overly permissive INSERT policy on contact_messages
-- Replace WITH CHECK (true) with a check that requires non-empty name and email
DROP POLICY "Anyone can send a message" ON public.contact_messages;
CREATE POLICY "Anyone can send a message" ON public.contact_messages
  FOR INSERT WITH CHECK (
    length(trim(name)) > 0 AND length(trim(email)) > 3
  );

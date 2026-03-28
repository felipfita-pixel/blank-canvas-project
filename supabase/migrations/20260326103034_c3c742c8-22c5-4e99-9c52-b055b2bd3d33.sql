
-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL DEFAULT '',
  sender_email text NOT NULL DEFAULT '',
  sender_phone text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  is_from_client boolean NOT NULL DEFAULT true,
  broker_id uuid REFERENCES public.brokers(id) ON DELETE SET NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can send a chat message
CREATE POLICY "Anyone can send chat" ON public.chat_messages
  FOR INSERT TO public WITH CHECK (
    length(trim(sender_name)) > 0 AND length(trim(message)) > 0
  );

-- Admins can view all chat messages
CREATE POLICY "Admins can view chat" ON public.chat_messages
  FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update chat messages
CREATE POLICY "Admins can update chat" ON public.chat_messages
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Brokers can view their assigned messages
CREATE POLICY "Brokers can view assigned chat" ON public.chat_messages
  FOR SELECT TO public USING (
    broker_id IN (SELECT id FROM public.brokers WHERE user_id = auth.uid())
  );

-- Scheduling requests table
CREATE TABLE public.scheduling_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduling_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create a scheduling request
CREATE POLICY "Anyone can schedule" ON public.scheduling_requests
  FOR INSERT TO public WITH CHECK (
    length(trim(name)) > 0 AND length(trim(email)) > 3
  );

-- Admins can view scheduling requests
CREATE POLICY "Admins can view scheduling" ON public.scheduling_requests
  FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update scheduling requests
CREATE POLICY "Admins can update scheduling" ON public.scheduling_requests
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

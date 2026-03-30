
CREATE OR REPLACE FUNCTION public.register_broker(
  p_user_id uuid,
  p_full_name text,
  p_email text,
  p_phone text DEFAULT '',
  p_creci text DEFAULT '',
  p_bio text DEFAULT '',
  p_manager_name text DEFAULT '',
  p_company_name text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;

  INSERT INTO public.brokers (user_id, full_name, email, phone, creci, bio, manager_name, company_name, status)
  VALUES (p_user_id, p_full_name, p_email, p_phone, p_creci, p_bio, p_manager_name, p_company_name, 'pending');
END;
$$;

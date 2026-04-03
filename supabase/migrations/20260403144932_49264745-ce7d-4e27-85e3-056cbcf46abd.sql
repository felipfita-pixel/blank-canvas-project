-- Insert Felipe as broker only if not already registered
INSERT INTO public.brokers (user_id, full_name, email, phone, creci, status, company_name, manager_name, bio)
SELECT 
  'f7119a66-2d28-4ed2-9c43-af5b7af11ee8',
  'Felipe Fita',
  'felipfita@gmail.com',
  '',
  '93051',
  'approved',
  'FF Imobiliária',
  'Felipe Fita',
  'Corretor e administrador da FF Imobiliária.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.brokers WHERE user_id = 'f7119a66-2d28-4ed2-9c43-af5b7af11ee8'
);

-- Add broker role only if not exists
INSERT INTO public.user_roles (user_id, role)
SELECT 'f7119a66-2d28-4ed2-9c43-af5b7af11ee8', 'broker'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = 'f7119a66-2d28-4ed2-9c43-af5b7af11ee8' AND role = 'broker'
);
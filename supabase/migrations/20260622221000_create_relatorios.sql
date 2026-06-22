DO $BODY$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'anselmoricardos@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'anselmoricardos@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Anselmo Ricardo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;
END $BODY$;

CREATE TABLE IF NOT EXISTS public.relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    mes_referencia TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "relatorios_select" ON public.relatorios;
CREATE POLICY "relatorios_select" ON public.relatorios FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "relatorios_insert" ON public.relatorios;
CREATE POLICY "relatorios_insert" ON public.relatorios FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "relatorios_update" ON public.relatorios;
CREATE POLICY "relatorios_update" ON public.relatorios FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "relatorios_delete" ON public.relatorios;
CREATE POLICY "relatorios_delete" ON public.relatorios FOR DELETE TO authenticated USING (user_id = auth.uid());

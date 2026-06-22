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

-- Ensure RLS is enabled for all relevant tables
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acompanhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valuations ENABLE ROW LEVEL SECURITY;

-- Empresas policies
DROP POLICY IF EXISTS "empresas_select" ON public.empresas;
CREATE POLICY "empresas_select" ON public.empresas FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "empresas_insert" ON public.empresas;
CREATE POLICY "empresas_insert" ON public.empresas FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "empresas_update" ON public.empresas;
CREATE POLICY "empresas_update" ON public.empresas FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "empresas_delete" ON public.empresas;
CREATE POLICY "empresas_delete" ON public.empresas FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Diagnosticos policies
DROP POLICY IF EXISTS "diagnosticos_select" ON public.diagnosticos;
CREATE POLICY "diagnosticos_select" ON public.diagnosticos FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "diagnosticos_insert" ON public.diagnosticos;
CREATE POLICY "diagnosticos_insert" ON public.diagnosticos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "diagnosticos_update" ON public.diagnosticos;
CREATE POLICY "diagnosticos_update" ON public.diagnosticos FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "diagnosticos_delete" ON public.diagnosticos;
CREATE POLICY "diagnosticos_delete" ON public.diagnosticos FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Acompanhamentos policies
DROP POLICY IF EXISTS "acompanhamentos_select" ON public.acompanhamentos;
CREATE POLICY "acompanhamentos_select" ON public.acompanhamentos FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "acompanhamentos_insert" ON public.acompanhamentos;
CREATE POLICY "acompanhamentos_insert" ON public.acompanhamentos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "acompanhamentos_update" ON public.acompanhamentos;
CREATE POLICY "acompanhamentos_update" ON public.acompanhamentos FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "acompanhamentos_delete" ON public.acompanhamentos;
CREATE POLICY "acompanhamentos_delete" ON public.acompanhamentos FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Assinaturas policies
DROP POLICY IF EXISTS "assinaturas_select" ON public.assinaturas;
CREATE POLICY "assinaturas_select" ON public.assinaturas FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "assinaturas_insert" ON public.assinaturas;
CREATE POLICY "assinaturas_insert" ON public.assinaturas FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "assinaturas_update" ON public.assinaturas;
CREATE POLICY "assinaturas_update" ON public.assinaturas FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "assinaturas_delete" ON public.assinaturas;
CREATE POLICY "assinaturas_delete" ON public.assinaturas FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Valuations policies
DROP POLICY IF EXISTS "valuations_select" ON public.valuations;
CREATE POLICY "valuations_select" ON public.valuations FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "valuations_insert" ON public.valuations;
CREATE POLICY "valuations_insert" ON public.valuations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "valuations_update" ON public.valuations;
CREATE POLICY "valuations_update" ON public.valuations FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "valuations_delete" ON public.valuations;
CREATE POLICY "valuations_delete" ON public.valuations FOR DELETE TO authenticated USING (user_id = auth.uid());

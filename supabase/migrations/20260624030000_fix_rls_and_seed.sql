DO $do$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Seed user: anselmoricardos@gmail.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'anselmoricardos@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
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

    INSERT INTO public.assinaturas (id, user_id, plano, status)
    VALUES (gen_random_uuid(), v_user_id, 'consult', 'ativo')
    ON CONFLICT DO NOTHING;
  END IF;

  -- 2. Update RLS Policies for empresas
  DROP POLICY IF EXISTS "empresas_select" ON public.empresas;
  CREATE POLICY "empresas_select" ON public.empresas FOR SELECT TO authenticated USING (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "empresas_insert" ON public.empresas;
  CREATE POLICY "empresas_insert" ON public.empresas FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "empresas_update" ON public.empresas;
  CREATE POLICY "empresas_update" ON public.empresas FOR UPDATE TO authenticated USING (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "empresas_delete" ON public.empresas;
  CREATE POLICY "empresas_delete" ON public.empresas FOR DELETE TO authenticated USING (user_id = auth.uid());

  -- 3. Update RLS Policies for diagnosticos
  DROP POLICY IF EXISTS "diagnosticos_select" ON public.diagnosticos;
  CREATE POLICY "diagnosticos_select" ON public.diagnosticos FOR SELECT TO authenticated USING (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "diagnosticos_insert" ON public.diagnosticos;
  CREATE POLICY "diagnosticos_insert" ON public.diagnosticos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "diagnosticos_update" ON public.diagnosticos;
  CREATE POLICY "diagnosticos_update" ON public.diagnosticos FOR UPDATE TO authenticated USING (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "diagnosticos_delete" ON public.diagnosticos;
  CREATE POLICY "diagnosticos_delete" ON public.diagnosticos FOR DELETE TO authenticated USING (user_id = auth.uid());

  -- 4. Update RLS Policies for documentos_contabeis
  DROP POLICY IF EXISTS "documentos_contabeis_select" ON public.documentos_contabeis;
  CREATE POLICY "documentos_contabeis_select" ON public.documentos_contabeis FOR SELECT TO authenticated USING (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "documentos_contabeis_insert" ON public.documentos_contabeis;
  CREATE POLICY "documentos_contabeis_insert" ON public.documentos_contabeis FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "documentos_contabeis_update" ON public.documentos_contabeis;
  CREATE POLICY "documentos_contabeis_update" ON public.documentos_contabeis FOR UPDATE TO authenticated USING (user_id = auth.uid());
  
  DROP POLICY IF EXISTS "documentos_contabeis_delete" ON public.documentos_contabeis;
  CREATE POLICY "documentos_contabeis_delete" ON public.documentos_contabeis FOR DELETE TO authenticated USING (user_id = auth.uid());

END $do$;

DO $BODY$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent: skip if email already exists)
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

CREATE TABLE IF NOT EXISTS public.documentos_contabeis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome_arquivo TEXT NOT NULL,
    url_arquivo TEXT NOT NULL,
    tipo_documento TEXT,
    status TEXT DEFAULT 'pendente',
    analise_ia JSONB,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.documentos_contabeis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documentos_contabeis_select" ON public.documentos_contabeis;
CREATE POLICY "documentos_contabeis_select" ON public.documentos_contabeis FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "documentos_contabeis_insert" ON public.documentos_contabeis;
CREATE POLICY "documentos_contabeis_insert" ON public.documentos_contabeis FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "documentos_contabeis_update" ON public.documentos_contabeis;
CREATE POLICY "documentos_contabeis_update" ON public.documentos_contabeis FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "documentos_contabeis_delete" ON public.documentos_contabeis;
CREATE POLICY "documentos_contabeis_delete" ON public.documentos_contabeis FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Storage Bucket setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos', 'documentos', false) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "User can manage their own documents" ON storage.objects;
CREATE POLICY "User can manage their own documents" ON storage.objects 
FOR ALL TO authenticated 
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]) 
WITH CHECK (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

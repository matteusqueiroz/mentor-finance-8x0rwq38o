DO $do$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seed user 1 (idempotent: skip if email already exists)
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Anselmo Ricardo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'anselmoricardos@gmail.com';
  END IF;

  -- Ensure subscription exists and is mentor_consult
  IF NOT EXISTS (SELECT 1 FROM public.assinaturas WHERE user_id = v_user_id) THEN
    INSERT INTO public.assinaturas (id, user_id, plano, status)
    VALUES (gen_random_uuid(), v_user_id, 'mentor_consult', 'ativo');
  ELSE
    UPDATE public.assinaturas
    SET plano = 'mentor_consult', status = 'ativo'
    WHERE user_id = v_user_id;
  END IF;
END $do$;

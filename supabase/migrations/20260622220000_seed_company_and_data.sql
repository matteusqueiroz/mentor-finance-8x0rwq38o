DO $BODY$
DECLARE
  v_user_id uuid;
  v_empresa_id uuid;
  v_diag_id uuid;
BEGIN
  -- Find the seed user
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'anselmoricardos@gmail.com' LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    -- Check if user already has a company
    SELECT id INTO v_empresa_id FROM public.empresas WHERE user_id = v_user_id LIMIT 1;
    
    -- If no company exists, seed one
    IF v_empresa_id IS NULL THEN
      v_empresa_id := gen_random_uuid();
      INSERT INTO public.empresas (id, user_id, nome_empresa, setor, regime_tributario, tipo_clientes, faturamento_anual)
      VALUES (v_empresa_id, v_user_id, 'Mentor Solutions Ltda', 'Tecnologia', 'Simples Nacional', 'B2B', 600000);
    END IF;

    -- Seed an initial diagnostic if none exists for this company
    SELECT id INTO v_diag_id FROM public.diagnosticos WHERE empresa_id = v_empresa_id LIMIT 1;
    IF v_diag_id IS NULL THEN
      v_diag_id := gen_random_uuid();
      INSERT INTO public.diagnosticos (id, empresa_id, user_id, dados)
      VALUES (v_diag_id, v_empresa_id, v_user_id, '{"nota_geral": 8.2, "status": "saudavel"}');
    END IF;

    -- Seed monthly performance monitoring data (acompanhamentos)
    IF NOT EXISTS (SELECT 1 FROM public.acompanhamentos WHERE empresa_id = v_empresa_id) THEN
      INSERT INTO public.acompanhamentos (empresa_id, user_id, diagnostico_id, mes_referencia, faturamento_realizado, resultado_valor)
      VALUES 
        (v_empresa_id, v_user_id, v_diag_id, '2023-01', 40000, 12000),
        (v_empresa_id, v_user_id, v_diag_id, '2023-02', 45000, 15000),
        (v_empresa_id, v_user_id, v_diag_id, '2023-03', 42000, 11000),
        (v_empresa_id, v_user_id, v_diag_id, '2023-04', 50000, 16000),
        (v_empresa_id, v_user_id, v_diag_id, '2023-05', 48000, 14000),
        (v_empresa_id, v_user_id, v_diag_id, '2023-06', 55000, 18000);
    END IF;

    -- Seed a latest valuation
    IF NOT EXISTS (SELECT 1 FROM public.valuations WHERE user_id = v_user_id) THEN
      INSERT INTO public.valuations (empresa_id, user_id, premissas, resultado)
      VALUES (v_empresa_id, v_user_id, '{"taxa_desconto": 12}', '{"valor_empresa": 1500000, "ebitda_estimado": 250000, "multiplo": 6}');
    END IF;
  END IF;
END $BODY$;

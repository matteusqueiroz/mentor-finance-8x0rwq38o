DO $$ 
BEGIN
    ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS email_contabilidade TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acesso_proprias_notificacoes" ON public.notificacoes;
CREATE POLICY "acesso_proprias_notificacoes" ON public.notificacoes
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_documento_status_change()
RETURNS trigger AS $BODY$
BEGIN
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    INSERT INTO public.notificacoes (user_id, titulo, mensagem)
    VALUES (
      NEW.user_id,
      'Documento Processado',
      'O documento ' || NEW.nome_arquivo || ' foi analisado com sucesso e os dados foram extraídos.'
    );
  END IF;
  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_documento_status_change ON public.documentos_contabeis;
CREATE TRIGGER on_documento_status_change
  AFTER UPDATE OF status ON public.documentos_contabeis
  FOR EACH ROW EXECUTE FUNCTION public.handle_documento_status_change();

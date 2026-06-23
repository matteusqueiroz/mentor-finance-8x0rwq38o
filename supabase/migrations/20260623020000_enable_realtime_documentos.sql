-- Enable logical replication for realtime on documentos_contabeis if not already enabled
DO $BODY$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'documentos_contabeis'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.documentos_contabeis;
  END IF;
END $BODY$;

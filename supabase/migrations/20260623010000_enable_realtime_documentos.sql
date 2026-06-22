DO $BODY$
BEGIN
  -- Create the publication if it does not exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $BODY$;

DO $BODY$
BEGIN
  -- Add table to publication safely
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'documentos_contabeis'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.documentos_contabeis;
  END IF;
END $BODY$;

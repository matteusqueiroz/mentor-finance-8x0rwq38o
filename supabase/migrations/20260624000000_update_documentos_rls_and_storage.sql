-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'documentos' bucket
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documentos' AND (auth.uid())::text = (string_to_array(name, '/'))[1]);

DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'documentos' AND (auth.uid())::text = (string_to_array(name, '/'))[1]);

DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
CREATE POLICY "Users can update own documents" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'documentos' AND (auth.uid())::text = (string_to_array(name, '/'))[1]);

DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'documentos' AND (auth.uid())::text = (string_to_array(name, '/'))[1]);

-- Verify and enforce RLS on documentos_contabeis table
ALTER TABLE public.documentos_contabeis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documentos_contabeis_insert" ON public.documentos_contabeis;
CREATE POLICY "documentos_contabeis_insert" ON public.documentos_contabeis
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "documentos_contabeis_select" ON public.documentos_contabeis;
CREATE POLICY "documentos_contabeis_select" ON public.documentos_contabeis
FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "documentos_contabeis_update" ON public.documentos_contabeis;
CREATE POLICY "documentos_contabeis_update" ON public.documentos_contabeis
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "documentos_contabeis_delete" ON public.documentos_contabeis;
CREATE POLICY "documentos_contabeis_delete" ON public.documentos_contabeis
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- RLS para o bucket speaker-photos no Supabase Storage
-- Execute no Supabase SQL Editor

-- Leitura pública (qualquer um pode ver as fotos)
CREATE POLICY "Public read speaker-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'speaker-photos');

-- Upload apenas para usuários autenticados
CREATE POLICY "Authenticated upload speaker-photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'speaker-photos');

-- Update apenas para usuários autenticados
CREATE POLICY "Authenticated update speaker-photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'speaker-photos');

-- Delete apenas para usuários autenticados
CREATE POLICY "Authenticated delete speaker-photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'speaker-photos');

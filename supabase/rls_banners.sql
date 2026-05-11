-- Bucket: banners (PNG gerados pelo /api/banner)
-- 1. Crie o bucket no Supabase: Storage → New bucket → "banners" → Public: ON
-- 2. Execute este script no SQL Editor

CREATE POLICY "Public read banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "Authenticated upload banners"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Authenticated update banners"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'banners');

-- Colunas de banner na tabela hero_slides
ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS banner_url     text,
  ADD COLUMN IF NOT EXISTS banner_web_url text;

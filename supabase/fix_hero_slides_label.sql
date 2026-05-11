-- Fix: torna as colunas legadas do hero_slides opcionais
-- Execute no Supabase SQL Editor

ALTER TABLE public.hero_slides
  ALTER COLUMN label     SET DEFAULT '',
  ALTER COLUMN label     DROP NOT NULL,
  ALTER COLUMN title     SET DEFAULT '',
  ALTER COLUMN title     DROP NOT NULL,
  ALTER COLUMN meta      SET DEFAULT '',
  ALTER COLUMN meta      DROP NOT NULL,
  ALTER COLUMN image_url DROP NOT NULL;

-- Adiciona as novas colunas se ainda não existirem
ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS speaker_name  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS theme         text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS event_date    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS event_weekday text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS event_time    text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS platforms     text NOT NULL DEFAULT 'YouTube';

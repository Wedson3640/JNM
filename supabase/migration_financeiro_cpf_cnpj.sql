-- ============================================================
-- Migração: Adiciona coluna cpf_cnpj nas tabelas financeiras
-- Execute no Supabase SQL Editor
-- ============================================================

ALTER TABLE public.financeiro_receitas
  ADD COLUMN IF NOT EXISTS cpf_cnpj text;

ALTER TABLE public.financeiro_pagamentos
  ADD COLUMN IF NOT EXISTS cpf_cnpj text;

-- Verificar estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('financeiro_receitas', 'financeiro_pagamentos')
  AND column_name = 'cpf_cnpj';

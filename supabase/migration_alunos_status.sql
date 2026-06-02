-- ============================================================
-- Migração: Padroniza o campo status dos alunos
-- Execute no Supabase SQL Editor
-- ============================================================

-- Valores encontrados na tabela:
--   Transferido   → 143  (veio de outra escola → Matriculado)
--   Não informado → 118  (sem info → Matriculado)
--   Renovado      → 63   (renovou matrícula → Matriculado)
--   Novo          → 55   (primeiro ingresso → Matriculado)
--
-- ATENÇÃO: Se "Transferido" = aluno que SAIU da escola,
-- troque a linha correspondente abaixo por: SET status = 'Transferido'

-- Remove constraint antiga (caso exista de tentativa anterior)
ALTER TABLE public.alunos
  DROP CONSTRAINT IF EXISTS alunos_status_check;

-- Adiciona coluna para preservar o tipo de cadastro original
ALTER TABLE public.alunos
  ADD COLUMN IF NOT EXISTS tipo_cadastro_origem text;

-- Salva o valor original antes de sobrescrever
UPDATE public.alunos
SET tipo_cadastro_origem = status
WHERE tipo_cadastro_origem IS NULL;

-- Converte todos para o novo padrão
UPDATE public.alunos SET status = 'Matriculado' WHERE status IN ('Novo', 'Renovado', 'Não informado', 'Transferido');

-- Altera o valor padrão
ALTER TABLE public.alunos
  ALTER COLUMN status SET DEFAULT 'Matriculado';

-- Adiciona constraint com valores válidos
ALTER TABLE public.alunos
  ADD CONSTRAINT alunos_status_check
  CHECK (status IN ('Matriculado', 'Transferido', 'Desistente', 'Concluído', 'Cancelado'));

-- Verificação final
SELECT status, COUNT(*) AS total FROM public.alunos GROUP BY status;
SELECT tipo_cadastro_origem, COUNT(*) AS total FROM public.alunos GROUP BY tipo_cadastro_origem ORDER BY total DESC;

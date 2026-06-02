-- ============================================================
-- Migração: Renomeia status 'Evadido' → 'Desistente'
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Remove constraint atual
ALTER TABLE public.alunos
  DROP CONSTRAINT IF EXISTS alunos_status_check;

-- 2. Atualiza registros que tinham 'Evadido'
UPDATE public.alunos
  SET status = 'Desistente'
  WHERE status = 'Evadido';

-- 3. Recria constraint com novo valor
ALTER TABLE public.alunos
  ADD CONSTRAINT alunos_status_check
  CHECK (status IN ('Matriculado', 'Transferido', 'Desistente', 'Concluído', 'Cancelado'));

-- Verificação
SELECT status, COUNT(*) AS total FROM public.alunos GROUP BY status ORDER BY total DESC;

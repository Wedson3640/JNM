-- ============================================================
-- Migração: Módulo Financeiro JNM
-- Execute no Supabase SQL Editor
-- ============================================================

-- ── Receitas (entradas) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.financeiro_receitas (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  data        date        NOT NULL,
  origem      text        NOT NULL,          -- quem pagou / fonte
  obs         text,                          -- observação / descrição
  valor       numeric(12,2) NOT NULL,
  conta       text,                          -- ex: "07 - BENVINDA"
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Pagamentos (saídas) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.financeiro_pagamentos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  data        date        NOT NULL,
  beneficiario text       NOT NULL,          -- para quem foi pago
  obs         text,                          -- observação / NF
  valor       numeric(12,2) NOT NULL,
  conta       text,                          -- ex: "07 - BENVINDA"
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Índices para filtros por data ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fin_receitas_data   ON public.financeiro_receitas  (data DESC);
CREATE INDEX IF NOT EXISTS idx_fin_pagamentos_data ON public.financeiro_pagamentos (data DESC);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.financeiro_receitas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated manage receitas"
  ON public.financeiro_receitas FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated manage pagamentos"
  ON public.financeiro_pagamentos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── Verificação ───────────────────────────────────────────────
SELECT 'financeiro_receitas'   AS tabela, COUNT(*) FROM public.financeiro_receitas
UNION ALL
SELECT 'financeiro_pagamentos' AS tabela, COUNT(*) FROM public.financeiro_pagamentos;

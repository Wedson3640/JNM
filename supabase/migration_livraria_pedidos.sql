-- ============================================================
-- Migracao: Pedidos da livraria e conferencia de comprovante Pix
-- Execute no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.livro_pedidos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_cliente        text NOT NULL,
  whatsapp            text NOT NULL,
  endereco            text,
  observacao          text,
  itens               jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal            numeric(10,2) NOT NULL DEFAULT 0,
  total               numeric(10,2) NOT NULL DEFAULT 0,
  pix_key             text NOT NULL,
  pix_receiver        text NOT NULL,
  status              text NOT NULL DEFAULT 'aguardando_comprovante'
    CHECK (status IN ('aguardando_comprovante', 'em_conferencia', 'confirmado', 'cancelado')),
  comprovante_status  text NOT NULL DEFAULT 'aguardando_conferencia'
    CHECK (comprovante_status IN ('aguardando_envio', 'aguardando_conferencia', 'conferido', 'recusado')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.livro_pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publico registra pedidos da livraria" ON public.livro_pedidos;
CREATE POLICY "Publico registra pedidos da livraria"
ON public.livro_pedidos
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Autenticados leem pedidos da livraria" ON public.livro_pedidos;
CREATE POLICY "Autenticados leem pedidos da livraria"
ON public.livro_pedidos
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Autenticados atualizam pedidos da livraria" ON public.livro_pedidos;
CREATE POLICY "Autenticados atualizam pedidos da livraria"
ON public.livro_pedidos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS livro_pedidos_set_updated_at ON public.livro_pedidos;
CREATE TRIGGER livro_pedidos_set_updated_at
BEFORE UPDATE ON public.livro_pedidos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

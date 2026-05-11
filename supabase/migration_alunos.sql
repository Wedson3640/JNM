-- ============================================================
-- Migração: Tabela de alunos da Creche Miranez
-- Execute no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.alunos (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  matricula_nr                text        NOT NULL,
  nome_aluno                  text        NOT NULL,
  data_nascimento             text,
  sexo                        text,
  grupo_etnico                text,
  numero_nis                  text,
  foto_url                    text,

  -- Registro civil
  assento_nr                  text,
  cartorio_registro           text,
  data_registro_nascimento    text,
  cidade_registro_nascimento  text,
  estado_registro             text,
  folha_registro_nr           text,
  nr_livro_registro_nasc      text,

  -- Endereço
  endereco_aluno              text,
  bairro_aluno                text,
  cidade_aluno                text,
  estado_residencia           text,

  -- Filiação
  nome_mae                    text,
  cpf_mae                     text,
  rg_mae                      text,
  profissao_mae               text,
  nome_pai                    text,
  cpf_pai                     text,
  rg_pai                      text,
  profissao_pai               text,

  -- Responsável
  nome_responsavel            text,
  fone_contato                text,

  -- Saúde
  possui_alergia              boolean     DEFAULT false,
  qual_alergia                text,
  necessidade_especial        boolean     DEFAULT false,
  necessidade_especial_text   text,

  -- Escolar
  serie                       text        NOT NULL,   -- 'Maternal 1', 'Maternal 2', etc.
  ano_letivo                  text        NOT NULL,
  status                      text        NOT NULL DEFAULT 'Ativo',  -- 'Ativo', 'Inativo', 'Transferido'
  qual_horario                text,
  qual_projeto                text,
  tipo_cadastro               text,
  transferido                 boolean     DEFAULT false,

  created_at                  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage alunos"
  ON public.alunos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

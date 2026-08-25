-- Serviço de Convivência e Fortalecimento de Vínculos (SCFV) — ficha de inscrição interna
-- (SEMCASPI/CRAS). Sem leitura pública — apenas usuários autenticados da área interna.

create table if not exists public.convivencia_inscricoes (
  id uuid primary key default gen_random_uuid(),

  -- Serviço
  cras_referencia text,
  local_funcionamento text,
  endereco_funcionamento text,

  -- Dados sociofamiliares do usuário
  nome text not null check (char_length(nome) >= 3),
  sexo_genero text,
  nis text,
  data_nascimento text,
  cpf text,
  nome_social text,
  nome_mae text,
  nis_mae text,
  data_nascimento_mae text,
  cpf_mae text,
  nome_responsavel text,
  endereco text,
  cidade text,
  uf text,
  cep text,
  ponto_referencia text,
  ddd_telefone text,
  celular text,
  estuda boolean,
  nome_escola text,
  ano_serie text,
  turno text,
  ultima_serie_cursada text,

  -- Contexto da procura
  motivo_procura text,
  como_soube text,

  -- Diagnóstico sociofamiliar
  renda_familiar text,
  procedimentos_encaminhamentos text,
  disponibilidade_horarios text,
  situacao_usuario integer[] not null default '{}',

  -- Saúde
  hipertenso boolean,
  diabetes boolean,
  outros_problemas_saude text,
  possui_deficiencia boolean,
  qual_deficiencia text,

  observacoes text,
  data_inscricao text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo', 'desligado')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.convivencia_familiares (
  id uuid primary key default gen_random_uuid(),
  inscricao_id uuid not null references public.convivencia_inscricoes(id) on delete cascade,
  ordem integer not null default 0,
  nome text not null,
  data_nascimento text,
  vinculo_sociofamiliar text,
  responsavel_legal boolean not null default false,
  cpf text
);

alter table public.convivencia_inscricoes enable row level security;
alter table public.convivencia_familiares enable row level security;

drop policy if exists "Autenticados gerenciam inscricoes SCFV" on public.convivencia_inscricoes;
create policy "Autenticados gerenciam inscricoes SCFV"
on public.convivencia_inscricoes for all
to authenticated
using (true)
with check (true);

drop policy if exists "Autenticados gerenciam familiares SCFV" on public.convivencia_familiares;
create policy "Autenticados gerenciam familiares SCFV"
on public.convivencia_familiares for all
to authenticated
using (true)
with check (true);

drop trigger if exists convivencia_inscricoes_set_updated_at on public.convivencia_inscricoes;
create trigger convivencia_inscricoes_set_updated_at before update on public.convivencia_inscricoes for each row execute function public.set_updated_at();

create index if not exists idx_convivencia_familiares_inscricao on public.convivencia_familiares (inscricao_id);

notify pgrst, 'reload schema';

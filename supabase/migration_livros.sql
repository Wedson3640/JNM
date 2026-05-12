-- Tabela de livros da livraria espiritual JNM
create table if not exists livros (
  id          uuid        primary key default gen_random_uuid(),
  titulo      text        not null,
  autor       text        not null default 'João Nunes Maia',
  preco       numeric(10,2) not null,
  descricao   text,
  capa_url    text,
  estoque     integer     not null default 0 check (estoque >= 0),
  status      text        not null default 'published'
                check (status in ('published', 'draft')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table livros
add column if not exists estoque integer not null default 0 check (estoque >= 0);

create table if not exists livro_interesses (
  id uuid primary key default gen_random_uuid(),
  livro_id uuid references livros(id) on delete cascade,
  livro_titulo text not null,
  nome text,
  whatsapp text,
  email text,
  observacao text,
  status text not null default 'novo' check (status in ('novo', 'contatado', 'convertido', 'cancelado')),
  created_at timestamptz not null default now()
);

alter table livro_interesses enable row level security;

-- RLS
alter table livros enable row level security;

create policy "Público lê livros publicados"
  on livros for select
  using (status = 'published');

create policy "Autenticados gerenciam livros"
  on livros for all
  using (auth.role() = 'authenticated');

create policy "Publico registra interesse em livros"
  on livro_interesses for insert
  with check (true);

create policy "Autenticados leem interesses"
  on livro_interesses for select
  using (auth.role() = 'authenticated');

-- Storage bucket para capas
insert into storage.buckets (id, name, public)
values ('livros-capas', 'livros-capas', true)
on conflict (id) do nothing;

create policy "Público lê capas"
  on storage.objects for select
  using (bucket_id = 'livros-capas');

create policy "Autenticados fazem upload de capas"
  on storage.objects for insert
  with check (bucket_id = 'livros-capas' and auth.role() = 'authenticated');

create policy "Autenticados deletam capas"
  on storage.objects for delete
  using (bucket_id = 'livros-capas' and auth.role() = 'authenticated');

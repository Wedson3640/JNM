-- Atualização da livraria: estoque, capas via Storage e lista de interesse.

alter table public.livros
add column if not exists estoque integer not null default 0 check (estoque >= 0);

comment on column public.livros.capa_url is 'URL pública da capa do livro, normalmente gerada pelo bucket livros-capas.';
comment on column public.livros.estoque is 'Quantidade disponível para compra. Quando zero, o frontend mostra lista de interesse.';
comment on column public.livros.descricao is 'Descrição pública do livro exibida no catálogo.';

create table if not exists public.livro_interesses (
  id uuid primary key default gen_random_uuid(),
  livro_id uuid references public.livros(id) on delete cascade,
  livro_titulo text not null,
  nome text,
  whatsapp text,
  email text,
  observacao text,
  status text not null default 'novo' check (status in ('novo', 'contatado', 'convertido', 'cancelado')),
  created_at timestamptz not null default now()
);

alter table public.livro_interesses enable row level security;

drop policy if exists "Publico registra interesse em livros" on public.livro_interesses;
create policy "Publico registra interesse em livros"
on public.livro_interesses
for insert
with check (true);

drop policy if exists "Autenticados leem interesses" on public.livro_interesses;
create policy "Autenticados leem interesses"
on public.livro_interesses
for select
to authenticated
using (true);

drop policy if exists "Autenticados atualizam interesses" on public.livro_interesses;
create policy "Autenticados atualizam interesses"
on public.livro_interesses
for update
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('livros-capas', 'livros-capas', true)
on conflict (id) do update set public = true;

drop policy if exists "Publico le capas dos livros" on storage.objects;
create policy "Publico le capas dos livros"
on storage.objects
for select
using (bucket_id = 'livros-capas');

drop policy if exists "Autenticados enviam capas dos livros" on storage.objects;
create policy "Autenticados enviam capas dos livros"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'livros-capas');

drop policy if exists "Autenticados atualizam capas dos livros" on storage.objects;
create policy "Autenticados atualizam capas dos livros"
on storage.objects
for update
to authenticated
using (bucket_id = 'livros-capas')
with check (bucket_id = 'livros-capas');

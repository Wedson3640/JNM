-- Galeria da pagina Creche Miranez

create table if not exists public.creche_moments (
  id uuid primary key default gen_random_uuid(),
  category_key text not null check (
    category_key in (
      'formaturas',
      'colacao-grau',
      'dia-maes',
      'dia-pais',
      'dia-criancas',
      'outros'
    )
  ),
  title text not null,
  image_url text not null,
  alt_text text,
  order_index integer not null default 0,
  status text not null default 'published' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creche_moments enable row level security;

drop policy if exists "Publico le fotos publicadas da creche" on public.creche_moments;
create policy "Publico le fotos publicadas da creche"
on public.creche_moments for select
using (status = 'published' or auth.role() = 'authenticated');

drop policy if exists "Autenticados gerenciam fotos da creche" on public.creche_moments;
create policy "Autenticados gerenciam fotos da creche"
on public.creche_moments for all
to authenticated
using (true)
with check (true);

drop trigger if exists creche_moments_set_updated_at on public.creche_moments;
create trigger creche_moments_set_updated_at
before update on public.creche_moments
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('creche-miranez', 'creche-miranez', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read creche-miranez" on storage.objects;
create policy "Public read creche-miranez"
on storage.objects for select
using (bucket_id = 'creche-miranez');

drop policy if exists "Authenticated upload creche-miranez" on storage.objects;
create policy "Authenticated upload creche-miranez"
on storage.objects for insert
to authenticated
with check (bucket_id = 'creche-miranez');

drop policy if exists "Authenticated update creche-miranez" on storage.objects;
create policy "Authenticated update creche-miranez"
on storage.objects for update
to authenticated
using (bucket_id = 'creche-miranez')
with check (bucket_id = 'creche-miranez');

drop policy if exists "Authenticated delete creche-miranez" on storage.objects;
create policy "Authenticated delete creche-miranez"
on storage.objects for delete
to authenticated
using (bucket_id = 'creche-miranez');

notify pgrst, 'reload schema';

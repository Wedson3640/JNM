create extension if not exists "pgcrypto";

DO $$
BEGIN
  CREATE TYPE public.admin_profile AS ENUM (
    'admin',
    'creche',
    'palestras',
    'livraria',
    'servicos'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 4 and 120),
  subtitle text not null check (char_length(subtitle) between 4 and 120),
  description text not null check (char_length(description) between 10 and 600),
  status text not null default 'draft' check (status in ('published', 'draft')),
  image_url text,
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news enable row level security;

create policy "Anyone can read published news"
on public.news
for select
using (status = 'published' or auth.role() = 'authenticated');

create policy "Authenticated users can manage news"
on public.news
for all
to authenticated
using (true)
with check (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists news_set_updated_at on public.news;
create trigger news_set_updated_at
before update on public.news
for each row
execute function public.set_updated_at();

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 4 and 120),
  platform text not null check (platform in ('YouTube', 'Facebook', 'Instagram')),
  image_url text not null,
  video_url text,
  duration text not null,
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.media_items enable row level security;

create policy "Anyone can read published media"
on public.media_items
for select
using (status = 'published' or auth.role() = 'authenticated');

create policy "Authenticated users can manage media"
on public.media_items
for all
to authenticated
using (true)
with check (true);

drop trigger if exists media_items_set_updated_at on public.media_items;
create trigger media_items_set_updated_at
before update on public.media_items
for each row
execute function public.set_updated_at();

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  title text not null,
  meta text not null,
  image_url text not null,
  cta_url text,
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fraternal_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  days text not null,
  time text not null,
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_schedule (
  id uuid primary key default gen_random_uuid(),
  weekday text not null,
  time text not null,
  title text not null,
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_label text not null,
  description text not null,
  image_url text,
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  schedule text not null,
  room text,
  image_url text,
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  city text not null,
  name text not null,
  phone text not null,
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.house_areas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text,
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  action text not null,
  path text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile public.admin_profile not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;
alter table public.fraternal_services enable row level security;
alter table public.weekly_schedule enable row level security;
alter table public.events enable row level security;
alter table public.study_groups enable row level security;
alter table public.partners enable row level security;
alter table public.house_areas enable row level security;
alter table public.user_access_logs enable row level security;
alter table public.user_profiles enable row level security;

create or replace function public.current_admin_profile()
returns public.admin_profile
language sql
stable
security definer
set search_path = public
as $$
  select profile from public.user_profiles where user_id = auth.uid();
$$;

create policy "Anyone can read published hero slides"
on public.hero_slides for select
using (status = 'published' or auth.role() = 'authenticated');

create policy "Authenticated users can manage hero slides"
on public.hero_slides for all to authenticated
using (true) with check (true);

create policy "Anyone can read published fraternal services"
on public.fraternal_services for select
using (status = 'published' or auth.role() = 'authenticated');

create policy "Authenticated users can manage fraternal services"
on public.fraternal_services for all to authenticated
using (true) with check (true);

create policy "Anyone can read published weekly schedule"
on public.weekly_schedule for select
using (status = 'published' or auth.role() = 'authenticated');

create policy "Authenticated users can manage weekly schedule"
on public.weekly_schedule for all to authenticated
using (true) with check (true);

create policy "Anyone can read published events"
on public.events for select
using (status = 'published' or auth.role() = 'authenticated');

create policy "Authenticated users can manage events"
on public.events for all to authenticated
using (true) with check (true);

create policy "Anyone can read published study groups"
on public.study_groups for select
using (status = 'published' or auth.role() = 'authenticated');

create policy "Authenticated users can manage study groups"
on public.study_groups for all to authenticated
using (true) with check (true);

create policy "Anyone can read published partners"
on public.partners for select
using (status = 'published' or auth.role() = 'authenticated');

create policy "Authenticated users can manage partners"
on public.partners for all to authenticated
using (true) with check (true);

create policy "Anyone can read published house areas"
on public.house_areas for select
using (status = 'published' or auth.role() = 'authenticated');

create policy "Authenticated users can manage house areas"
on public.house_areas for all to authenticated
using (true) with check (true);

create policy "Authenticated users can insert access logs"
on public.user_access_logs for insert to authenticated
with check (auth.uid() = user_id);

create policy "Authenticated users can read access logs"
on public.user_access_logs for select to authenticated
using (true);

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_admin_profile() = 'admin'
);

drop policy if exists "Admins can manage user profiles" on public.user_profiles;
create policy "Admins can manage user profiles"
on public.user_profiles for all
to authenticated
using (public.current_admin_profile() = 'admin')
with check (public.current_admin_profile() = 'admin');

drop trigger if exists hero_slides_set_updated_at on public.hero_slides;
create trigger hero_slides_set_updated_at before update on public.hero_slides for each row execute function public.set_updated_at();

drop trigger if exists fraternal_services_set_updated_at on public.fraternal_services;
create trigger fraternal_services_set_updated_at before update on public.fraternal_services for each row execute function public.set_updated_at();

drop trigger if exists weekly_schedule_set_updated_at on public.weekly_schedule;
create trigger weekly_schedule_set_updated_at before update on public.weekly_schedule for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();

drop trigger if exists study_groups_set_updated_at on public.study_groups;
create trigger study_groups_set_updated_at before update on public.study_groups for each row execute function public.set_updated_at();

drop trigger if exists partners_set_updated_at on public.partners;
create trigger partners_set_updated_at before update on public.partners for each row execute function public.set_updated_at();

drop trigger if exists house_areas_set_updated_at on public.house_areas;
create trigger house_areas_set_updated_at before update on public.house_areas for each row execute function public.set_updated_at();

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at before update on public.user_profiles for each row execute function public.set_updated_at();

create table if not exists public.livros (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  autor text not null default 'João Nunes Maia',
  preco numeric(10,2) not null,
  descricao text,
  capa_url text,
  estoque integer not null default 0 check (estoque >= 0),
  status text not null default 'published' check (status in ('published', 'draft')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.livros enable row level security;

drop policy if exists "Publico le livros publicados" on public.livros;
create policy "Publico le livros publicados"
on public.livros for select
using (status = 'published');

drop policy if exists "Autenticados gerenciam livros" on public.livros;
create policy "Autenticados gerenciam livros"
on public.livros for all
to authenticated
using (true)
with check (true);

drop trigger if exists livros_set_updated_at on public.livros;
create trigger livros_set_updated_at before update on public.livros for each row execute function public.set_updated_at();

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

create table if not exists public.livro_pedidos (
  id uuid primary key default gen_random_uuid(),
  nome_cliente text not null,
  whatsapp text not null,
  endereco text,
  observacao text,
  itens jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  pix_key text not null,
  pix_receiver text not null,
  status text not null default 'aguardando_comprovante'
    check (status in ('aguardando_comprovante', 'em_conferencia', 'confirmado', 'cancelado')),
  comprovante_status text not null default 'aguardando_conferencia'
    check (comprovante_status in ('aguardando_envio', 'aguardando_conferencia', 'conferido', 'recusado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.livro_interesses enable row level security;
alter table public.livro_pedidos enable row level security;

drop policy if exists "Publico registra interesse em livros" on public.livro_interesses;
create policy "Publico registra interesse em livros"
on public.livro_interesses for insert
with check (true);

drop policy if exists "Autenticados leem interesses" on public.livro_interesses;
create policy "Autenticados leem interesses"
on public.livro_interesses for select
to authenticated
using (true);

drop policy if exists "Publico registra pedidos da livraria" on public.livro_pedidos;
create policy "Publico registra pedidos da livraria"
on public.livro_pedidos for insert
with check (true);

drop policy if exists "Autenticados leem pedidos da livraria" on public.livro_pedidos;
create policy "Autenticados leem pedidos da livraria"
on public.livro_pedidos for select
to authenticated
using (true);

drop policy if exists "Autenticados atualizam pedidos da livraria" on public.livro_pedidos;
create policy "Autenticados atualizam pedidos da livraria"
on public.livro_pedidos for update
to authenticated
using (true)
with check (true);

drop trigger if exists livro_pedidos_set_updated_at on public.livro_pedidos;
create trigger livro_pedidos_set_updated_at before update on public.livro_pedidos for each row execute function public.set_updated_at();

create table if not exists public.creche_moments (
  id uuid primary key default gen_random_uuid(),
  category_key text not null check (
    category_key in ('formaturas', 'colacao-grau', 'dia-maes', 'dia-pais', 'dia-criancas', 'outros')
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
create trigger creche_moments_set_updated_at before update on public.creche_moments for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('livros-capas', 'livros-capas', true)
on conflict (id) do update set public = true;

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

-- Atualiza o cache do PostgREST usado pela API REST do Supabase.
notify pgrst, 'reload schema';

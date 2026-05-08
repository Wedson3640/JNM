create extension if not exists "pgcrypto";

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

alter table public.hero_slides enable row level security;
alter table public.fraternal_services enable row level security;
alter table public.weekly_schedule enable row level security;
alter table public.events enable row level security;
alter table public.study_groups enable row level security;
alter table public.partners enable row level security;
alter table public.house_areas enable row level security;
alter table public.user_access_logs enable row level security;

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

-- Tabela de vídeos (miniaturas + links)
create table if not exists media_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  platform    text not null check (platform in ('YouTube', 'Facebook', 'Instagram')),
  image_url   text not null default '',
  video_url   text not null default '',
  duration    text not null default '',
  status      text not null default 'published' check (status in ('published', 'draft')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS
alter table media_items enable row level security;

-- Leitura pública para usuários anônimos (site público)
create policy "media_items: leitura pública"
  on media_items for select
  using (status = 'published');

-- Admin com autenticação pode tudo
create policy "media_items: admin autenticado"
  on media_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Bucket de miniaturas de vídeo
insert into storage.buckets (id, name, public)
values ('media-thumbs', 'media-thumbs', true)
on conflict (id) do nothing;

-- Leitura pública do bucket
create policy "media-thumbs: leitura pública"
  on storage.objects for select
  using (bucket_id = 'media-thumbs');

-- Upload apenas para autenticados
create policy "media-thumbs: upload autenticado"
  on storage.objects for insert
  with check (bucket_id = 'media-thumbs' and auth.role() = 'authenticated');

-- Update apenas para autenticados
create policy "media-thumbs: update autenticado"
  on storage.objects for update
  using (bucket_id = 'media-thumbs' and auth.role() = 'authenticated');

-- Delete apenas para autenticados
create policy "media-thumbs: delete autenticado"
  on storage.objects for delete
  using (bucket_id = 'media-thumbs' and auth.role() = 'authenticated');

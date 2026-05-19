-- Bucket de imagens de eventos
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- Remove políticas antigas se existirem
drop policy if exists "event-images: leitura pública"    on storage.objects;
drop policy if exists "event-images: upload autenticado" on storage.objects;
drop policy if exists "event-images: update autenticado" on storage.objects;
drop policy if exists "event-images: delete autenticado" on storage.objects;

-- Leitura pública
create policy "event-images: leitura pública"
  on storage.objects for select
  using (bucket_id = 'event-images');

-- Upload para autenticados
create policy "event-images: upload autenticado"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'event-images');

-- Update para autenticados
create policy "event-images: update autenticado"
  on storage.objects for update to authenticated
  using (bucket_id = 'event-images');

-- Delete para autenticados
create policy "event-images: delete autenticado"
  on storage.objects for delete to authenticated
  using (bucket_id = 'event-images');

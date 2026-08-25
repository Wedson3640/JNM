-- Adiciona campo de foto à ficha de inscrição SCFV e cria o bucket de storage.

alter table public.convivencia_inscricoes add column if not exists foto_url text;

insert into storage.buckets (id, name, public)
values ('convivencia', 'convivencia', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read convivencia" on storage.objects;
create policy "Public read convivencia"
on storage.objects for select
using (bucket_id = 'convivencia');

drop policy if exists "Authenticated upload convivencia" on storage.objects;
create policy "Authenticated upload convivencia"
on storage.objects for insert
to authenticated
with check (bucket_id = 'convivencia');

drop policy if exists "Authenticated update convivencia" on storage.objects;
create policy "Authenticated update convivencia"
on storage.objects for update
to authenticated
using (bucket_id = 'convivencia')
with check (bucket_id = 'convivencia');

drop policy if exists "Authenticated delete convivencia" on storage.objects;
create policy "Authenticated delete convivencia"
on storage.objects for delete
to authenticated
using (bucket_id = 'convivencia');

notify pgrst, 'reload schema';

-- Adiciona coluna type na tabela events
alter table public.events
  add column if not exists type text not null default 'list'
  check (type in ('featured', 'list'));

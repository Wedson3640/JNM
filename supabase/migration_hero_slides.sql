-- Execute este script no SQL Editor do Supabase para adicionar os novos campos ao carrossel
alter table public.hero_slides
  add column if not exists speaker_name text not null default '',
  add column if not exists theme        text not null default '',
  add column if not exists event_date   text not null default '',
  add column if not exists event_weekday text not null default '',
  add column if not exists event_time   text not null default '',
  add column if not exists platforms    text not null default 'YouTube';

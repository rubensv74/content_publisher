alter table public.publications
  add column if not exists visual_config jsonb not null default '{}'::jsonb;

alter table public.publications
  drop constraint if exists publications_visual_config_object_check;

alter table public.publications
  add constraint publications_visual_config_object_check
  check (jsonb_typeof(visual_config) = 'object');

comment on column public.publications.visual_config is
  'Archetype-specific non-editorial visual inputs, namespaced by archetype key.';

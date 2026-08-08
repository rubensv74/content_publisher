-- Content Publisher V1 — covering indexes for foreign keys
-- Added after validating the initial schema with Supabase performance advisors.

create index if not exists publication_assets_asset_user_idx
  on public.publication_assets(asset_id, user_id);

create index if not exists publication_assets_publication_user_idx
  on public.publication_assets(publication_id, user_id);

create index if not exists publication_assets_user_idx
  on public.publication_assets(user_id);

create index if not exists publications_source_idea_user_idx
  on public.publications(source_idea_id, user_id)
  where source_idea_id is not null;

create index if not exists publishing_jobs_publication_user_idx
  on public.publishing_jobs(publication_id, user_id);

create index if not exists publishing_jobs_render_user_idx
  on public.publishing_jobs(render_id, user_id)
  where render_id is not null;

create index if not exists publishing_jobs_user_idx
  on public.publishing_jobs(user_id);

create index if not exists renders_publication_user_idx
  on public.renders(publication_id, user_id);

create index if not exists renders_user_idx
  on public.renders(user_id);

-- Content Publisher V1 — initial persistence model
-- Implements ADR-007: relational core + JSONB for variable structures.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.identity_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  signature_label text,
  identity_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint identity_profiles_config_object
    check (jsonb_typeof(identity_config) = 'object')
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  topic text,
  source_type text not null default 'manual',
  source_ref text,
  priority smallint not null default 0,
  status text not null default 'idea',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint ideas_source_type_valid
    check (source_type in ('manual', 'github', 'knowledge-base', 'suggestion-engine', 'trend', 'other')),
  constraint ideas_priority_valid
    check (priority between 0 and 5),
  constraint ideas_status_valid
    check (status in ('idea', 'archived', 'converted')),
  constraint ideas_id_user_unique unique (id, user_id)
);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_idea_id uuid,
  title text not null,
  topic text,
  story_type text not null,
  format text not null,
  status text not null default 'draft',
  structured_content jsonb not null default '{}'::jsonb,
  content_schema_version integer not null default 1,
  linkedin_text text,
  archetype_key text,
  archetype_version integer,
  variant_key text,
  series_key text,
  series_number integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  scheduled_at timestamptz,
  published_at timestamptz,
  constraint publications_story_type_valid
    check (story_type in ('build', 'problem-solution', 'architecture', 'tutorial', 'lesson-learned', 'comparison', 'data-story', 'professional-insight')),
  constraint publications_format_valid
    check (format in ('single-image', 'carousel')),
  constraint publications_status_valid
    check (status in ('draft', 'ready', 'scheduled', 'published', 'archived')),
  constraint publications_structured_content_object
    check (jsonb_typeof(structured_content) = 'object'),
  constraint publications_schema_version_valid
    check (content_schema_version >= 1),
  constraint publications_archetype_version_valid
    check (archetype_version is null or archetype_version >= 1),
  constraint publications_series_number_valid
    check (series_number is null or series_number >= 1),
  constraint publications_id_user_unique unique (id, user_id),
  constraint publications_source_idea_same_user
    foreign key (source_idea_id, user_id)
    references public.ideas(id, user_id)
    on delete set null
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  asset_type text not null,
  mime_type text not null,
  original_filename text not null,
  width integer,
  height integer,
  file_size bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint assets_width_valid check (width is null or width > 0),
  constraint assets_height_valid check (height is null or height > 0),
  constraint assets_file_size_valid check (file_size is null or file_size >= 0),
  constraint assets_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint assets_storage_path_user_unique unique (user_id, storage_path),
  constraint assets_id_user_unique unique (id, user_id)
);

create table public.publication_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  publication_id uuid not null,
  asset_id uuid not null,
  role text not null,
  sort_order integer not null default 0,
  usage_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint publication_assets_usage_config_object
    check (jsonb_typeof(usage_config) = 'object'),
  constraint publication_assets_publication_same_user
    foreign key (publication_id, user_id)
    references public.publications(id, user_id)
    on delete cascade,
  constraint publication_assets_asset_same_user
    foreign key (asset_id, user_id)
    references public.assets(id, user_id)
    on delete cascade,
  constraint publication_assets_usage_unique
    unique (publication_id, asset_id, role, sort_order)
);

create table public.renders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  publication_id uuid not null,
  render_type text not null,
  storage_path text,
  status text not null default 'pending',
  width integer,
  height integer,
  page_count integer,
  render_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint renders_type_valid check (render_type in ('png', 'pdf')),
  constraint renders_status_valid check (status in ('pending', 'ready', 'failed')),
  constraint renders_width_valid check (width is null or width > 0),
  constraint renders_height_valid check (height is null or height > 0),
  constraint renders_page_count_valid check (page_count is null or page_count > 0),
  constraint renders_context_object check (jsonb_typeof(render_context) = 'object'),
  constraint renders_publication_same_user
    foreign key (publication_id, user_id)
    references public.publications(id, user_id)
    on delete cascade,
  constraint renders_id_user_unique unique (id, user_id)
);

create table public.publishing_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  publication_id uuid not null,
  render_id uuid,
  destination text not null default 'linkedin',
  provider text not null default 'buffer',
  action text not null,
  status text not null default 'pending',
  scheduled_for timestamptz,
  external_id text,
  external_url text,
  provider_payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint publishing_jobs_action_valid
    check (action in ('publish-now', 'schedule', 'draft')),
  constraint publishing_jobs_status_valid
    check (status in ('pending', 'sent', 'scheduled', 'published', 'failed', 'cancelled')),
  constraint publishing_jobs_payload_object
    check (jsonb_typeof(provider_payload) = 'object'),
  constraint publishing_jobs_publication_same_user
    foreign key (publication_id, user_id)
    references public.publications(id, user_id)
    on delete cascade,
  constraint publishing_jobs_render_same_user
    foreign key (render_id, user_id)
    references public.renders(id, user_id)
    on delete set null
);

create unique index publications_series_number_unique
  on public.publications(user_id, series_key, series_number)
  where series_key is not null and series_number is not null;

create index ideas_user_status_created_idx
  on public.ideas(user_id, status, created_at desc);

create index publications_user_status_updated_idx
  on public.publications(user_id, status, updated_at desc);

create index assets_user_created_idx
  on public.assets(user_id, created_at desc);

create index renders_publication_created_idx
  on public.renders(publication_id, created_at desc);

create index publishing_jobs_publication_created_idx
  on public.publishing_jobs(publication_id, created_at desc);

create trigger identity_profiles_set_updated_at
before update on public.identity_profiles
for each row execute function public.set_updated_at();

create trigger ideas_set_updated_at
before update on public.ideas
for each row execute function public.set_updated_at();

create trigger publications_set_updated_at
before update on public.publications
for each row execute function public.set_updated_at();

create trigger publishing_jobs_set_updated_at
before update on public.publishing_jobs
for each row execute function public.set_updated_at();

alter table public.identity_profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.publications enable row level security;
alter table public.assets enable row level security;
alter table public.publication_assets enable row level security;
alter table public.renders enable row level security;
alter table public.publishing_jobs enable row level security;

create policy "identity_profiles_select_own"
on public.identity_profiles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "identity_profiles_insert_own"
on public.identity_profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "identity_profiles_update_own"
on public.identity_profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "identity_profiles_delete_own"
on public.identity_profiles for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "ideas_select_own"
on public.ideas for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "ideas_insert_own"
on public.ideas for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "ideas_update_own"
on public.ideas for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "ideas_delete_own"
on public.ideas for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "publications_select_own"
on public.publications for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "publications_insert_own"
on public.publications for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "publications_update_own"
on public.publications for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "publications_delete_own"
on public.publications for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "assets_select_own"
on public.assets for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "assets_insert_own"
on public.assets for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "assets_update_own"
on public.assets for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "assets_delete_own"
on public.assets for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "publication_assets_select_own"
on public.publication_assets for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "publication_assets_insert_own"
on public.publication_assets for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "publication_assets_update_own"
on public.publication_assets for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "publication_assets_delete_own"
on public.publication_assets for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "renders_select_own"
on public.renders for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "renders_insert_own"
on public.renders for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "renders_update_own"
on public.renders for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "renders_delete_own"
on public.renders for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "publishing_jobs_select_own"
on public.publishing_jobs for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "publishing_jobs_insert_own"
on public.publishing_jobs for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "publishing_jobs_update_own"
on public.publishing_jobs for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "publishing_jobs_delete_own"
on public.publishing_jobs for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Private Storage bucket. Object names must start with the authenticated user's UUID.
insert into storage.buckets (id, name, public, file_size_limit)
values ('content-publisher', 'content-publisher', false, 26214400)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

create policy "content_publisher_storage_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'content-publisher'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "content_publisher_storage_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'content-publisher'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "content_publisher_storage_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'content-publisher'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'content-publisher'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "content_publisher_storage_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'content-publisher'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

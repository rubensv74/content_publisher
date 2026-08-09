create table if not exists public.source_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  source_locator text not null,
  source_ref text not null,
  fingerprint text not null,
  signal_type text not null,
  title text not null,
  summary text,
  occurred_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  analysis_status text not null default 'new',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_signals_source_type_valid
    check (source_type in ('github', 'knowledge-base', 'editorial-history', 'manual-idea')),
  constraint source_signals_analysis_status_valid
    check (analysis_status in ('new', 'reviewed', 'ignored', 'suggested')),
  constraint source_signals_metadata_object
    check (jsonb_typeof(metadata) = 'object'),
  constraint source_signals_user_fingerprint_unique
    unique (user_id, fingerprint)
);

create index if not exists source_signals_user_seen_idx
  on public.source_signals(user_id, last_seen_at desc);

create index if not exists source_signals_user_source_occurred_idx
  on public.source_signals(user_id, source_type, occurred_at desc);

create index if not exists source_signals_user_analysis_idx
  on public.source_signals(user_id, analysis_status, occurred_at desc);

drop trigger if exists source_signals_set_updated_at on public.source_signals;
create trigger source_signals_set_updated_at
before update on public.source_signals
for each row execute function public.set_updated_at();

alter table public.source_signals enable row level security;

drop policy if exists "source_signals_select_own" on public.source_signals;
create policy "source_signals_select_own"
on public.source_signals for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "source_signals_insert_own" on public.source_signals;
create policy "source_signals_insert_own"
on public.source_signals for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "source_signals_update_own" on public.source_signals;
create policy "source_signals_update_own"
on public.source_signals for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "source_signals_delete_own" on public.source_signals;
create policy "source_signals_delete_own"
on public.source_signals for delete
to authenticated
using ((select auth.uid()) = user_id);

comment on table public.source_signals is
  'Lightweight memory of relevant source events observed by Suggestion Engine adapters. Original sources remain authoritative.';

comment on column public.source_signals.fingerprint is
  'Stable per-user identifier used to upsert an observed signal without replicating the source content.';

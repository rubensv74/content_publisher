alter table public.source_signals
  add constraint source_signals_id_user_unique unique (id, user_id);

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  opportunity text not null,
  rationale text not null,
  story_type text not null,
  format text not null,
  design_family text not null,
  archetype_key text not null,
  priority text not null,
  confidence numeric(4,3) not null,
  status text not null default 'new',
  provider text not null,
  model text not null,
  generation_fingerprint text not null,
  accepted_at timestamptz,
  dismissed_at timestamptz,
  converted_at timestamptz,
  converted_idea_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suggestions_story_type_valid
    check (story_type in ('build', 'problem-solution', 'architecture', 'tutorial', 'lesson-learned', 'comparison', 'data-story', 'professional-insight')),
  constraint suggestions_format_valid
    check (format in ('single-image', 'carousel')),
  constraint suggestions_design_family_valid
    check (design_family in ('editorial', 'product', 'technical', 'data', 'carousel')),
  constraint suggestions_priority_valid
    check (priority in ('low', 'medium', 'high')),
  constraint suggestions_confidence_valid
    check (confidence >= 0 and confidence <= 1),
  constraint suggestions_status_valid
    check (status in ('new', 'accepted', 'dismissed', 'converted')),
  constraint suggestions_user_fingerprint_unique
    unique (user_id, generation_fingerprint),
  constraint suggestions_id_user_unique
    unique (id, user_id),
  constraint suggestions_converted_idea_user_fkey
    foreign key (converted_idea_id, user_id)
    references public.ideas(id, user_id)
    on delete set null
);

create table if not exists public.suggestion_source_signals (
  suggestion_id uuid not null,
  source_signal_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (suggestion_id, source_signal_id),
  constraint suggestion_source_signals_suggestion_user_fkey
    foreign key (suggestion_id, user_id)
    references public.suggestions(id, user_id)
    on delete cascade,
  constraint suggestion_source_signals_signal_user_fkey
    foreign key (source_signal_id, user_id)
    references public.source_signals(id, user_id)
    on delete cascade
);

create index if not exists suggestions_user_status_created_idx
  on public.suggestions(user_id, status, created_at desc);

create index if not exists suggestions_user_created_idx
  on public.suggestions(user_id, created_at desc);

create index if not exists suggestions_converted_idea_idx
  on public.suggestions(converted_idea_id)
  where converted_idea_id is not null;

create index if not exists suggestion_source_signals_user_signal_idx
  on public.suggestion_source_signals(user_id, source_signal_id);

drop trigger if exists suggestions_set_updated_at on public.suggestions;
create trigger suggestions_set_updated_at
before update on public.suggestions
for each row execute function public.set_updated_at();

alter table public.suggestions enable row level security;
alter table public.suggestion_source_signals enable row level security;

drop policy if exists "suggestions_select_own" on public.suggestions;
create policy "suggestions_select_own"
on public.suggestions for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "suggestions_insert_own" on public.suggestions;
create policy "suggestions_insert_own"
on public.suggestions for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "suggestions_update_own" on public.suggestions;
create policy "suggestions_update_own"
on public.suggestions for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "suggestions_delete_own" on public.suggestions;
create policy "suggestions_delete_own"
on public.suggestions for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "suggestion_source_signals_select_own" on public.suggestion_source_signals;
create policy "suggestion_source_signals_select_own"
on public.suggestion_source_signals for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "suggestion_source_signals_insert_own" on public.suggestion_source_signals;
create policy "suggestion_source_signals_insert_own"
on public.suggestion_source_signals for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "suggestion_source_signals_delete_own" on public.suggestion_source_signals;
create policy "suggestion_source_signals_delete_own"
on public.suggestion_source_signals for delete
to authenticated
using ((select auth.uid()) = user_id);

comment on table public.suggestions is
  'Persisted editorial proposals generated by Suggestion Engine and reviewed by the user before becoming Ideas.';

comment on table public.suggestion_source_signals is
  'Many-to-many traceability between persisted Suggestions and the source signals that justify them.';

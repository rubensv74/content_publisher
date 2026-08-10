create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text,
  relevance_reason text,
  status text not null default 'new',
  professional_relevance smallint not null default 3,
  actionability smallint not null default 3,
  learning_potential smallint not null default 3,
  project_potential smallint not null default 3,
  case_study_potential smallint not null default 3,
  editorial_potential smallint not null default 3,
  novelty smallint not null default 3,
  effort smallint not null default 3,
  priority_score integer generated always as (
    professional_relevance * 3
    + actionability * 2
    + learning_potential * 2
    + project_potential * 2
    + case_study_potential * 2
    + editorial_potential
    + novelty
    - effort
  ) stored,
  priority text generated always as (
    case
      when (
        professional_relevance * 3
        + actionability * 2
        + learning_potential * 2
        + project_potential * 2
        + case_study_potential * 2
        + editorial_potential
        + novelty
        - effort
      ) >= 45 then 'high'
      when (
        professional_relevance * 3
        + actionability * 2
        + learning_potential * 2
        + project_potential * 2
        + case_study_potential * 2
        + editorial_potential
        + novelty
        - effort
      ) >= 30 then 'medium'
      else 'low'
    end
  ) stored,
  research_notes text,
  dismissal_reason text,
  status_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_status_valid
    check (status in ('new', 'shortlisted', 'researching', 'project_candidate', 'active', 'case_study', 'dismissed', 'archived')),
  constraint opportunities_professional_relevance_valid check (professional_relevance between 1 and 5),
  constraint opportunities_actionability_valid check (actionability between 1 and 5),
  constraint opportunities_learning_potential_valid check (learning_potential between 1 and 5),
  constraint opportunities_project_potential_valid check (project_potential between 1 and 5),
  constraint opportunities_case_study_potential_valid check (case_study_potential between 1 and 5),
  constraint opportunities_editorial_potential_valid check (editorial_potential between 1 and 5),
  constraint opportunities_novelty_valid check (novelty between 1 and 5),
  constraint opportunities_effort_valid check (effort between 1 and 5),
  constraint opportunities_id_user_unique unique (id, user_id)
);

create table if not exists public.opportunity_source_signals (
  opportunity_id uuid not null,
  source_signal_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, source_signal_id),
  constraint opportunity_source_signals_opportunity_user_fkey
    foreign key (opportunity_id, user_id)
    references public.opportunities(id, user_id)
    on delete cascade,
  constraint opportunity_source_signals_signal_user_fkey
    foreign key (source_signal_id, user_id)
    references public.source_signals(id, user_id)
    on delete cascade
);

create index if not exists opportunities_user_status_updated_idx
  on public.opportunities(user_id, status, updated_at desc);

create index if not exists opportunities_user_priority_score_idx
  on public.opportunities(user_id, priority_score desc, updated_at desc);

create index if not exists opportunity_source_signals_user_signal_idx
  on public.opportunity_source_signals(user_id, source_signal_id);

create index if not exists opportunity_source_signals_user_opportunity_idx
  on public.opportunity_source_signals(user_id, opportunity_id);

drop trigger if exists opportunities_set_updated_at on public.opportunities;
create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

alter table public.opportunities enable row level security;
alter table public.opportunity_source_signals enable row level security;

grant select, insert, update, delete on public.opportunities to authenticated;
grant select, insert, update, delete on public.opportunity_source_signals to authenticated;

drop policy if exists "opportunities_select_own" on public.opportunities;
create policy "opportunities_select_own"
on public.opportunities for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "opportunities_insert_own" on public.opportunities;
create policy "opportunities_insert_own"
on public.opportunities for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "opportunities_update_own" on public.opportunities;
create policy "opportunities_update_own"
on public.opportunities for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "opportunities_delete_own" on public.opportunities;
create policy "opportunities_delete_own"
on public.opportunities for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "opportunity_source_signals_select_own" on public.opportunity_source_signals;
create policy "opportunity_source_signals_select_own"
on public.opportunity_source_signals for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "opportunity_source_signals_insert_own" on public.opportunity_source_signals;
create policy "opportunity_source_signals_insert_own"
on public.opportunity_source_signals for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "opportunity_source_signals_delete_own" on public.opportunity_source_signals;
create policy "opportunity_source_signals_delete_own"
on public.opportunity_source_signals for delete
to authenticated
using ((select auth.uid()) = user_id);

comment on table public.opportunities is
  'Persistent professional opportunities derived from one or more source signals and managed through Opportunity Radar.';

comment on column public.opportunities.priority_score is
  'Deterministic explainable score derived from persisted 1-5 evaluation dimensions; higher means more attractive.';

comment on table public.opportunity_source_signals is
  'Many-to-many traceability between opportunities and the source signals that justify them.';
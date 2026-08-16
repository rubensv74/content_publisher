alter table public.opportunities
  add column if not exists research_workspace jsonb not null default '{}'::jsonb;

alter table public.opportunities
  drop constraint if exists opportunities_research_workspace_object;

alter table public.opportunities
  add constraint opportunities_research_workspace_object
  check (jsonb_typeof(research_workspace) = 'object');

comment on column public.opportunities.research_workspace is
  'Versioned structured research workspace for an opportunity. Stores objective, questions, validation plan, evidence, findings, conclusion and next step; research_notes remains free-form compatibility.';

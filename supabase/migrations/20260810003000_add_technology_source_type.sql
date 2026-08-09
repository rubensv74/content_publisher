alter table public.source_signals
  drop constraint if exists source_signals_source_type_valid;

alter table public.source_signals
  add constraint source_signals_source_type_valid
  check (source_type in ('github', 'knowledge-base', 'editorial-history', 'manual-idea', 'technology'));

comment on constraint source_signals_source_type_valid on public.source_signals is
  'Allowed lightweight signal origins, including curated zero-cost technology sources used by Opportunity Radar.';

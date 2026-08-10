create index if not exists opportunity_source_signals_opportunity_user_idx
  on public.opportunity_source_signals(opportunity_id, user_id);

create index if not exists opportunity_source_signals_signal_user_idx
  on public.opportunity_source_signals(source_signal_id, user_id);

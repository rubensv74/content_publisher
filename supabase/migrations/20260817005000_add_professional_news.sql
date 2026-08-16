create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  summary text not null,
  relevance_reason text not null,
  relevance_score smallint not null default 3,
  source_url text,
  published_at timestamptz,
  status text not null default 'unread',
  generation_fingerprint text not null,
  converted_opportunity_id uuid,
  curated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_items_category_valid
    check (category in ('power-apps', 'power-bi', 'ai-applied')),
  constraint news_items_status_valid
    check (status in ('unread', 'read', 'saved', 'dismissed', 'converted')),
  constraint news_items_relevance_score_valid
    check (relevance_score between 1 and 5),
  constraint news_items_id_user_unique unique (id, user_id),
  constraint news_items_user_fingerprint_unique unique (user_id, generation_fingerprint),
  constraint news_items_converted_opportunity_user_fkey
    foreign key (converted_opportunity_id, user_id)
    references public.opportunities(id, user_id)
    on delete set null
);

create table if not exists public.news_item_source_signals (
  news_item_id uuid not null,
  source_signal_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (news_item_id, source_signal_id),
  constraint news_item_source_signals_news_user_fkey
    foreign key (news_item_id, user_id)
    references public.news_items(id, user_id)
    on delete cascade,
  constraint news_item_source_signals_signal_user_fkey
    foreign key (source_signal_id, user_id)
    references public.source_signals(id, user_id)
    on delete cascade
);

create index if not exists news_items_user_status_published_idx
  on public.news_items(user_id, status, published_at desc nulls last);

create index if not exists news_items_user_category_published_idx
  on public.news_items(user_id, category, published_at desc nulls last);

create index if not exists news_item_source_signals_user_signal_idx
  on public.news_item_source_signals(user_id, source_signal_id);

create index if not exists news_item_source_signals_user_news_idx
  on public.news_item_source_signals(user_id, news_item_id);

drop trigger if exists news_items_set_updated_at on public.news_items;
create trigger news_items_set_updated_at
before update on public.news_items
for each row execute function public.set_updated_at();

alter table public.news_items enable row level security;
alter table public.news_item_source_signals enable row level security;

grant select, insert, update, delete on public.news_items to authenticated;
grant select, insert, delete on public.news_item_source_signals to authenticated;

drop policy if exists "news_items_select_own" on public.news_items;
create policy "news_items_select_own"
on public.news_items for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "news_items_insert_own" on public.news_items;
create policy "news_items_insert_own"
on public.news_items for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "news_items_update_own" on public.news_items;
create policy "news_items_update_own"
on public.news_items for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "news_items_delete_own" on public.news_items;
create policy "news_items_delete_own"
on public.news_items for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "news_item_source_signals_select_own" on public.news_item_source_signals;
create policy "news_item_source_signals_select_own"
on public.news_item_source_signals for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "news_item_source_signals_insert_own" on public.news_item_source_signals;
create policy "news_item_source_signals_insert_own"
on public.news_item_source_signals for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "news_item_source_signals_delete_own" on public.news_item_source_signals;
create policy "news_item_source_signals_delete_own"
on public.news_item_source_signals for delete
to authenticated
using ((select auth.uid()) = user_id);

comment on table public.news_items is
  'Curated professional news in Spanish, separated from opportunities and traced to source signals.';

comment on table public.news_item_source_signals is
  'Many-to-many traceability from curated news items to original source signals.';

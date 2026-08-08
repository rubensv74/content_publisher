-- Content Publisher — public final renders storage
-- Implements ADR-009: private source assets + public immutable publishable renders.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'content-publisher-published',
  'content-publisher-published',
  true,
  104857600,
  array['image/png', 'application/pdf']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "content_publisher_published_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'content-publisher-published'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "content_publisher_published_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'content-publisher-published'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'content-publisher-published'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "content_publisher_published_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'content-publisher-published'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

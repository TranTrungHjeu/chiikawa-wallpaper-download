create index if not exists assets_published_featured_created_idx
  on public.assets (featured desc, created_at desc)
  where status = 'published';

create index if not exists assets_published_kind_featured_created_idx
  on public.assets (kind, featured desc, created_at desc)
  where status = 'published';

create index if not exists assets_created_at_desc_idx
  on public.assets (created_at desc);

create index if not exists assets_kind_created_at_desc_idx
  on public.assets (kind, created_at desc);

create index if not exists submissions_pending_created_at_desc_idx
  on public.submissions (created_at desc)
  where status = 'pending';

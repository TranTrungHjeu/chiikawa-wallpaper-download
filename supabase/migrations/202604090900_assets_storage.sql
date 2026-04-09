alter table public.assets
  add column if not exists storage_bucket text,
  add column if not exists storage_path text;

create unique index if not exists assets_storage_bucket_path_unique
  on public.assets (storage_bucket, storage_path)
  where storage_bucket is not null
    and storage_path is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-assets',
  'public-assets',
  true,
  52428800,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  source_id text,
  title text not null,
  slug text not null unique,
  description text,
  kind text not null check (kind in ('mobile', 'desktop', 'gif')),
  width integer,
  height integer,
  format text,
  bytes bigint,
  cloudinary_public_id text,
  cloudinary_resource_type text check (cloudinary_resource_type in ('image', 'video', 'raw')),
  secure_url text,
  original_url text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists assets_kind_source_id_unique
  on public.assets (kind, source_id)
  where source_id is not null;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitter_name text,
  submitter_email text,
  title text not null,
  notes text,
  kind text not null check (kind in ('mobile', 'desktop', 'gif')),
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  approved_asset_id uuid references public.assets(id) on delete set null,
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text not null unique,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

drop trigger if exists assets_set_updated_at on public.assets;
create trigger assets_set_updated_at
before update on public.assets
for each row
execute function public.set_updated_at();

drop trigger if exists submissions_set_updated_at on public.submissions;
create trigger submissions_set_updated_at
before update on public.submissions
for each row
execute function public.set_updated_at();

alter table public.assets enable row level security;
alter table public.submissions enable row level security;
alter table public.admin_users enable row level security;

create policy "Public can read published assets"
on public.assets
for select
using (status = 'published');

create policy "Authenticated users can read own admin row"
on public.admin_users
for select
using (auth.uid() = user_id);

create policy "Admins can read submissions"
on public.submissions
for select
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can update submissions"
on public.submissions
for update
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submission-pending',
  'submission-pending',
  false,
  15728640,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

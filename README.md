# Chiikawa Kho Hình Nền

Một bản mirror theo phong cách cute-editorial cho `chiikawa-wallpaper.com`, build bằng `Next.js App Router`, lưu metadata ở `Supabase`, file gốc public ở `Supabase Storage`, và có moderation flow cho contribution từ người dùng.

## Stack

- `Next.js 16` + `React 19`
- `Tailwind CSS 4`
- `Supabase Auth + Database + Storage`
- `Vitest`

## Tính năng chính

- Trang public:
  - `/`
  - `/mobile`
  - `/desktop`
  - `/gif`
  - `/asset/[slug]`
  - `/contribute`
- Trang admin:
  - `/admin/login`
  - `/admin/submissions`
  - `/admin/assets`
- API:
  - `POST /api/submissions/upload-url`
  - `POST /api/submissions/complete`
  - `POST /api/admin/submissions/[id]/approve`
  - `POST /api/admin/submissions/[id]/reject`
  - `GET /api/assets/[id]/download`

## Cài đặt

```bash
npm install
cp .env.example .env
```

Điền các biến trong `.env`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
```

## Supabase

Chạy migration trong `supabase/migrations/202604090201_init.sql` để tạo:

- `assets`
- `submissions`
- `admin_users`
- bucket private `submission-pending`

Chạy thêm migration `supabase/migrations/202604090900_assets_storage.sql` để tạo:

- bucket public `public-assets`
- cột `storage_bucket`
- cột `storage_path`

Sau đó seed admin:

```bash
npm run seed:admin
```

## Import dữ liệu từ site nguồn

Script importer crawl HTML SSR của site nguồn, tải file gốc vào `.cache/imports/chiikawa/`, upload lại lên bucket public của Supabase, rồi insert metadata vào `assets`.

```bash
npm run import:chiikawa
```

Giới hạn số item để thử nhanh:

```bash
npm run import:chiikawa -- --limit=5
```

## Chạy local

```bash
npm run dev
```

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Ghi chú triển khai

- Thumbnail/listing dùng URL public từ Supabase Storage, còn tối ưu ảnh khi render được xử lý bởi `next/image`.
- Download route luôn stream lại file gốc từ nguồn lưu trữ để giữ chất lượng cao.
- Nếu thiếu env Supabase, app vẫn build được nhưng contribution, admin và importer sẽ hiện trạng thái setup.
- Không commit secret thật vào repo. Nếu secret từng bị chia sẻ ở nơi khác, nên rotate sau khi triển khai.

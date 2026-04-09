import type { AssetRecord, GalleryStats, SubmissionRecord } from "@/lib/types";
import { createAssetSlug } from "@/lib/utils";

const now = new Date().toISOString();

function asset(
  partial: Partial<AssetRecord> & Pick<AssetRecord, "id" | "title" | "kind">
): AssetRecord {
  return {
    source_id: partial.source_id ?? null,
    slug: partial.slug ?? createAssetSlug(partial.title, partial.source_id ?? partial.id),
    description:
      partial.description ??
      "Bản xem trước dễ thương, màu sắc dịu và tệp gốc giữ nguyên chất lượng.",
    width: partial.width ?? null,
    height: partial.height ?? null,
    format: partial.format ?? "jpg",
    bytes: partial.bytes ?? null,
    cloudinary_public_id: partial.cloudinary_public_id ?? null,
    cloudinary_resource_type: partial.cloudinary_resource_type ?? null,
    storage_bucket: partial.storage_bucket ?? null,
    storage_path: partial.storage_path ?? null,
    secure_url: partial.secure_url ?? null,
    original_url: partial.original_url ?? null,
    status: partial.status ?? "published",
    featured: partial.featured ?? false,
    created_at: partial.created_at ?? now,
    updated_at: partial.updated_at ?? now,
    ...partial,
  };
}

export const mockAssets: AssetRecord[] = [
  asset({
    id: "mock-1",
    source_id: "706",
    title: "Chiikawa và bạn bè ở trạm xe buýt mùa thu",
    kind: "mobile",
    width: 1440,
    height: 2560,
    format: "jpg",
    bytes: 3245921,
    original_url:
      "https://r2.chiikawa-wallpaper.com/wallpaper/wallpaper/4k/4316782cab21541c802e29901cffb070.jpg",
    featured: true,
  }),
  asset({
    id: "mock-2",
    source_id: "705",
    title: "Chiikawa, Hachiware và Usagi chơi dưới gốc cây lớn",
    kind: "mobile",
    width: 1440,
    height: 2560,
    format: "jpg",
    bytes: 3021881,
    original_url:
      "https://r2.chiikawa-wallpaper.com/wallpaper/wallpaper/4k/ac1e7f68b135e170dc511a21aa3a2b25.jpg",
    featured: true,
  }),
  asset({
    id: "mock-3",
    source_id: "723",
    title: "Picnic trên nhà cây rừng đom đóm",
    kind: "desktop",
    width: 3840,
    height: 2160,
    format: "jpg",
    bytes: 5521881,
    original_url:
      "https://r2.chiikawa-wallpaper.com/wallpaper/wallpaper/4k/e587c34a5f1aa97723770963e2231b47.jpg",
    featured: true,
  }),
  asset({
    id: "mock-4",
    source_id: "724",
    title: "Chuyến đi biển bằng camper van",
    kind: "desktop",
    width: 3840,
    height: 2160,
    format: "jpg",
    bytes: 4981120,
    original_url:
      "https://r2.chiikawa-wallpaper.com/wallpaper/wallpaper/4k/f396088b31312db758fac91af50f07cb.jpg",
  }),
  asset({
    id: "mock-5",
    source_id: "675",
    title: "GIF Chiikawa chớp mắt và vẫy tay",
    kind: "gif",
    width: 500,
    height: 500,
    format: "gif",
    bytes: 862144,
    original_url:
      "https://r2.chiikawa-wallpaper.com/wallpaper/gif/7da9fb9c1c7559e1538bfa600f39ca45.gif",
    featured: true,
  }),
  asset({
    id: "mock-6",
    source_id: "674",
    title: "GIF Hachiware quay tròn vui vẻ",
    kind: "gif",
    width: 500,
    height: 500,
    format: "gif",
    bytes: 731155,
    original_url:
      "https://r2.chiikawa-wallpaper.com/wallpaper/gif/0a90ba5bbdca9cf5b9fbfdcbfd13afa7.gif",
  }),
  asset({
    id: "mock-7",
    source_id: "700",
    title: "Tắm onsen mùa đông với hoa anh đào",
    kind: "mobile",
    width: 1440,
    height: 2560,
    format: "jpg",
    bytes: 3881182,
    original_url:
      "https://r2.chiikawa-wallpaper.com/wallpaper/wallpaper/4k/c86746fdd85d67af6a7147db352efe99.jpg",
  }),
  asset({
    id: "mock-8",
    source_id: "731",
    title: "Hồ bơi rooftop nhìn ra skyline",
    kind: "desktop",
    width: 3840,
    height: 2160,
    format: "jpg",
    bytes: 4188811,
    original_url:
      "https://r2.chiikawa-wallpaper.com/wallpaper/wallpaper/4k/404c593e87d13696aaabbb6a4caf01f9.jpg",
  }),
  asset({
    id: "mock-9",
    source_id: "671",
    title: "GIF Momonga nhào tới ôm bạn",
    kind: "gif",
    width: 500,
    height: 500,
    format: "gif",
    bytes: 512210,
    original_url:
      "https://r2.chiikawa-wallpaper.com/wallpaper/gif/dd2f8a020cc28250af101f1818a162e3.gif",
  }),
];

export const mockSubmissions: SubmissionRecord[] = [
  {
    id: "submission-1",
    status: "pending",
    submitter_name: "Mai",
    submitter_email: "mai@example.com",
    title: "Usagi dưới trời sao",
    notes: "Ảnh crop dọc, màu dịu, phù hợp mobile.",
    kind: "mobile",
    storage_path: "submission-pending/mock/mai-usagi-stars.png",
    mime_type: "image/png",
    size_bytes: 2200441,
    approved_asset_id: null,
    review_note: null,
    reviewed_at: null,
    created_at: now,
    updated_at: now,
  },
];

export const mockStats: GalleryStats = {
  totalAssets: 444,
  totalMobile: 194,
  totalDesktop: 53,
  totalGif: 197,
};

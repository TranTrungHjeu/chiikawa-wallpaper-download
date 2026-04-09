import type { AssetKind } from "@/lib/types";

export const SITE_NAME = "Hachibam";
export const SITE_DESCRIPTION =
  "Hachibam la kho hinh nen Chiikawa de thuong cho mobile, desktop va GIF, co duyet dong gop cong dong va tai xuong chat luong cao.";
export const PENDING_BUCKET = "submission-pending";
export const PUBLIC_ASSETS_BUCKET = "public-assets";
export const GALLERY_PAGE_SIZE = 20;
export const ADMIN_PAGE_SIZE = 18;
export const HERO_STAT_TOTAL = 444;
export const CACHE_REVALIDATE_SECONDS = 60 * 60;
export const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const ASSET_KIND_LABELS: Record<AssetKind, string> = {
  mobile: "Mobile",
  desktop: "Desktop",
  gif: "GIF",
};

export const ASSET_KIND_DESCRIPTIONS: Record<AssetKind, string> = {
  mobile: "Hình dọc cho điện thoại, phối màu dịu và nét cao.",
  desktop: "Wallpaper ngang cho laptop, tablet và màn hình lớn.",
  gif: "GIF động đáng yêu để làm sticker, avatar hoặc reaction.",
};

export const KIND_ROUTE_MAP: Record<AssetKind, string> = {
  mobile: "/mobile",
  desktop: "/desktop",
  gif: "/gif",
};

export const SUPPORTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

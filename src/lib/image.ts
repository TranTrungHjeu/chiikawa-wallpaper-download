import type { AssetRecord } from "@/lib/types";

function buildSupabaseStoragePublicUrl(bucket: string, storagePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!baseUrl) return null;

  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
}

export function getAssetThumbnailUrl(
  asset: AssetRecord,
  _variant: "card" | "detail" = "card"
) {
  void _variant;

  if (asset.cloudinary_public_id && asset.cloudinary_resource_type) {
    return asset.secure_url ?? asset.original_url ?? "/vercel.svg";
  }

  if (asset.storage_bucket && asset.storage_path) {
    return (
      asset.secure_url ??
      buildSupabaseStoragePublicUrl(asset.storage_bucket, asset.storage_path) ??
      asset.original_url ??
      "/vercel.svg"
    );
  }

  return asset.secure_url ?? asset.original_url ?? "/vercel.svg";
}

export function getAssetOriginalImageUrl(asset: AssetRecord) {
  return (
    asset.secure_url ??
    asset.original_url ??
    getAssetThumbnailUrl(asset, "detail")
  );
}

export function getAssetPreviewPriority(index: number) {
  return index < 2;
}

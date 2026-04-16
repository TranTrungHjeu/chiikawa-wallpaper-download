import { getImageProps } from "next/image";

import { getAssetThumbnailUrl } from "@/lib/image";
import type { AssetRecord } from "@/lib/types";

const prefetchedImageUrls = new Set<string>();
const MAX_TRACKED_PREFETCHED_URLS = 600;

export type PrefetchAssetRecord = Pick<
  AssetRecord,
  | "kind"
  | "format"
  | "original_url"
  | "width"
  | "height"
  | "storage_bucket"
  | "storage_path"
  | "secure_url"
  | "cloudinary_public_id"
  | "cloudinary_resource_type"
>;

type BrowserConnection = {
  saveData?: boolean;
  effectiveType?: string;
};

export function isAnimatedAsset(asset: PrefetchAssetRecord) {
  return (
    asset.kind === "gif" ||
    asset.format?.toLowerCase() === "gif" ||
    asset.original_url?.toLowerCase().endsWith(".gif") === true
  );
}

function getFallbackHeight(asset: PrefetchAssetRecord, width: number) {
  if (asset.kind === "mobile") {
    return Math.round(width * (19 / 9));
  }

  if (asset.kind === "desktop") {
    return Math.round(width * (10 / 16));
  }

  return width;
}

export function getOptimizedPrefetchUrl(
  asset: PrefetchAssetRecord,
  width: number
) {
  if (isAnimatedAsset(asset)) {
    return getAssetThumbnailUrl(asset, "card");
  }

  const sourceWidth = asset.width ?? width;
  const sourceHeight = asset.height ?? getFallbackHeight(asset, width);
  const targetHeight = Math.max(
    1,
    Math.round((width / sourceWidth) * sourceHeight)
  );

  return getImageProps({
    alt: "",
    src: getAssetThumbnailUrl(asset, "card"),
    width,
    height: targetHeight,
  }).props.src;
}

export function canPrefetchImages() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const connection = (
    navigator as Navigator & { connection?: BrowserConnection }
  ).connection;

  if (
    connection?.saveData ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "3g"
  ) {
    return false;
  }

  return true;
}

export function prefetchAssetImages(
  assets: PrefetchAssetRecord[],
  width: number,
  limit = assets.length
) {
  if (typeof window === "undefined" || !canPrefetchImages()) {
    return;
  }

  for (const asset of assets.slice(0, limit)) {
    const optimizedUrl = getOptimizedPrefetchUrl(asset, width);

    if (prefetchedImageUrls.has(optimizedUrl)) {
      continue;
    }

    if (prefetchedImageUrls.size >= MAX_TRACKED_PREFETCHED_URLS) {
      prefetchedImageUrls.clear();
    }

    prefetchedImageUrls.add(optimizedUrl);

    const image = new window.Image();
    image.decoding = "async";
    image.src = optimizedUrl;
  }
}

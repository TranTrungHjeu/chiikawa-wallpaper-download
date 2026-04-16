import { unstable_cache } from "next/cache";

import type { AssetGridPreset } from "@/components/site/asset-grid";
import { GALLERY_PAGE_SIZE, KIND_ROUTE_MAP } from "@/lib/constants";
import {
  getAssetsPage,
  getFeaturedAssets,
  getGalleryPageCount,
} from "@/lib/data/assets";
import type { AssetKind } from "@/lib/types";
import { buildGalleryPageHref } from "@/lib/utils";
import type { AssetRecord } from "@/lib/types";
import type { PrefetchAssetRecord } from "@/lib/image-prefetch";

export const GALLERY_METADATA = {
  mobile: {
    title: "Mobile Wallpapers",
    description:
      "Bộ hình nền dọc Chiikawa cho điện thoại, ưu tiên ảnh rõ nét và tải nhanh.",
    gridPreset: "default" as const,
  },
  desktop: {
    title: "Desktop Wallpapers",
    description:
      "Bộ hình nền ngang Chiikawa cho desktop và laptop với preview tối ưu tốc độ.",
    gridPreset: "desktop-two-up" as const,
  },
  gif: {
    title: "Chiikawa GIF",
    description:
      "Bộ GIF Chiikawa dễ thương để lưu, chia sẻ và dùng trong reaction pack cá nhân.",
    gridPreset: "default" as const,
  },
} satisfies Record<
  AssetKind,
  {
    title: string;
    description: string;
    gridPreset: AssetGridPreset;
  }
>;

export async function getGalleryPageView(kind: AssetKind, page: number) {
  const basePath = KIND_ROUTE_MAP[kind];
  const pageResult = await getAssetsPage(kind, page, GALLERY_PAGE_SIZE);
  const nextPageTarget =
    pageResult.page < pageResult.pageCount
      ? await getAssetsPage(kind, pageResult.page + 1, GALLERY_PAGE_SIZE).then(
          (result) => ({
            href: buildGalleryPageHref(basePath, result.page),
            assets: result.items,
          })
        )
      : null;

  return {
    basePath,
    gridPreset: GALLERY_METADATA[kind].gridPreset,
    pageResult,
    prefetchTargets: nextPageTarget ? [nextPageTarget] : [],
  };
}

export async function getGalleryStaticParams(kind: AssetKind) {
  const pageCount = await getGalleryPageCount(kind, GALLERY_PAGE_SIZE);

  return Array.from(
    { length: Math.max(0, pageCount - 1) },
    (_, index) => ({ page: String(index + 2) })
  );
}

export type PrimaryRoutePrefetchManifest = Record<
  string,
  Array<{
    width: number;
    assets: PrefetchAssetRecord[];
  }>
>;

function toPrefetchAsset(asset: AssetRecord): PrefetchAssetRecord {
  return {
    kind: asset.kind,
    format: asset.format,
    original_url: asset.original_url,
    width: asset.width,
    height: asset.height,
    storage_bucket: asset.storage_bucket,
    storage_path: asset.storage_path,
    secure_url: asset.secure_url,
    cloudinary_public_id: asset.cloudinary_public_id,
    cloudinary_resource_type: asset.cloudinary_resource_type,
  };
}

async function queryPrimaryRoutePrefetchManifest(): Promise<PrimaryRoutePrefetchManifest> {
  const [featured, mobilePage, desktopPage, gifPage] = await Promise.all([
    getFeaturedAssets(2),
    getAssetsPage("mobile", 1, 5),
    getAssetsPage("desktop", 1, 3),
    getAssetsPage("gif", 1, 4),
  ]);

  return {
    "/": [
      { width: 960, assets: featured.map(toPrefetchAsset) },
      { width: 420, assets: mobilePage.items.slice(0, 3).map(toPrefetchAsset) },
    ],
    "/mobile": [
      { width: 480, assets: mobilePage.items.slice(0, 4).map(toPrefetchAsset) },
    ],
    "/desktop": [{ width: 960, assets: desktopPage.items.map(toPrefetchAsset) }],
    "/gif": [{ width: 480, assets: gifPage.items.map(toPrefetchAsset) }],
  };
}

export async function getPrimaryRoutePrefetchManifest(): Promise<PrimaryRoutePrefetchManifest> {
  return unstable_cache(queryPrimaryRoutePrefetchManifest, ["primary-route-prefetch"], {
    revalidate: 60 * 60,
    tags: ["assets", "assets:prefetch"],
  })();
}

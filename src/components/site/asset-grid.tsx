import { AssetCard } from "@/components/site/asset-card";
import type { AssetRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export type AssetGridPreset =
  | "default"
  | "desktop-two-up"
  | "home-featured-two-up"
  | "home-latest-five-up";

export function getAssetGridImageSizes(gridPreset: AssetGridPreset) {
  if (
    gridPreset === "desktop-two-up" ||
    gridPreset === "home-featured-two-up"
  ) {
    return "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 48vw";
  }

  if (gridPreset === "home-latest-five-up") {
    return "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw";
  }

  return "(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw";
}

export function getAssetGridPrefetchWidth(gridPreset: AssetGridPreset) {
  if (
    gridPreset === "desktop-two-up" ||
    gridPreset === "home-featured-two-up"
  ) {
    return 960;
  }

  if (gridPreset === "home-latest-five-up") {
    return 420;
  }

  return 480;
}

export function AssetGrid({
  assets,
  emptyTitle = "Chưa có tài nguyên hiển thị",
  emptyDescription = "Khi importer hoặc contribution được duyệt, các item mới sẽ xuất hiện ở đây.",
  gridPreset = "default",
}: {
  assets: AssetRecord[];
  emptyTitle?: string;
  emptyDescription?: string;
  gridPreset?: AssetGridPreset;
}) {
  if (!assets.length) {
    return (
      <div className="rounded-none border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
        <h3 className="headline-display text-3xl text-[var(--color-ink)]">
          {emptyTitle}
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-600">
          {emptyDescription}
        </p>
      </div>
    );
  }

  const imageSizes = getAssetGridImageSizes(gridPreset);

  return (
    <div
      className={cn(
        "grid gap-2.5 md:gap-3",
        gridPreset === "desktop-two-up" || gridPreset === "home-featured-two-up"
          ? "grid-cols-1 md:grid-cols-2"
          : gridPreset === "home-latest-five-up"
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      )}
    >
      {assets.map((asset, index) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          index={index}
          imageSizes={imageSizes}
        />
      ))}
    </div>
  );
}

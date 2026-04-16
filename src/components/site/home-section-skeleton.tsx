import { GalleryLoadingSkeleton } from "@/components/site/gallery-loading-skeleton";
import type { AssetGridPreset } from "@/components/site/asset-grid";

export function HomeSectionSkeleton({
  gridPreset,
  itemCount,
}: {
  gridPreset: AssetGridPreset;
  itemCount: number;
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2.5">
          <div className="h-7 w-24 animate-pulse bg-white/74" />
          <div className="h-10 w-40 animate-pulse bg-white/84 md:h-14 md:w-56" />
        </div>
        <div className="h-12 w-full animate-pulse bg-white/78 md:w-36" />
      </div>

      <GalleryLoadingSkeleton
        gridPreset={gridPreset}
        itemCount={itemCount}
        showPagination={false}
      />
    </div>
  );
}

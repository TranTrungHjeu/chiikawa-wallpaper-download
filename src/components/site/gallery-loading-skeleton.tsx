import { cn } from "@/lib/utils";
import type { AssetGridPreset } from "@/components/site/asset-grid";

function getGridClassName(gridPreset: AssetGridPreset) {
  return cn(
    "grid gap-2.5 md:gap-3",
    gridPreset === "desktop-two-up" || gridPreset === "home-featured-two-up"
      ? "grid-cols-1 md:grid-cols-2"
      : gridPreset === "home-latest-five-up"
        ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
  );
}

function getCardAspectClassName(gridPreset: AssetGridPreset) {
  if (gridPreset === "desktop-two-up" || gridPreset === "home-featured-two-up") {
    return "aspect-[16/10]";
  }

  if (gridPreset === "home-latest-five-up") {
    return "aspect-[9/19]";
  }

  return "aspect-[9/19] md:aspect-[4/5] lg:aspect-[9/19]";
}

export function GalleryLoadingSkeleton({
  gridPreset = "default",
  showPagination = true,
  itemCount = 10,
}: {
  gridPreset?: AssetGridPreset;
  showPagination?: boolean;
  itemCount?: number;
}) {
  const gridClassName = getGridClassName(gridPreset);
  const cardAspectClassName = getCardAspectClassName(gridPreset);

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      {showPagination ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-10 animate-pulse bg-white/72 md:h-11",
                index === 0 || index === 4 ? "w-20 md:w-24" : "w-10 md:w-11"
              )}
            />
          ))}
        </div>
      ) : null}

      <div className={gridClassName}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,249,241,0.66))]",
              cardAspectClassName
            )}
          >
            <div className="absolute inset-0 animate-pulse bg-[linear-gradient(135deg,rgba(255,255,255,0.28),rgba(255,159,178,0.18),rgba(156,217,255,0.18))]" />
            <div className="absolute left-3 top-3 h-6 w-16 animate-pulse bg-white/75" />
            <div className="absolute right-3 top-3 h-9 w-9 animate-pulse bg-[var(--color-ink)]/20 md:hidden" />
          </div>
        ))}
      </div>
    </div>
  );
}

import { AssetGrid } from "@/components/site/asset-grid";
import { GalleryPrefetch } from "@/components/site/gallery-prefetch";
import { Pagination } from "@/components/site/pagination";
import { QuickContributionButton } from "@/components/site/quick-contribution-button";
import { SiteShell } from "@/components/site/site-shell";
import type { PagedResult, AssetRecord } from "@/lib/types";
import type { AssetGridPreset } from "@/components/site/asset-grid";
import { getTurnstileSiteKey, isPublicSupabaseConfigured } from "@/lib/env";

export function CategoryPage({
  currentPath,
  title,
  description,
  pageResult,
  gridPreset = "default",
  prefetchTargets = [],
  headerMode = "full",
}: {
  currentPath: string;
  title: string;
  description: string;
  pageResult: PagedResult<AssetRecord>;
  gridPreset?: AssetGridPreset;
  prefetchTargets?: Array<{
    href: string;
    assets: AssetRecord[];
  }>;
  headerMode?: "full" | "pagination-only";
}) {
  const contributionEnabled = isPublicSupabaseConfigured();
  const turnstileSiteKey = getTurnstileSiteKey();

  return (
    <SiteShell currentPath={currentPath}>
      {headerMode === "full" ? (
        <section className="px-3 pb-6 pt-2 md:px-8 md:pb-8 md:pt-4">
          <div className="poster-surface mx-auto max-w-7xl rounded-none border border-white/70 px-4 py-5 md:px-10 md:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-2.5 md:space-y-4">
                <h1 className="headline-display text-4xl leading-[0.92] text-[var(--color-ink)] md:text-7xl">
                  {title}
                </h1>
                {description ? (
                  <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">
                    {description}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2.5 md:gap-3">
                <div className="bg-white/90 px-3 py-2.5 text-sm font-bold text-[var(--color-ink)]">
                  Trang {pageResult.page} / {pageResult.pageCount}
                </div>
                <div className="bg-white/90 px-3 py-2.5 text-sm font-bold text-[var(--color-ink)]">
                  {pageResult.total} asset
                </div>
                <QuickContributionButton
                  label="Gửi ảnh"
                  variant="secondary"
                  size="sm"
                  compact
                  disabled={!contributionEnabled}
                  turnstileSiteKey={turnstileSiteKey}
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-3 pb-4 pt-2 md:px-8 md:pb-5 md:pt-4">
          <div className="mx-auto max-w-7xl">
            <Pagination
              basePath={currentPath}
              page={pageResult.page}
              pageCount={pageResult.pageCount}
            />
          </div>
        </section>
      )}

      <section className="px-3 pb-10 md:px-8 md:pb-12">
        <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
          <GalleryPrefetch targets={prefetchTargets} gridPreset={gridPreset} />
          <AssetGrid assets={pageResult.items} gridPreset={gridPreset} />
          {headerMode === "full" ? (
            <Pagination
              basePath={currentPath}
              page={pageResult.page}
              pageCount={pageResult.pageCount}
            />
          ) : null}
        </div>
      </section>
    </SiteShell>
  );
}

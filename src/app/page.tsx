import Link from "next/link";

import { AssetGrid } from "@/components/site/asset-grid";
import { QuickContributionButton } from "@/components/site/quick-contribution-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { linkButtonClassName } from "@/components/ui/button";
import { SITE_DESCRIPTION } from "@/lib/constants";
import { getAssetsPage, getFeaturedAssets } from "@/lib/data/assets";
import { getTurnstileSiteKey, isPublicSupabaseConfigured } from "@/lib/env";

export default async function HomePage() {
  const [featured, latestMobile] = await Promise.all([
    getFeaturedAssets(6),
    getAssetsPage("mobile", 1, 5),
  ]);
  const contributionEnabled = isPublicSupabaseConfigured();
  const turnstileSiteKey = getTurnstileSiteKey();

  const firstAsset = featured[0] ?? latestMobile.items[0];

  if (!firstAsset) {
    return (
      <SiteShell currentPath="/">
        <section className="px-4 py-24 md:px-8">
          <div className="mx-auto max-w-5xl rounded-none bg-white/80 p-10 text-center shadow-cute">
            <h1 className="headline-display text-5xl text-[var(--color-ink)]">
              Chưa có asset nào sẵn sàng.
            </h1>
            <p className="mt-4 text-slate-600">{SITE_DESCRIPTION}</p>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell currentPath="/">
      <section className="px-3 pb-8 pt-2 md:px-8 md:pb-12 md:pt-4">
        <div className="mx-auto max-w-7xl space-y-5 md:space-y-8">
          <SectionHeading
            eyebrow="Featured"
            title="Nổi bật"
            action={
              <Link
                href="/desktop"
                className={linkButtonClassName({
                  variant: "secondary",
                  size: "md",
                  className: "w-full justify-center md:w-auto",
                })}
              >
                Xem tất cả
              </Link>
            }
          />
          <AssetGrid assets={featured} gridPreset="home-featured-two-up" />
        </div>
      </section>

      <section className="px-3 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-7xl space-y-5 md:space-y-8">
          <SectionHeading
            eyebrow="Latest"
            title="Mới lên"
            action={
              <Link
                href="/mobile"
                className={linkButtonClassName({
                  variant: "secondary",
                  size: "md",
                  className: "w-full justify-center md:w-auto",
                })}
              >
                Xem tất cả
              </Link>
            }
          />
          <AssetGrid
            assets={latestMobile.items}
            gridPreset="home-latest-five-up"
          />
        </div>
      </section>

      <section className="px-3 py-8 md:px-8 md:py-12">
        <div className="poster-surface mx-auto grid max-w-7xl gap-4 rounded-none border border-white/70 px-4 py-5 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-10">
          <div className="space-y-1.5">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
              Contribution
            </p>
            <h2 className="headline-display text-3xl text-[var(--color-ink)] md:text-5xl">
              Đóng góp nhanh
            </h2>
          </div>
          <div className="flex items-center justify-start md:justify-end">
            <QuickContributionButton
              label="Chọn ảnh và gửi"
              variant="primary"
              size="md"
              className="w-full md:w-auto"
              disabled={!contributionEnabled}
              turnstileSiteKey={turnstileSiteKey}
            />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

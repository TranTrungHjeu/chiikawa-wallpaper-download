import Image from "next/image";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";

import { QuickContributionButton } from "@/components/site/quick-contribution-button";
import { Badge } from "@/components/ui/badge";
import { linkButtonClassName } from "@/components/ui/button";
import { getTurnstileSiteKey, isPublicSupabaseConfigured } from "@/lib/env";
import { getAssetThumbnailUrl } from "@/lib/image";
import type { AssetRecord, GalleryStats } from "@/lib/types";

export function HeroPoster({
  asset,
  stats,
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  asset: AssetRecord;
  stats: GalleryStats;
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  const imageUrl = getAssetThumbnailUrl(asset, "detail");
  const contributionEnabled = isPublicSupabaseConfigured();
  const turnstileSiteKey = getTurnstileSiteKey();

  return (
    <section className="px-4 pb-12 pt-2 md:px-8">
      <div className="poster-surface poster-glow poster-enter relative mx-auto overflow-hidden rounded-none border border-white/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,159,178,0.22),_transparent_20rem),radial-gradient(circle_at_bottom_right,_rgba(156,217,255,0.22),_transparent_26rem)]" />
        <div className="grid min-h-[78svh] items-stretch lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative flex flex-col justify-between px-6 py-8 md:px-10 md:py-10 lg:px-14 lg:py-14">
            <div className="space-y-4">
              <Badge>Archive</Badge>
              <div className="space-y-2">
                <h1 className="headline-display max-w-3xl text-5xl leading-[0.9] text-[var(--color-ink)] md:text-7xl">
                  {title}
                </h1>
                <p className="max-w-md text-sm leading-7 text-slate-600 md:text-base">
                  {description}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={ctaHref}
                  className={linkButtonClassName({ variant: "primary", size: "lg" })}
                >
                  <DownloadSimple className="h-5 w-5" weight="bold" />
                  {ctaLabel}
                </a>
                <QuickContributionButton
                  label="Gửi ảnh"
                  variant="secondary"
                  size="lg"
                  compact
                  disabled={!contributionEnabled}
                  turnstileSiteKey={turnstileSiteKey}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="bg-white/82 px-4 py-3 text-sm font-bold text-[var(--color-ink)]">
                {stats.totalAssets} asset
              </div>
              <div className="bg-white/82 px-4 py-3 text-sm font-bold text-[var(--color-ink)]">
                {stats.totalMobile} mobile
              </div>
              <div className="bg-white/82 px-4 py-3 text-sm font-bold text-[var(--color-ink)]">
                {stats.totalDesktop} desktop
              </div>
              <div className="bg-white/82 px-4 py-3 text-sm font-bold text-[var(--color-ink)]">
                {stats.totalGif} gif
              </div>
            </div>
          </div>

          <div className="relative min-h-[26rem] lg:min-h-full">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(255,249,241,0.18))]" />
            <div className="mask-fade-bottom absolute inset-0">
              <Image
                src={imageUrl}
                alt={asset.title}
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover poster-float"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

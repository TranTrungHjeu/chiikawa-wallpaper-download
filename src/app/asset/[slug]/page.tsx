import type { Metadata } from "next";
import Image from "next/image";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";

import { AssetGrid } from "@/components/site/asset-grid";
import { LazyQuickContributionButton } from "@/components/site/lazy-quick-contribution-button";
import { Badge } from "@/components/ui/badge";
import { linkButtonClassName } from "@/components/ui/button";
import { getAssetBySlug, getRelatedAssets } from "@/lib/data/assets";
import { getTurnstileSiteKey, isPublicSupabaseConfigured } from "@/lib/env";
import { getAssetThumbnailUrl } from "@/lib/image";
import { formatBytes, formatDimensions, getAssetDownloadRoute, getKindLabel } from "@/lib/utils";

const detailAspectClassNames = {
  mobile: "aspect-[4/5]",
  desktop: "aspect-[16/10]",
  gif: "aspect-square",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const asset = await getAssetBySlug(slug);

  if (!asset) {
    return {
      title: "Asset không tồn tại",
    };
  }

  return {
    title: asset.title,
    description:
      asset.description ?? `Tải ${getKindLabel(asset.kind)} Chiikawa với file gốc chất lượng cao.`,
    openGraph: {
      images: asset.secure_url || asset.original_url ? [asset.secure_url ?? asset.original_url!] : [],
    },
  };
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const asset = await getAssetBySlug(slug);

  if (!asset) {
    notFound();
  }

  const related = await getRelatedAssets(asset, 3);
  const imageUrl = getAssetThumbnailUrl(asset, "detail");
  const contributionEnabled = isPublicSupabaseConfigured();
  const turnstileSiteKey = getTurnstileSiteKey();

  return (
    <>
      <section className="px-4 pb-10 pt-4 md:px-8">
        <div className="poster-surface mx-auto grid max-w-7xl gap-8 rounded-none border border-white/70 p-6 md:grid-cols-[0.95fr_1.05fr] md:p-8">
          <div className="space-y-5">
            <Badge>{getKindLabel(asset.kind)}</Badge>
            <div>
              <h1 className="headline-display text-4xl leading-tight text-[var(--color-ink)] md:text-6xl">
                {asset.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="bg-white/85 px-4 py-3 text-sm font-bold text-[var(--color-ink)]">
                {formatDimensions(asset)}
              </div>
              <div className="bg-white/85 px-4 py-3 text-sm font-bold text-[var(--color-ink)]">
                {formatBytes(asset.bytes)}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={getAssetDownloadRoute(asset.id)}
                className={linkButtonClassName({ variant: "primary", size: "lg" })}
              >
                <DownloadSimple className="h-5 w-5" weight="bold" />
                Tải gốc
              </a>
              <LazyQuickContributionButton
                label="Gửi ảnh"
                variant="secondary"
                size="lg"
                compact
                disabled={!contributionEnabled}
                turnstileSiteKey={turnstileSiteKey}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-none bg-white/70">
            <div
              className={`relative min-h-[24rem] ${detailAspectClassNames[asset.kind]}`}
            >
              <Image
                src={imageUrl}
                alt={asset.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Related</p>
            <h2 className="headline-display text-4xl text-[var(--color-ink)]">Xem thêm</h2>
          </div>
          <AssetGrid
            assets={related}
            emptyTitle="Chưa có asset liên quan"
            emptyDescription="Sẽ có thêm khi thư viện cập nhật."
          />
        </div>
      </section>
    </>
  );
}

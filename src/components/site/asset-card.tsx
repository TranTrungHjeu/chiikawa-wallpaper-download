"use client";

import Image from "next/image";
import { ArrowsOutSimple, DownloadSimple } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { getAssetThumbnailUrl, getAssetPreviewPriority } from "@/lib/image";
import type { AssetRecord } from "@/lib/types";
import { cn, getAssetDownloadRoute, getKindLabel } from "@/lib/utils";

const aspectClassNames = {
  mobile: "aspect-[9/19]",
  desktop: "aspect-[16/10]",
  gif: "aspect-square",
} as const;

const imageClassNames = {
  mobile: "object-cover",
  desktop: "object-contain p-3 md:p-4",
  gif: "object-cover",
} as const;

function isAnimatedAsset(asset: AssetRecord) {
  return (
    asset.kind === "gif" ||
    asset.format?.toLowerCase() === "gif" ||
    asset.original_url?.toLowerCase().endsWith(".gif") === true
  );
}

export function AssetCard({
  asset,
  index = 0,
  imageSizes = "(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw",
  onPreview,
}: {
  asset: AssetRecord;
  index?: number;
  imageSizes?: string;
  onPreview?: (asset: AssetRecord) => void;
}) {
  const imageUrl = getAssetThumbnailUrl(asset, "card");
  const isAnimated = isAnimatedAsset(asset);

  function openPreview() {
    onPreview?.(asset);
  }

  return (
    <article className="group relative">
      <div
        className={cn(
          "relative overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,249,241,0.72))]",
          aspectClassNames[asset.kind]
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,159,178,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(156,217,255,0.14),transparent_34%)]" />
        <Image
          src={imageUrl}
          alt={asset.title}
          fill
          priority={getAssetPreviewPriority(index)}
          sizes={imageSizes}
          unoptimized={isAnimated}
          className={cn(
            "transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015]",
            imageClassNames[asset.kind]
          )}
        />

        <button
          type="button"
          aria-label={`Preview ${asset.title}`}
          onClick={openPreview}
          className="absolute inset-0 z-10"
        />

        <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-2.5 md:p-3">
          <Badge className="bg-white/82 text-[11px] text-slate-700">
            {getKindLabel(asset.kind)}
          </Badge>
          <a
            href={getAssetDownloadRoute(asset.id)}
            aria-label={`Download ${asset.title}`}
            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center bg-[var(--color-ink)]/90 text-white shadow-[0_10px_24px_rgba(37,48,74,0.18)] md:hidden"
          >
            <DownloadSimple className="h-4 w-4" weight="bold" />
          </a>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-slate-950/26 opacity-0 transition duration-300 md:group-hover:opacity-100 md:group-focus-within:opacity-100" />

        <div className="absolute inset-x-3 bottom-3 z-20 hidden translate-y-2 items-center gap-2 opacity-0 transition duration-300 md:flex md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={openPreview}
            className="pointer-events-auto inline-flex h-11 flex-1 items-center justify-center gap-2 bg-white/92 px-4 text-sm font-bold text-[var(--color-ink)] backdrop-blur transition hover:bg-white"
          >
            <ArrowsOutSimple className="h-4 w-4" weight="bold" />
            Preview
          </button>
          <a
            href={getAssetDownloadRoute(asset.id)}
            aria-label={`Download ${asset.title}`}
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center bg-[var(--color-ink)] text-white transition hover:bg-slate-800"
          >
            <DownloadSimple className="h-4 w-4" weight="bold" />
          </a>
        </div>
      </div>
    </article>
  );
}

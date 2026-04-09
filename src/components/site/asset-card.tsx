"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowsOutSimple, DownloadSimple, X } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import {
  getAssetOriginalImageUrl,
  getAssetThumbnailUrl,
  getAssetPreviewPriority,
} from "@/lib/image";
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

const PREVIEW_MIN_LOADING_MS = 300;
const previewImageCache = new Set<string>();

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
}: {
  asset: AssetRecord;
  index?: number;
  imageSizes?: string;
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [loadedPreviewUrl, setLoadedPreviewUrl] = useState<string | null>(null);
  const imageUrl = getAssetThumbnailUrl(asset, "card");
  const previewUrl = getAssetOriginalImageUrl(asset);
  const isAnimated = isAnimatedAsset(asset);

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isPreviewOpen]);

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    if (previewImageCache.has(previewUrl)) {
      return;
    }

    let isCancelled = false;
    let minimumDelayHandle = 0;
    const preloader = new window.Image();
    const minimumDelayPromise = new Promise<void>((resolve) => {
      minimumDelayHandle = window.setTimeout(resolve, PREVIEW_MIN_LOADING_MS);
    });

    const imageLoadedPromise = new Promise<void>((resolve) => {
      const handleLoaded = () => {
        previewImageCache.add(previewUrl);
        resolve();
      };

      preloader.onload = handleLoaded;
      preloader.onerror = handleLoaded;
      preloader.src = previewUrl;
    });

    void Promise.all([minimumDelayPromise, imageLoadedPromise]).then(() => {
      if (isCancelled) {
        return;
      }

      setLoadedPreviewUrl(previewUrl);
      setIsPreviewLoading(false);
    });

    return () => {
      isCancelled = true;
      window.clearTimeout(minimumDelayHandle);
      preloader.onload = null;
      preloader.onerror = null;
    };
  }, [isPreviewOpen, previewUrl]);

  function openPreview() {
    const cachedPreview = new window.Image();
    cachedPreview.src = previewUrl;
    const isCached =
      previewImageCache.has(previewUrl) ||
      (cachedPreview.complete && cachedPreview.naturalWidth > 0);

    if (isCached) {
      previewImageCache.add(previewUrl);
    }

    setLoadedPreviewUrl(isCached ? previewUrl : null);
    setIsPreviewLoading(!isCached);
    setIsPreviewOpen(true);
  }

  return (
    <>
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

      {isPreviewOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] bg-slate-950/94 p-4 md:p-8"
              onClick={() => setIsPreviewOpen(false)}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,159,178,0.16),transparent_24rem),radial-gradient(circle_at_bottom_right,rgba(156,217,255,0.16),transparent_26rem)]" />

              <button
                type="button"
                aria-label="Close preview"
                onClick={() => setIsPreviewOpen(false)}
                className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                <X className="h-5 w-5" weight="bold" />
              </button>

              <div className="relative flex h-full items-center justify-center">
                <div
                  className="relative flex min-h-[56vh] min-w-[min(82vw,360px)] items-center justify-center max-h-full max-w-[min(94vw,1800px)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  {isPreviewLoading ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                      <div className="preview-spinner" aria-hidden="true" />
                    </div>
                  ) : null}

                  {loadedPreviewUrl ? (
                    <>
                      {/* Preview uses the original asset URL instead of a resized thumbnail. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={loadedPreviewUrl}
                        alt={asset.title}
                        className="max-h-[88vh] w-auto max-w-full object-contain shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

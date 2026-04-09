"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { ArrowsOutSimple, X } from "@phosphor-icons/react";

import { getAssetOriginalImageUrl, getAssetThumbnailUrl } from "@/lib/image";
import type { AssetRecord } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

const PREVIEW_MIN_LOADING_MS = 300;
const previewImageCache = new Set<string>();

function isAnimatedAsset(asset: AssetRecord) {
  return (
    asset.kind === "gif" ||
    asset.format?.toLowerCase() === "gif" ||
    asset.original_url?.toLowerCase().endsWith(".gif") === true
  );
}

function getPreviewFrameClass(asset: AssetRecord) {
  if (asset.kind === "desktop") {
    return "h-[80px] w-[142px]";
  }

  if (asset.kind === "gif") {
    return "h-[104px] w-[104px]";
  }

  return "h-[146px] w-[82px]";
}

function getPreviewDimensions(asset: AssetRecord) {
  if (asset.kind === "desktop") {
    return { width: 142, height: 80 };
  }

  if (asset.kind === "gif") {
    return { width: 104, height: 104 };
  }

  return { width: 82, height: 146 };
}

export function AdminAssetsList({ items }: { items: AssetRecord[] }) {
  const [previewAsset, setPreviewAsset] = useState<AssetRecord | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [loadedPreviewUrl, setLoadedPreviewUrl] = useState<string | null>(null);

  const previewUrl = previewAsset ? getAssetOriginalImageUrl(previewAsset) : null;

  useEffect(() => {
    if (!previewAsset) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewAsset(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [previewAsset]);

  useEffect(() => {
    if (!previewAsset || !previewUrl) {
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
  }, [previewAsset, previewUrl]);

  function openPreview(asset: AssetRecord) {
    const originalUrl = getAssetOriginalImageUrl(asset);
    const cachedPreview = new window.Image();
    cachedPreview.src = originalUrl;
    const isCached =
      previewImageCache.has(originalUrl) ||
      (cachedPreview.complete && cachedPreview.naturalWidth > 0);

    if (isCached) {
      previewImageCache.add(originalUrl);
    }

    setLoadedPreviewUrl(isCached ? originalUrl : null);
    setIsPreviewLoading(!isCached);
    setPreviewAsset(asset);
  }

  return (
    <>
      {items.map((asset) => {
        const dimensions = getPreviewDimensions(asset);

        return (
          <div
            key={asset.id}
            className="grid gap-5 border-b border-slate-100 px-6 py-5 last:border-b-0 md:grid-cols-[1.8fr_0.45fr]"
          >
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => openPreview(asset)}
                className="group relative shrink-0 overflow-hidden border border-slate-100 bg-slate-50"
                aria-label={`Preview ${asset.title}`}
              >
                <Image
                  src={getAssetThumbnailUrl(asset)}
                  alt={asset.title}
                  width={dimensions.width}
                  height={dimensions.height}
                  unoptimized={isAnimatedAsset(asset)}
                  className={`${getPreviewFrameClass(asset)} object-cover transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]`}
                />
                <div className="pointer-events-none absolute inset-0 bg-slate-950/0 transition duration-300 group-hover:bg-slate-950/26" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-end bg-[linear-gradient(180deg,rgba(37,48,74,0),rgba(37,48,74,0.72))] px-2 py-2 opacity-0 transition duration-300 group-hover:opacity-100">
                  <span className="inline-flex h-8 w-8 items-center justify-center bg-white/92 text-[var(--color-ink)] shadow-[0_8px_20px_rgba(37,48,74,0.18)]">
                    <ArrowsOutSimple className="h-3.5 w-3.5" weight="bold" />
                  </span>
                </div>
              </button>

              <div className="space-y-2">
                <p className="text-base font-black tracking-[-0.02em] text-[var(--color-ink)]">
                  {asset.title}
                </p>
                <p className="text-sm font-semibold text-slate-500">{asset.slug}</p>
              </div>
            </div>

            <div className="self-start border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              {formatBytes(asset.bytes)}
            </div>
          </div>
        );
      })}

      {previewAsset && previewUrl && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] bg-slate-950/94 p-4 md:p-8"
              onClick={() => setPreviewAsset(null)}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,159,178,0.16),transparent_24rem),radial-gradient(circle_at_bottom_right,rgba(156,217,255,0.16),transparent_26rem)]" />

              <button
                type="button"
                aria-label="Close preview"
                onClick={() => setPreviewAsset(null)}
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
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={loadedPreviewUrl}
                      alt={previewAsset.title}
                      className="max-h-[88vh] w-auto max-w-full object-contain shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
                    />
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

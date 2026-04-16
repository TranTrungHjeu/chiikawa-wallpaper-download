"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";

import { getAssetOriginalImageUrl } from "@/lib/image";
import type { AssetRecord } from "@/lib/types";

const PREVIEW_MIN_LOADING_MS = 120;
const previewImageCache = new Set<string>();

type AssetPreviewModalProps = {
  asset: AssetRecord | null;
  onClose: () => void;
};

function PreviewImageFrame({
  asset,
  previewUrl,
}: {
  asset: AssetRecord;
  previewUrl: string;
}) {
  const isCached = previewImageCache.has(previewUrl);
  const [isPreviewLoading, setIsPreviewLoading] = useState(!isCached);
  const [loadedPreviewUrl, setLoadedPreviewUrl] = useState<string | null>(
    isCached ? previewUrl : null
  );

  useEffect(() => {
    if (isCached) {
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
  }, [isCached, previewUrl]);

  return (
    <div className="relative flex min-h-[56vh] min-w-[min(82vw,360px)] items-center justify-center max-h-full max-w-[min(94vw,1800px)]">
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
            decoding="async"
            loading="eager"
            className="max-h-[88vh] w-auto max-w-full object-contain shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
          />
        </>
      ) : null}
    </div>
  );
}

export function AssetPreviewModal({
  asset,
  onClose,
}: AssetPreviewModalProps) {
  const previewUrl = asset ? getAssetOriginalImageUrl(asset) : null;

  useEffect(() => {
    if (!asset) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [asset, onClose]);

  if (!asset || !previewUrl || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] bg-slate-950/94 p-4 md:p-8"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,159,178,0.16),transparent_24rem),radial-gradient(circle_at_bottom_right,rgba(156,217,255,0.16),transparent_26rem)]" />

      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
      >
        <X className="h-5 w-5" weight="bold" />
      </button>

      <div className="relative flex h-full items-center justify-center">
        <div
          onClick={(event) => event.stopPropagation()}
        >
          <PreviewImageFrame
            key={previewUrl}
            asset={asset}
            previewUrl={previewUrl}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

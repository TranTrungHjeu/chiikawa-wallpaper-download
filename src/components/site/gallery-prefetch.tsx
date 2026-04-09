"use client";

import { getImageProps } from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  getAssetGridPrefetchWidth,
  type AssetGridPreset,
} from "@/components/site/asset-grid";
import { getAssetThumbnailUrl } from "@/lib/image";
import type { AssetRecord } from "@/lib/types";

const PREFETCH_ASSET_LIMIT = 10;
const prefetchedRoutes = new Set<string>();
const prefetchedImages = new Set<string>();

type PrefetchTarget = {
  href: string;
  assets: AssetRecord[];
};

function isAnimatedAsset(asset: AssetRecord) {
  return (
    asset.kind === "gif" ||
    asset.format?.toLowerCase() === "gif" ||
    asset.original_url?.toLowerCase().endsWith(".gif") === true
  );
}

function getFallbackHeight(asset: AssetRecord, width: number) {
  if (asset.kind === "mobile") {
    return Math.round(width * (19 / 9));
  }

  if (asset.kind === "desktop") {
    return Math.round(width * (10 / 16));
  }

  return width;
}

function getOptimizedPrefetchUrl(asset: AssetRecord, width: number) {
  if (isAnimatedAsset(asset)) {
    return getAssetThumbnailUrl(asset, "card");
  }

  const sourceWidth = asset.width ?? width;
  const sourceHeight = asset.height ?? getFallbackHeight(asset, width);
  const targetHeight = Math.max(
    1,
    Math.round((width / sourceWidth) * sourceHeight)
  );

  return getImageProps({
    alt: "",
    src: getAssetThumbnailUrl(asset, "card"),
    width,
    height: targetHeight,
  }).props.src;
}

function runWhenIdle(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const browserWindow = window;

  if ("requestIdleCallback" in browserWindow) {
    const idleWindow = browserWindow as Window & {
      requestIdleCallback: (
        cb: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number;
      cancelIdleCallback: (handle: number) => void;
    };
    const handle = idleWindow.requestIdleCallback(callback, { timeout: 1200 });

    return () => idleWindow.cancelIdleCallback(handle);
  }

  const handle = setTimeout(callback, 250);
  return () => clearTimeout(handle);
}

export function GalleryPrefetch({
  targets,
  gridPreset,
}: {
  targets: PrefetchTarget[];
  gridPreset: AssetGridPreset;
}) {
  const router = useRouter();
  const prefetchWidth = getAssetGridPrefetchWidth(gridPreset);

  useEffect(() => {
    for (const target of targets) {
      if (prefetchedRoutes.has(target.href)) {
        continue;
      }

      router.prefetch(target.href);
      prefetchedRoutes.add(target.href);
    }

    return runWhenIdle(() => {
      for (const target of targets) {
        for (const asset of target.assets.slice(0, PREFETCH_ASSET_LIMIT)) {
          const optimizedUrl = getOptimizedPrefetchUrl(asset, prefetchWidth);

          if (prefetchedImages.has(optimizedUrl)) {
            continue;
          }

          prefetchedImages.add(optimizedUrl);

          const image = new window.Image();
          image.decoding = "async";
          image.src = optimizedUrl;
        }
      }
    });
  }, [prefetchWidth, router, targets]);

  return null;
}

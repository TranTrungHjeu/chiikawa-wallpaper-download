"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  getAssetGridPrefetchWidth,
  type AssetGridPreset,
} from "@/components/site/asset-grid";
import { prefetchAssetImages } from "@/lib/image-prefetch";
import type { AssetRecord } from "@/lib/types";

const PREFETCH_ASSET_LIMIT = 4;
const prefetchedRoutes = new Set<string>();

type PrefetchTarget = {
  href: string;
  assets: AssetRecord[];
};

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
    const primaryTarget = targets[0];

    if (primaryTarget && !prefetchedRoutes.has(primaryTarget.href)) {
      router.prefetch(primaryTarget.href);
      prefetchedRoutes.add(primaryTarget.href);
    }

    return runWhenIdle(() => {
      if (!primaryTarget) {
        return;
      }

      prefetchAssetImages(
        primaryTarget.assets,
        prefetchWidth,
        PREFETCH_ASSET_LIMIT
      );
    });
  }, [prefetchWidth, router, targets]);

  return null;
}

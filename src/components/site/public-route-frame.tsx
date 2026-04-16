"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { PageTransition } from "@/components/site/page-transition";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { canPrefetchImages, prefetchAssetImages } from "@/lib/image-prefetch";
import type { PrimaryRoutePrefetchManifest } from "@/lib/gallery";

const PRIMARY_ROUTES = ["/", "/mobile", "/desktop", "/gif"] as const;
const PRIMARY_ROUTE_ASSET_PREFETCH_LIMIT = 3;
const ROUTE_PREFETCH_PRIORITY: Record<string, string[]> = {
  "/": ["/mobile", "/desktop"],
  "/mobile": ["/desktop", "/gif"],
  "/desktop": ["/mobile", "/gif"],
  "/gif": ["/mobile", "/desktop"],
};
const warmedRoutes = new Set<string>();

function runWhenIdle(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  if ("requestIdleCallback" in window) {
    const idleHandle = window.requestIdleCallback(callback, { timeout: 1200 });
    return () => window.cancelIdleCallback(idleHandle);
  }

  const timeoutHandle = globalThis.setTimeout(callback, 320);
  return () => globalThis.clearTimeout(timeoutHandle);
}

export function PublicRouteFrame({
  prefetchManifest,
  children,
}: {
  prefetchManifest: PrimaryRoutePrefetchManifest;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminRoute = pathname.startsWith("/admin");

  const prefetchPrimaryRoute = useCallback(
    (href: string) => {
      if (warmedRoutes.has(href)) {
        return;
      }

      router.prefetch(href);
      warmedRoutes.add(href);
    },
    [router]
  );

  const warmRoute = useCallback(
    (href: string) => {
      prefetchPrimaryRoute(href);

      for (const target of prefetchManifest[href] ?? []) {
        prefetchAssetImages(
          target.assets,
          target.width,
          PRIMARY_ROUTE_ASSET_PREFETCH_LIMIT
        );
      }
    },
    [prefetchManifest, prefetchPrimaryRoute]
  );

  useEffect(() => {
    if (isAdminRoute || !canPrefetchImages()) {
      return;
    }

    const cancelIdle = runWhenIdle(() => {
      const prioritizedRoutes =
        ROUTE_PREFETCH_PRIORITY[pathname] ??
        PRIMARY_ROUTES.filter((href) => href !== pathname);

      for (const href of prioritizedRoutes) {
        prefetchPrimaryRoute(href);
      }
    });

    return cancelIdle;
  }, [isAdminRoute, pathname, prefetchPrimaryRoute]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="cute-orb left-[-4rem] top-20 h-44 w-44 bg-[var(--color-blush)]/55" />
      <div className="cute-orb right-[-5rem] top-56 h-56 w-56 bg-[var(--color-sky)]/45" />
      <div className="cute-orb bottom-24 left-[18%] h-36 w-36 bg-[var(--color-mint)]/55" />

      <SiteNav onRouteIntent={warmRoute} />
      <main className="relative z-10">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
    </div>
  );
}

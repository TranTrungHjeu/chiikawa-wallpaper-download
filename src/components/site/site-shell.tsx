import { Suspense, type ReactNode } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { PageTransition } from "@/components/site/page-transition";

export function SiteShell({
  currentPath,
  children,
}: {
  currentPath?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="cute-orb left-[-4rem] top-20 h-44 w-44 bg-[var(--color-blush)]/55" />
      <div className="cute-orb right-[-5rem] top-56 h-56 w-56 bg-[var(--color-sky)]/45" />
      <div className="cute-orb bottom-24 left-[18%] h-36 w-36 bg-[var(--color-mint)]/55" />

      <SiteNav currentPath={currentPath} />
      <main className="relative z-10">
        <Suspense fallback={<div>{children}</div>}>
          <PageTransition>{children}</PageTransition>
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

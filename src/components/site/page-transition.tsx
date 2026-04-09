"use client";

import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  return (
    <div key={routeKey} className="page-transition-shell">
      {children}
    </div>
  );
}

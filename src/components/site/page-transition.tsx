"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
  usePathname();

  return (
    <div className="page-transition-shell">
      {children}
    </div>
  );
}

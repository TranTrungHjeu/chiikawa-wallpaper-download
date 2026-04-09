import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none border border-white/70 bg-white/75 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 backdrop-blur",
        className
      )}
    >
      {children}
    </span>
  );
}

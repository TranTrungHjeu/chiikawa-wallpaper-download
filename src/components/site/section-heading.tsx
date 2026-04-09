import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-2.5">
        <Badge>{eyebrow}</Badge>
        <h2 className="headline-display text-[1.9rem] leading-[0.96] text-[var(--color-ink)] md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base md:leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="w-full md:w-auto">{action}</div> : null}
    </div>
  );
}

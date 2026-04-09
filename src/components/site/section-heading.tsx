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
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-3">
        <Badge>{eyebrow}</Badge>
        <h2 className="headline-display text-3xl leading-tight text-[var(--color-ink)] md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-xl text-sm leading-7 text-slate-600 md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

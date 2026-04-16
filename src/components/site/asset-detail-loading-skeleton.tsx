export function AssetDetailLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <div className="poster-surface grid gap-8 border border-white/70 p-6 md:grid-cols-[0.95fr_1.05fr] md:p-8">
        <div className="space-y-5">
          <div className="h-7 w-24 animate-pulse bg-white/80" />
          <div className="space-y-3">
            <div className="h-10 w-3/4 animate-pulse bg-white/78 md:h-14" />
            <div className="h-10 w-1/2 animate-pulse bg-white/72 md:h-14" />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="h-12 w-32 animate-pulse bg-white/80" />
            <div className="h-12 w-28 animate-pulse bg-white/74" />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="h-14 w-40 animate-pulse bg-[var(--color-ink)]/16" />
            <div className="h-14 w-36 animate-pulse bg-white/80" />
          </div>
        </div>

        <div className="min-h-[24rem] animate-pulse bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,249,241,0.7))]" />
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse bg-white/74" />
          <div className="h-10 w-44 animate-pulse bg-white/82" />
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[9/19] animate-pulse bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,249,241,0.68))]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

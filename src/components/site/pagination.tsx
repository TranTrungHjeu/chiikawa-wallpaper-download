import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

import { buildGalleryPageHref, cn } from "@/lib/utils";

export function Pagination({
  basePath,
  page,
  pageCount,
}: {
  basePath: string;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const pageNumbers = Array.from(
    new Set(
      [1, page - 1, page, page + 1, pageCount].filter(
        (pageNumber) => pageNumber >= 1 && pageNumber <= pageCount
      )
    )
  ).sort((left, right) => left - right);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2">
      <Link
        href={buildGalleryPageHref(basePath, Math.max(page - 1, 1))}
        prefetch={false}
        scroll={false}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-none border border-white/70 bg-white/80 px-3 text-[13px] font-black uppercase tracking-[0.08em] text-[var(--color-ink)] backdrop-blur transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white md:h-11 md:px-4 md:text-sm md:font-bold md:tracking-normal",
          page <= 1 && "pointer-events-none opacity-45"
        )}
      >
        <CaretLeft className="mr-1 h-4 w-4" weight="bold" />
        Trước
      </Link>

      {pageNumbers.map((pageNumber, index) => (
        <div key={pageNumber} className="flex items-center gap-2">
          {index > 0 && pageNumber - pageNumbers[index - 1] > 1 ? (
            <span className="px-1 text-sm font-black text-slate-400">...</span>
          ) : null}
          <Link
            href={buildGalleryPageHref(basePath, pageNumber)}
            prefetch={false}
            scroll={false}
            className={cn(
              "inline-flex h-10 min-w-10 items-center justify-center rounded-none border border-white/70 bg-white/80 px-2 text-[13px] font-black text-[var(--color-ink)] backdrop-blur transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white md:h-11 md:w-11 md:px-0 md:text-sm md:font-bold",
              pageNumber === page &&
                "bg-[var(--color-ink)] text-white shadow-[0_10px_24px_rgba(37,48,74,0.18)]"
            )}
          >
            {pageNumber}
          </Link>
        </div>
      ))}

      <Link
        href={buildGalleryPageHref(basePath, Math.min(page + 1, pageCount))}
        prefetch={false}
        scroll={false}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-none border border-white/70 bg-white/80 px-3 text-[13px] font-black uppercase tracking-[0.08em] text-[var(--color-ink)] backdrop-blur transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white md:h-11 md:px-4 md:text-sm md:font-bold md:tracking-normal",
          page >= pageCount && "pointer-events-none opacity-45"
        )}
      >
        Sau
        <CaretRight className="ml-1 h-4 w-4" weight="bold" />
      </Link>
    </nav>
  );
}

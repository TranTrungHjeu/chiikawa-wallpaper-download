import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

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

  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2">
      <Link
        href={`${basePath}?page=${Math.max(page - 1, 1)}`}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-none border border-white/70 bg-white/80 px-4 text-sm font-bold text-[var(--color-ink)] backdrop-blur transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white",
          page <= 1 && "pointer-events-none opacity-45"
        )}
      >
        <CaretLeft className="mr-1 h-4 w-4" weight="bold" />
        Trước
      </Link>

      {pageNumbers.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={`${basePath}?page=${pageNumber}`}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-none border border-white/70 bg-white/80 text-sm font-bold text-[var(--color-ink)] backdrop-blur transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white",
            pageNumber === page &&
              "bg-[var(--color-ink)] text-white shadow-[0_10px_24px_rgba(37,48,74,0.18)]"
          )}
        >
          {pageNumber}
        </Link>
      ))}

      <Link
        href={`${basePath}?page=${Math.min(page + 1, pageCount)}`}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-none border border-white/70 bg-white/80 px-4 text-sm font-bold text-[var(--color-ink)] backdrop-blur transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white",
          page >= pageCount && "pointer-events-none opacity-45"
        )}
      >
        Sau
        <CaretRight className="ml-1 h-4 w-4" weight="bold" />
      </Link>
    </nav>
  );
}

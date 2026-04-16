import Link from "next/link";

import { AdminAssetsList } from "@/components/admin/admin-assets-list";
import { PageTransition } from "@/components/site/page-transition";
import { ADMIN_PAGE_SIZE, ASSET_KIND_LABELS } from "@/lib/constants";
import { getAdminAssetsPage, getAssetsStats } from "@/lib/data/assets";
import { isServiceSupabaseConfigured } from "@/lib/env";
import { SetupPanel } from "@/components/admin/setup-panel";
import { requireAdminSession } from "@/lib/auth";
import type { AssetKind } from "@/lib/types";
import { cn, parsePositiveInt } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ADMIN_ASSET_KINDS: AssetKind[] = ["mobile", "desktop", "gif"];

function buildAssetsHref(kind: AssetKind, page: number) {
  return `/admin/assets?kind=${kind}&page=${page}`;
}

function AdminAssetsPagination({
  kind,
  page,
  pageCount,
}: {
  kind: AssetKind;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  const pageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2">
      <Link
        href={buildAssetsHref(kind, Math.max(page - 1, 1))}
        prefetch={false}
        scroll={false}
        className={cn(
          "inline-flex h-11 items-center justify-center border border-white/70 bg-white/82 px-4 text-sm font-black uppercase tracking-[0.12em] text-[var(--color-ink)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white",
          page <= 1 && "pointer-events-none opacity-45"
        )}
      >
        Trước
      </Link>

      {pageNumbers.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={buildAssetsHref(kind, pageNumber)}
          prefetch={false}
          scroll={false}
          className={cn(
            "inline-flex h-11 min-w-11 items-center justify-center border border-white/70 bg-white/82 px-3 text-sm font-black text-[var(--color-ink)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white",
            pageNumber === page &&
              "border-[var(--color-ink)] bg-[var(--color-ink)] text-white shadow-[0_10px_24px_rgba(37,48,74,0.18)]"
          )}
        >
          {pageNumber}
        </Link>
      ))}

      <Link
        href={buildAssetsHref(kind, Math.min(page + 1, pageCount))}
        prefetch={false}
        scroll={false}
        className={cn(
          "inline-flex h-11 items-center justify-center border border-white/70 bg-white/82 px-4 text-sm font-black uppercase tracking-[0.12em] text-[var(--color-ink)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white",
          page >= pageCount && "pointer-events-none opacity-45"
        )}
      >
        Sau
      </Link>
    </nav>
  );
}

export default async function AdminAssetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!isServiceSupabaseConfigured()) {
    return <SetupPanel />;
  }

  await requireAdminSession();

  const query = await searchParams;
  const requestedKind = Array.isArray(query.kind) ? query.kind[0] : query.kind;
  const activeKind = ADMIN_ASSET_KINDS.includes(requestedKind as AssetKind)
    ? (requestedKind as AssetKind)
    : "mobile";
  const page = parsePositiveInt(query.page, 1);

  const [stats, pageResult] = await Promise.all([
    getAssetsStats(),
    getAdminAssetsPage(page, ADMIN_PAGE_SIZE, activeKind),
  ]);

  const kindTotals: Record<AssetKind, number> = {
    mobile: stats.totalMobile,
    desktop: stats.totalDesktop,
    gif: stats.totalGif,
  };

  return (
    <PageTransition>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
              Published library
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--color-ink)]">
              Asset đã public
            </h2>
          </div>
          <div className="border border-slate-100 bg-white/80 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
            {stats.totalAssets} asset
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {ADMIN_ASSET_KINDS.map((kind) => (
            <Link
              key={kind}
              href={buildAssetsHref(kind, 1)}
              prefetch={false}
              scroll={false}
              className={cn(
                "inline-flex shrink-0 items-center gap-3 border px-4 py-3 text-sm font-black uppercase tracking-[0.14em]",
                activeKind === kind
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white shadow-[0_10px_24px_rgba(37,48,74,0.18)]"
                  : "border-slate-200 bg-white/82 text-slate-600 hover:border-[var(--color-sakura)] hover:text-[var(--color-ink)]"
              )}
            >
              <span>{ASSET_KIND_LABELS[kind]}</span>
              <span
                className={cn(
                  "inline-flex min-w-8 items-center justify-center border px-2 py-1 text-[11px]",
                  activeKind === kind
                    ? "border-white/25 bg-white/12 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                )}
              >
                {kindTotals[kind]}
              </span>
            </Link>
          ))}
        </div>

        <div className="overflow-hidden border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(37,48,74,0.08)]">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                {ASSET_KIND_LABELS[activeKind]}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Trang {pageResult.page} / {pageResult.pageCount}
              </p>
            </div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              {pageResult.total} asset
            </div>
          </div>

          {pageResult.items.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
              Chưa có asset nào trong mục này.
            </div>
          ) : (
            <AdminAssetsList items={pageResult.items} />
          )}
        </div>

        <AdminAssetsPagination
          kind={activeKind}
          page={pageResult.page}
          pageCount={pageResult.pageCount}
        />
      </section>
    </PageTransition>
  );
}

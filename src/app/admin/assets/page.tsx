import Link from "next/link";

import { requireAdminSession } from "@/lib/auth";
import { getAdminAssetsPage } from "@/lib/data/assets";
import { isServiceSupabaseConfigured } from "@/lib/env";
import { SetupPanel } from "@/components/admin/setup-panel";
import { formatBytes, formatDimensions, getAssetDownloadRoute } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAssetsPage() {
  if (!isServiceSupabaseConfigured()) {
    return <SetupPanel />;
  }

  await requireAdminSession();
  const assets = await getAdminAssetsPage(1, 20);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
          Published library
        </p>
        <h2 className="headline-display mt-2 text-4xl text-[var(--color-ink)]">
          Asset đã có trong kho public.
        </h2>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-cute">
        <div className="grid gap-0 border-b border-slate-100 bg-slate-50/80 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 md:grid-cols-[1.2fr_0.6fr_0.8fr_0.8fr_0.8fr]">
          <span>Asset</span>
          <span>Loại</span>
          <span>Kích thước</span>
          <span>Dung lượng</span>
          <span>Link</span>
        </div>
        {assets.items.map((asset) => (
          <div
            key={asset.id}
            className="grid gap-5 border-b border-slate-100 px-6 py-5 md:grid-cols-[1.2fr_0.6fr_0.8fr_0.8fr_0.8fr]"
          >
            <div>
              <p className="text-base font-extrabold text-[var(--color-ink)]">
                {asset.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">{asset.slug}</p>
            </div>
            <div className="text-sm font-bold text-slate-700">
              {asset.kind.toUpperCase()}
            </div>
            <div className="text-sm text-slate-700">{formatDimensions(asset)}</div>
            <div className="text-sm text-slate-700">{formatBytes(asset.bytes)}</div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/asset/${asset.slug}`}
                className="rounded-full bg-white px-3 py-2 text-sm font-bold text-[var(--color-ink)] ring-1 ring-slate-200"
              >
                Detail
              </Link>
              <a
                href={getAssetDownloadRoute(asset.id)}
                className="rounded-full bg-slate-950 px-3 py-2 text-sm font-bold text-white"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";

import { getAdminSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const adminSession = await getAdminSession();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,159,178,0.16),_transparent_18rem),radial-gradient(circle_at_bottom_right,_rgba(156,217,255,0.14),_transparent_22rem),linear-gradient(180deg,#fffaf3_0%,#fdfcff_100%)] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="border border-white/70 bg-white/88 px-5 py-4 shadow-[0_18px_50px_rgba(37,48,74,0.08)] md:px-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
              Hachibam Admin
            </p>
            {adminSession ? (
              <nav className="flex flex-wrap items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-600">
                <Link
                  href="/admin/submissions"
                  className="border border-slate-200 bg-white px-4 py-3 transition hover:border-[var(--color-sakura)] hover:text-[var(--color-ink)]"
                >
                  Queue
                </Link>
                <Link
                  href="/admin/assets"
                  className="border border-slate-200 bg-white px-4 py-3 transition hover:border-[var(--color-sakura)] hover:text-[var(--color-ink)]"
                >
                  Assets
                </Link>
                <form action="/api/auth/sign-out" method="post">
                  <button className="bg-[var(--color-ink)] px-4 py-3 text-white transition hover:bg-slate-800">
                    Đăng xuất
                  </button>
                </form>
              </nav>
            ) : null}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

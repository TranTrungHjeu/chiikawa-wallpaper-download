import type { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,159,178,0.22),_transparent_18rem),linear-gradient(180deg,#fffaf3_0%,#fdfcff_100%)] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/80 px-6 py-5 shadow-cute md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Admin workspace
            </p>
            <h1 className="headline-display text-3xl text-[var(--color-ink)]">
              Moderation và kho asset
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-bold text-slate-700">
            <Link href="/admin/submissions" className="rounded-full bg-white px-4 py-2">
              Submissions
            </Link>
            <Link href="/admin/assets" className="rounded-full bg-white px-4 py-2">
              Assets
            </Link>
            <form action="/api/auth/sign-out" method="post">
              <button className="rounded-full bg-slate-950 px-4 py-2 text-white">
                Đăng xuất
              </button>
            </form>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}

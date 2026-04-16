import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <section className="px-4 py-24 md:px-8">
        <div className="mx-auto max-w-4xl rounded-none border border-white/70 bg-white/85 p-10 text-center shadow-cute">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            404
          </p>
          <h1 className="headline-display mt-4 text-5xl text-[var(--color-ink)]">
            Không tìm thấy asset này.
          </h1>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-none bg-[var(--color-ink)] px-5 py-3 text-sm font-bold text-white"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </section>
    </>
  );
}

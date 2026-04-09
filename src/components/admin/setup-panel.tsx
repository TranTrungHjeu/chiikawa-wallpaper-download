export function SetupPanel({
  title = "Thiếu cấu hình backend",
  description = "Thêm biến môi trường Supabase vào .env để bật đăng nhập admin, contribution và importer.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="border border-dashed border-slate-300 bg-white/88 p-8 shadow-[0_18px_50px_rgba(37,48,74,0.06)]">
      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
        Setup required
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[var(--color-ink)]">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-slate-500">
        {description}
      </p>
      <pre className="mt-5 overflow-x-auto bg-slate-950 p-4 text-xs text-slate-100">
        <code>{`cp .env.example .env`}</code>
      </pre>
    </div>
  );
}

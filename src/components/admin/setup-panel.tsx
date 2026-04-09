export function SetupPanel({
  title = "Thiếu cấu hình backend",
  description = "Thêm biến môi trường Supabase vào .env để bật đăng nhập admin, contribution và importer.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-8">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
        Setup required
      </p>
      <h2 className="headline-display mt-3 text-3xl text-[var(--color-ink)]">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        {description}
      </p>
      <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
        <code>{`cp .env.example .env`}</code>
      </pre>
    </div>
  );
}

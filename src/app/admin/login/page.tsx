import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { SetupPanel } from "@/components/admin/setup-panel";
import { isPublicSupabaseConfigured } from "@/lib/env";

export default function AdminLoginPage() {
  const enabled = isPublicSupabaseConfigured();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,159,178,0.22),_transparent_18rem),linear-gradient(180deg,#fffaf3_0%,#fdfcff_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="poster-surface rounded-[2.5rem] border border-white/70 p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            Admin login
          </p>
          <h1 className="headline-display mt-5 text-5xl text-[var(--color-ink)]">
            Chỉ một tài khoản, nhưng mọi contribution đi qua đây.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
            Trang login này giữ phần trình bày nhẹ và sạch. Sau khi vào, admin có thể xem queue chờ duyệt hoặc kiểm tra asset đã publish.
          </p>
        </div>
        {enabled ? <AdminLoginForm /> : <SetupPanel />}
      </div>
    </div>
  );
}

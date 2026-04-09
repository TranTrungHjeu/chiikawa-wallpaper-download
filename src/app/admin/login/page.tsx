import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { SetupPanel } from "@/components/admin/setup-panel";
import { isPublicSupabaseConfigured } from "@/lib/env";

export default function AdminLoginPage() {
  const enabled = isPublicSupabaseConfigured();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,159,178,0.16),_transparent_18rem),radial-gradient(circle_at_bottom_right,_rgba(156,217,255,0.14),_transparent_22rem),linear-gradient(180deg,#fffaf3_0%,#fdfcff_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-md">
        {enabled ? <AdminLoginForm /> : <SetupPanel />}
      </div>
    </div>
  );
}

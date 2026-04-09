import { requireAdminSession } from "@/lib/auth";
import { getAdminSubmissionsPage } from "@/lib/data/submissions";
import { isServiceSupabaseConfigured } from "@/lib/env";
import { SetupPanel } from "@/components/admin/setup-panel";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { formatBytes } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  if (!isServiceSupabaseConfigured()) {
    return <SetupPanel />;
  }

  await requireAdminSession();
  const submissions = await getAdminSubmissionsPage(1, 20);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
          Moderation queue
        </p>
        <h2 className="headline-display mt-2 text-4xl text-[var(--color-ink)]">
          Duyệt đóng góp từ người dùng.
        </h2>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-cute">
        <div className="grid gap-0 border-b border-slate-100 bg-slate-50/80 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500 md:grid-cols-[1.2fr_0.7fr_0.6fr_1.5fr]">
          <span>Asset</span>
          <span>Người gửi</span>
          <span>Loại</span>
          <span>Action</span>
        </div>
        {submissions.items.map((submission) => (
          <div
            key={submission.id}
            className="grid gap-5 border-b border-slate-100 px-6 py-5 md:grid-cols-[1.2fr_0.7fr_0.6fr_1.5fr]"
          >
            <div>
              <p className="text-base font-extrabold text-[var(--color-ink)]">
                {submission.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {submission.notes || "Không có ghi chú thêm."}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {submission.mime_type} · {formatBytes(submission.size_bytes)}
              </p>
            </div>
            <div className="text-sm text-slate-700">
              <p className="font-bold">
                {submission.submitter_name || "Ẩn danh"}
              </p>
              <p>{submission.submitter_email || "Không để lại email"}</p>
            </div>
            <div className="text-sm font-bold text-slate-700">
              {submission.kind.toUpperCase()}
            </div>
            <ModerationActions submissionId={submission.id} />
          </div>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";

import { requireAdminSession } from "@/lib/auth";
import { PENDING_BUCKET } from "@/lib/constants";
import { getAdminSubmissionsPage } from "@/lib/data/submissions";
import { isServiceSupabaseConfigured } from "@/lib/env";
import { SetupPanel } from "@/components/admin/setup-panel";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { formatBytes } from "@/lib/utils";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  if (!isServiceSupabaseConfigured()) {
    return <SetupPanel />;
  }

  await requireAdminSession();
  const submissions = await getAdminSubmissionsPage(1, 20);
  const signedPreviewMap = new Map<string, string | null>();

  if (submissions.items.length > 0) {
    const supabase = getSupabaseServiceClient();
    const signedResults = await supabase.storage
      .from(PENDING_BUCKET)
      .createSignedUrls(
        submissions.items.map((submission) => submission.storage_path),
        60 * 60
      );

    for (const item of signedResults.data ?? []) {
      if (item.path) {
        signedPreviewMap.set(item.path, item.signedUrl ?? null);
      }
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
            Moderation queue
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[var(--color-ink)]">
            Ảnh chờ duyệt
          </h2>
        </div>
        <div className="border border-slate-100 bg-white/80 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
          {submissions.total} mục đang chờ
        </div>
      </div>

      <div className="overflow-hidden border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(37,48,74,0.08)]">
        <div className="grid gap-0 border-b border-slate-100 bg-slate-50/80 px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 md:grid-cols-[1.9fr_0.5fr_1.1fr]">
          <span>Asset</span>
          <span>Loại</span>
          <span>Thao tác</span>
        </div>
        {submissions.items.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm font-semibold text-slate-500">
            Queue đang trống. Ảnh mới gửi lên sẽ xuất hiện ở đây.
          </div>
        ) : (
          submissions.items.map((submission) => (
            <div
              key={submission.id}
              className="grid gap-5 border-b border-slate-100 px-6 py-5 last:border-b-0 md:grid-cols-[1.9fr_0.5fr_1.1fr]"
            >
              <div className="flex gap-4">
                <div className="relative shrink-0 overflow-hidden border border-slate-100 bg-slate-50">
                  {signedPreviewMap.get(submission.storage_path) ? (
                    <Image
                      src={signedPreviewMap.get(submission.storage_path)!}
                      alt={submission.title}
                      width={
                        submission.kind === "desktop"
                          ? 138
                          : submission.kind === "gif"
                            ? 104
                            : 78
                      }
                      height={
                        submission.kind === "desktop"
                          ? 78
                          : submission.kind === "gif"
                            ? 104
                            : 138
                      }
                      unoptimized
                      className={
                        submission.kind === "desktop"
                          ? "h-[78px] w-[138px] object-cover"
                          : submission.kind === "gif"
                            ? "h-[104px] w-[104px] object-cover"
                            : "h-[138px] w-[78px] object-cover"
                      }
                    />
                  ) : (
                    <div
                      className={
                        submission.kind === "desktop"
                          ? "h-[78px] w-[138px] bg-slate-100"
                          : submission.kind === "gif"
                            ? "h-[104px] w-[104px] bg-slate-100"
                            : "h-[138px] w-[78px] bg-slate-100"
                      }
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-base font-black tracking-[-0.02em] text-[var(--color-ink)]">
                    {submission.title}
                  </p>
                  {submission.notes ? (
                    <p className="text-sm font-semibold leading-6 text-slate-500">
                      {submission.notes}
                    </p>
                  ) : null}
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    {submission.mime_type} · {formatBytes(submission.size_bytes)}
                  </p>
                </div>
              </div>
              <div className="self-start border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                {submission.kind}
              </div>
              <ModerationActions submissionId={submission.id} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

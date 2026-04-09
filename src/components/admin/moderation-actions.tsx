"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ModerationActions({
  submissionId,
  disabled = false,
}: {
  submissionId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState(
    "Chưa phù hợp với chất lượng hoặc chủ đề bộ sưu tập."
  );
  const [error, setError] = useState<string | null>(null);

  async function callAction(action: "approve" | "reject") {
    if (disabled) return;

    setBusy(action);
    setError(null);

    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          action === "reject"
            ? JSON.stringify({ reason: rejectReason })
            : JSON.stringify({}),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Moderation request failed.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Có lỗi xảy ra.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <input
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[var(--color-sky)]"
          placeholder="Lý do từ chối"
          disabled={disabled || busy !== null}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => callAction("reject")}
          disabled={disabled || busy !== null}
          icon={<X className="h-4 w-4" />}
        >
          {busy === "reject" ? "Đang từ chối..." : "Từ chối"}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => callAction("approve")}
          disabled={disabled || busy !== null}
          icon={<Check className="h-4 w-4" />}
        >
          {busy === "approve" ? "Đang duyệt..." : "Duyệt"}
        </Button>
      </div>
      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}

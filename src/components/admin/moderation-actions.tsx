"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleNotch, Trash } from "@phosphor-icons/react";

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
        body: JSON.stringify({}),
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
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => callAction("reject")}
          disabled={disabled || busy !== null}
          icon={
            busy === "reject" ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <Trash className="h-4 w-4" weight="bold" />
            )
          }
        >
          {busy === "reject" ? "Đang xoá..." : "Từ chối"}
        </Button>
        <Button
          type="button"
          variant="blush"
          size="sm"
          onClick={() => callAction("approve")}
          disabled={disabled || busy !== null}
          icon={
            busy === "approve" ? (
              <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
            ) : (
              <Check className="h-4 w-4" weight="bold" />
            )
          }
        >
          {busy === "approve" ? "Đang duyệt..." : "Duyệt"}
        </Button>
      </div>
      {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
    </div>
  );
}

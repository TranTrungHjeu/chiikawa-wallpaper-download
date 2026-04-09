"use client";

import { startTransition, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Sparkle, UploadSimple } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AssetKind } from "@/lib/types";

const options: Array<{ value: AssetKind; label: string }> = [
  { value: "mobile", label: "Mobile" },
  { value: "desktop", label: "Desktop" },
  { value: "gif", label: "GIF" },
];

export function ContributionForm({
  turnstileSiteKey,
  disabled = false,
}: {
  turnstileSiteKey?: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileEnabled = useMemo(() => Boolean(turnstileSiteKey), [turnstileSiteKey]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) return;

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");

    if (!(file instanceof File) || !file.size) {
      setError("Chọn một file ảnh hoặc GIF trước khi gửi.");
      return;
    }

    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        title: String(formData.get("title") ?? ""),
        kind: String(formData.get("kind") ?? "mobile"),
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        submitterName: String(formData.get("submitterName") ?? "") || null,
        submitterEmail: String(formData.get("submitterEmail") ?? "") || null,
        honeypot: String(formData.get("website") ?? ""),
        turnstileToken,
      };

      const uploadResponse = await fetch("/api/submissions/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const uploadPayload = (await uploadResponse.json()) as
        | { error?: string; path?: string; token?: string }
        | null;

      if (!uploadResponse.ok || !uploadPayload?.path || !uploadPayload?.token) {
        throw new Error(uploadPayload?.error || "Không thể tạo đường dẫn upload.");
      }

      const supabase = getSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from("submission-pending")
        .uploadToSignedUrl(uploadPayload.path, uploadPayload.token, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const completeResponse = await fetch("/api/submissions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          notes: String(formData.get("notes") ?? "") || null,
          kind: payload.kind,
          submitterName: payload.submitterName,
          submitterEmail: payload.submitterEmail,
          storagePath: uploadPayload.path,
          mimeType: file.type,
          sizeBytes: file.size,
        }),
      });

      const completePayload = (await completeResponse.json()) as { error?: string } | null;

      if (!completeResponse.ok) {
        throw new Error(completePayload?.error || "Không thể lưu contribution.");
      }

      event.currentTarget.reset();
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      setMessage("Contribution đã được gửi. Admin sẽ duyệt trước khi public.");

      startTransition(() => {
        router.refresh();
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Gửi contribution thất bại.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-none bg-white/85 p-6 shadow-cute backdrop-blur md:p-8"
    >
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
          Community submission
        </p>
        <h2 className="headline-display text-3xl text-[var(--color-ink)]">Gửi ảnh</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">Tên hiển thị</span>
          <input
            name="submitterName"
            className="h-12 w-full rounded-none border border-slate-200 bg-white px-4 outline-none focus:border-[var(--color-sky)]"
            placeholder="Không bắt buộc"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">Email liên hệ</span>
          <input
            name="submitterEmail"
            type="email"
            className="h-12 w-full rounded-none border border-slate-200 bg-white px-4 outline-none focus:border-[var(--color-sky)]"
            placeholder="Không bắt buộc"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-bold text-slate-700">Tiêu đề tài nguyên</span>
        <input
          required
          name="title"
          className="h-12 w-full rounded-none border border-slate-200 bg-white px-4 outline-none focus:border-[var(--color-sky)]"
          placeholder="Ví dụ: Chiikawa picnic bên hồ sen"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">Loại</span>
          <select
            name="kind"
            defaultValue="mobile"
            className="h-12 w-full rounded-none border border-slate-200 bg-white px-4 outline-none focus:border-[var(--color-sky)]"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-700">Tệp ảnh</span>
          <input
            required
            type="file"
            name="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            className="block h-12 w-full rounded-none border border-slate-200 bg-white px-4 py-3 text-sm"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-bold text-slate-700">Ghi chú cho admin</span>
        <textarea
          name="notes"
          rows={4}
          className="w-full rounded-none border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[var(--color-sky)]"
          placeholder="Nguồn ảnh, gợi ý tag, hoặc mô tả thêm về khung hình."
        />
      </label>

      <input tabIndex={-1} autoComplete="off" name="website" className="hidden" />

      {turnstileEnabled ? (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white px-2 py-3">
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey!}
            onSuccess={(token) => setTurnstileToken(token)}
            options={{ theme: "light", size: "flexible" }}
          />
        </div>
      ) : (
        <div className="rounded-none bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Turnstile chưa được cấu hình. Form vẫn hiện để bạn hoàn thiện UI và logic.
        </div>
      )}

      {error ? (
        <div className="rounded-none bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-none bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={pending || disabled}
        icon={
          pending ? (
            <Sparkle className="h-4 w-4" weight="fill" />
          ) : (
            <UploadSimple className="h-4 w-4" weight="bold" />
          )
        }
      >
        {pending ? "Đang gửi..." : "Gửi"}
      </Button>
    </form>
  );
}

"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  CheckCircle,
  CircleNotch,
  UploadSimple,
  WarningCircle,
  X,
} from "@phosphor-icons/react";

import { Button, linkButtonClassName } from "@/components/ui/button";
import {
  MAX_UPLOAD_BYTES,
  SUPPORTED_MIME_TYPES,
} from "@/lib/constants";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AssetKind } from "@/lib/types";
import { cn } from "@/lib/utils";

function normalizeTitle(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const cleaned = baseName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Untitled upload";
  }

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .slice(0, 120);
}

async function inferAssetKind(file: File): Promise<AssetKind> {
  if (file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif")) {
    return "gif";
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const image = new window.Image();

        image.onload = () => {
          resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };
        image.onerror = () => reject(new Error("Không đọc được kích thước ảnh."));
        image.src = objectUrl;
      }
    );

    return dimensions.width >= dimensions.height ? "desktop" : "mobile";
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function submitContribution(input: {
  file: File;
  title: string;
  kind: AssetKind;
  turnstileToken?: string | null;
}) {
  const uploadResponse = await fetch("/api/submissions/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: input.title,
      kind: input.kind,
      fileName: input.file.name,
      fileSize: input.file.size,
      contentType: input.file.type,
      submitterName: null,
      submitterEmail: null,
      honeypot: "",
      turnstileToken: input.turnstileToken ?? null,
    }),
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
    .uploadToSignedUrl(uploadPayload.path, uploadPayload.token, input.file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const completeResponse = await fetch("/api/submissions/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: input.title,
      notes: null,
      kind: input.kind,
      submitterName: null,
      submitterEmail: null,
      storagePath: uploadPayload.path,
      mimeType: input.file.type,
      sizeBytes: input.file.size,
    }),
  });

  const completePayload = (await completeResponse.json()) as
    | { error?: string }
    | null;

  if (!completeResponse.ok) {
    throw new Error(completePayload?.error || "Không thể lưu contribution.");
  }
}

export type QuickContributionButtonProps = {
  className?: string;
  disabled?: boolean;
  turnstileSiteKey?: string;
  variant?: "primary" | "secondary" | "blush" | "ghost";
  size?: "sm" | "md" | "lg";
  label?: string;
  compact?: boolean;
  autoOpenSignal?: number;
};

type FeedbackState = {
  tone: "success" | "error";
  title: string;
  description: string;
};

export function QuickContributionButton({
  className,
  disabled = false,
  turnstileSiteKey,
  variant = "primary",
  size = "md",
  label = "Đóng góp",
  compact = false,
  autoOpenSignal = 0,
}: QuickContributionButtonProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const shouldRefreshAfterCloseRef = useRef(false);
  const lastAutoOpenSignalRef = useRef(0);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const turnstileEnabled = useMemo(() => Boolean(turnstileSiteKey), [turnstileSiteKey]);
  const pendingIcon = (
    <CircleNotch className="h-4 w-4 animate-spin text-[var(--color-sakura)]" weight="bold" />
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (
      autoOpenSignal <= 0 ||
      autoOpenSignal === lastAutoOpenSignalRef.current
    ) {
      return;
    }

    lastAutoOpenSignalRef.current = autoOpenSignal;
    inputRef.current?.click();
  }, [autoOpenSignal]);

  const closeFeedback = useCallback(() => {
    const shouldRefresh = shouldRefreshAfterCloseRef.current;
    shouldRefreshAfterCloseRef.current = false;
    setFeedback(null);

    if (shouldRefresh) {
      startTransition(() => {
        router.refresh();
      });
    }
  }, [router]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeFeedback();
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [closeFeedback, feedback]);

  async function handleFileSelected(file: File | null) {
    if (!file || disabled || pending) {
      return;
    }

    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      shouldRefreshAfterCloseRef.current = false;
      setFeedback({
        tone: "error",
        title: "File chưa phù hợp",
        description: "Chỉ nhận PNG, JPG, WEBP hoặc GIF.",
      });
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      shouldRefreshAfterCloseRef.current = false;
      setFeedback({
        tone: "error",
        title: "File quá lớn",
        description: "File vượt quá giới hạn upload hiện tại.",
      });
      return;
    }

    setPending(true);
    shouldRefreshAfterCloseRef.current = false;
    setFeedback(null);

    try {
      let turnstileToken: string | null = null;

      if (turnstileEnabled) {
        const turnstileInstance = turnstileRef.current;

        if (!turnstileInstance) {
          throw new Error("Turnstile chưa sẵn sàng. Vui lòng thử lại.");
        }

        turnstileInstance.reset();
        turnstileInstance.execute();
        turnstileToken = await turnstileInstance.getResponsePromise(12000, 250);
      }

      const kind = await inferAssetKind(file);
      const title = normalizeTitle(file.name);

      await submitContribution({
        file,
        title,
        kind,
        turnstileToken,
      });

      shouldRefreshAfterCloseRef.current = true;
      setFeedback({
        tone: "success",
        title: "Gửi ảnh thành công",
        description: "Ảnh đã vào hàng chờ duyệt trước khi public.",
      });
    } catch (caughtError) {
      shouldRefreshAfterCloseRef.current = false;
      setFeedback({
        tone: "error",
        title: "Gửi ảnh chưa thành công",
        description:
          caughtError instanceof Error
            ? caughtError.message
            : "Gửi contribution thất bại.",
      });
    } finally {
      setPending(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      turnstileRef.current?.reset();
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          void handleFileSelected(event.target.files?.[0] ?? null);
        }}
      />

      {turnstileEnabled ? (
        <div className="pointer-events-none absolute opacity-0" aria-hidden="true">
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey!}
            options={{
              theme: "light",
              size: "invisible",
              execution: "execute",
              appearance: "execute",
            }}
          />
        </div>
      ) : null}

      {compact ? (
        <button
          type="button"
          disabled={pending || disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            linkButtonClassName({ variant, size }),
            pending && "pointer-events-none opacity-80"
          )}
        >
          {pending ? (
            pendingIcon
          ) : (
            <UploadSimple className="h-4 w-4" weight="bold" />
          )}
          {pending ? "Đang gửi..." : label}
        </button>
      ) : (
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={() => inputRef.current?.click()}
          disabled={pending || disabled}
          icon={
            pending ? (
              pendingIcon
            ) : (
              <UploadSimple className="h-4 w-4" weight="bold" />
            )
          }
        >
          {pending ? "Đang gửi..." : label}
        </Button>
      )}

      {isMounted && feedback
        ? createPortal(
            <div
              className="fixed inset-0 z-[220] flex items-center justify-center bg-[rgba(37,48,74,0.22)] px-5 backdrop-blur-sm"
              onClick={closeFeedback}
              role="presentation"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="contribution-feedback-title"
                className="poster-enter relative w-full max-w-sm overflow-hidden rounded-none border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,249,241,0.98))] p-6 shadow-[0_28px_80px_rgba(216,111,136,0.22)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 h-1.5",
                    feedback.tone === "success"
                      ? "bg-[linear-gradient(90deg,var(--color-sakura),var(--color-mint),var(--color-sky))]"
                      : "bg-[linear-gradient(90deg,#ff7b99,#ffb8c7,#ffd7df)]"
                  )}
                />

                <button
                  type="button"
                  onClick={closeFeedback}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center text-[var(--color-ink)]/56 transition hover:bg-white/70 hover:text-[var(--color-ink)]"
                  aria-label="Đóng thông báo"
                >
                  <X className="h-4 w-4" weight="bold" />
                </button>

                <div className="mt-3 flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center border bg-white/75 shadow-[0_10px_25px_rgba(216,111,136,0.12)]",
                      feedback.tone === "success"
                        ? "border-[rgba(200,243,229,0.95)] text-[var(--color-sakura)]"
                        : "border-[rgba(255,199,158,0.95)] text-[#ff7b99]"
                    )}
                  >
                    {feedback.tone === "success" ? (
                      <CheckCircle className="h-7 w-7" weight="fill" />
                    ) : (
                      <WarningCircle className="h-7 w-7" weight="fill" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-2 pr-8">
                    <h3
                      id="contribution-feedback-title"
                      className="headline-display text-[1.35rem] leading-none text-[var(--color-ink)]"
                    >
                      {feedback.title}
                    </h3>
                    <p className="text-sm font-semibold leading-6 text-[var(--color-ink)]/72">
                      {feedback.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant={feedback.tone === "success" ? "blush" : "secondary"}
                    onClick={closeFeedback}
                  >
                    {feedback.tone === "success" ? "Tiếp tục xem" : "Đóng"}
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

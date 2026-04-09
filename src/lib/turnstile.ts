import { TURNSTILE_VERIFY_URL } from "@/lib/constants";
import { getTurnstileSecretKey, isTurnstileConfigured } from "@/lib/env";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstileToken(
  token?: string | null,
  remoteIp?: string | null
) {
  if (!isTurnstileConfigured()) {
    return { ok: true, skipped: true as const };
  }

  if (!token) {
    return { ok: false, reason: "missing-token" as const };
  }

  const secret = getTurnstileSecretKey();
  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const result = (await response.json()) as TurnstileResponse;

  if (!result.success) {
    return {
      ok: false,
      reason: result["error-codes"]?.join(",") || "turnstile-failed",
    };
  }

  return { ok: true, skipped: false as const };
}

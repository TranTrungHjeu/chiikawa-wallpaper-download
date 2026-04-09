import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { PENDING_BUCKET } from "@/lib/constants";
import { isServiceSupabaseConfigured } from "@/lib/env";
import { createPendingUpload } from "@/lib/data/submissions";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { uploadUrlRequestSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  if (!isServiceSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase service role chưa được cấu hình." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = uploadUrlRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Payload không hợp lệ." },
      { status: 400 }
    );
  }

  if (parsed.data.honeypot) {
    return NextResponse.json({ error: "Spam detected." }, { status: 400 });
  }

  const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const turnstileCheck = await verifyTurnstileToken(parsed.data.turnstileToken, remoteIp);

  if (!turnstileCheck.ok) {
    return NextResponse.json(
      { error: "Turnstile verification thất bại." },
      { status: 400 }
    );
  }

  const fileBase = slugify(parsed.data.fileName.replace(/\.[^.]+$/, ""), {
    lower: true,
    strict: true,
    trim: true,
  });
  const extension = parsed.data.fileName.split(".").pop()?.toLowerCase() || "bin";
  const storagePath = `${new Date().toISOString().slice(0, 10)}/${parsed.data.kind}/${randomUUID()}-${fileBase}.${extension}`;

  try {
    const signedUpload = await createPendingUpload(storagePath);

    return NextResponse.json({
      bucket: PENDING_BUCKET,
      path: signedUpload.path,
      token: signedUpload.token,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Không thể tạo signed upload URL.",
      },
      { status: 500 }
    );
  }
}

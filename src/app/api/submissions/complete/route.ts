import { NextRequest, NextResponse } from "next/server";

import { createSubmission } from "@/lib/data/submissions";
import { isServiceSupabaseConfigured } from "@/lib/env";
import { completeSubmissionSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  if (!isServiceSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase service role chưa được cấu hình." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = completeSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Payload không hợp lệ." },
      { status: 400 }
    );
  }

  try {
    const submission = await createSubmission({
      title: parsed.data.title,
      notes: parsed.data.notes,
      kind: parsed.data.kind,
      submitterName: parsed.data.submitterName,
      submitterEmail: parsed.data.submitterEmail,
      storagePath: parsed.data.storagePath,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
    });

    return NextResponse.json({ submission });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Không thể lưu submission.",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { getSubmissionById } from "@/lib/data/submissions";
import { isServiceSupabaseConfigured } from "@/lib/env";
import { rejectSubmissionSchema } from "@/lib/validation";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isServiceSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase service role chưa được cấu hình." },
      { status: 503 }
    );
  }

  const adminSession = await getAdminSession();
  if (!adminSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = rejectSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Payload không hợp lệ." },
      { status: 400 }
    );
  }

  const { id } = await context.params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    return NextResponse.json({ error: "Submission không tồn tại." }, { status: 404 });
  }

  if (submission.status !== "pending") {
    return NextResponse.json(
      { error: "Submission này không còn ở trạng thái chờ duyệt." },
      { status: 409 }
    );
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase
      .from("submissions")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        review_note: parsed.data.reason,
      })
      .eq("id", submission.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (caughtError) {
    return NextResponse.json(
      {
        error:
          caughtError instanceof Error
            ? caughtError.message
            : "Không thể từ chối submission.",
      },
      { status: 500 }
    );
  }
}

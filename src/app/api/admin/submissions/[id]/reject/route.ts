import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { PENDING_BUCKET } from "@/lib/constants";
import { getSubmissionById } from "@/lib/data/submissions";
import { isServiceSupabaseConfigured } from "@/lib/env";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(
  _request: Request,
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
    const { error: deleteSubmissionError } = await supabase
      .from("submissions")
      .delete()
      .eq("id", submission.id);

    if (deleteSubmissionError) {
      throw deleteSubmissionError;
    }

    const { error: removePendingError } = await supabase.storage
      .from(PENDING_BUCKET)
      .remove([submission.storage_path]);

    if (removePendingError) {
      console.error("Could not remove rejected pending file", removePendingError);
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

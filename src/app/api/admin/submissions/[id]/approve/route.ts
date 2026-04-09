import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { extname } from "node:path";

import { getAdminSession } from "@/lib/auth";
import { PENDING_BUCKET, PUBLIC_ASSETS_BUCKET } from "@/lib/constants";
import { getSubmissionById } from "@/lib/data/submissions";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import {
  buildCommunityAssetStoragePath,
  uploadBufferToSupabaseStorage,
} from "@/lib/supabase/storage";
import { createAssetSlug } from "@/lib/utils";
import { isServiceSupabaseConfigured } from "@/lib/env";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isServiceSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Cần cấu hình Supabase service role." },
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
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(PENDING_BUCKET)
      .download(submission.storage_path);

    if (downloadError || !fileData) {
      throw downloadError ?? new Error("Không thể tải file từ bucket pending.");
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const extension =
      extname(submission.storage_path).replace(".", "") ||
      submission.mime_type.split("/")[1] ||
      "bin";
    const storagePath = buildCommunityAssetStoragePath({
      kind: submission.kind,
      submissionId: submission.id,
      title: submission.title,
      extension,
    });
    const uploadResult = await uploadBufferToSupabaseStorage({
      buffer,
      bucket: PUBLIC_ASSETS_BUCKET,
      storagePath,
      contentType: submission.mime_type,
    });

    const assetPayload = {
      source_id: null,
      title: submission.title,
      slug: createAssetSlug(submission.title, submission.id),
      description: submission.notes ?? null,
      kind: submission.kind,
      width: null,
      height: null,
      format: extension,
      bytes: submission.size_bytes,
      cloudinary_public_id: null,
      cloudinary_resource_type: null,
      storage_bucket: uploadResult.bucket,
      storage_path: uploadResult.storagePath,
      secure_url: uploadResult.publicUrl,
      original_url: null,
      status: "published",
      featured: false,
    };

    const { data: asset, error: insertError } = await supabase
      .from("assets")
      .insert(assetPayload)
      .select("*")
      .single();

    if (insertError || !asset) {
      throw insertError ?? new Error("Không thể tạo asset public.");
    }

    const insertedAsset = asset as { id: string };

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        status: "approved",
        approved_asset_id: insertedAsset.id,
        reviewed_at: new Date().toISOString(),
        review_note: null,
      })
      .eq("id", submission.id);

    if (updateError) {
      throw updateError;
    }

    revalidateTag("assets", "max");
    revalidateTag(`assets:${submission.kind}`, "max");

    return NextResponse.json({ asset });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Duyệt submission thất bại.",
      },
      { status: 500 }
    );
  }
}

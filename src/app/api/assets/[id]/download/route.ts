import { NextResponse } from "next/server";

import { getAssetById } from "@/lib/data/assets";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

function buildFilename(slug: string, format?: string | null) {
  return `${slug}.${format || "bin"}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const asset = await getAssetById(id);

  if (!asset) {
    return NextResponse.json({ error: "Asset không tồn tại." }, { status: 404 });
  }

  if (asset.storage_bucket && asset.storage_path) {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase.storage
      .from(asset.storage_bucket)
      .download(asset.storage_path);

    if (error || !data) {
      return NextResponse.json(
        { error: "Không thể tải file từ Supabase Storage." },
        { status: 502 }
      );
    }

    return new NextResponse(data.stream(), {
      headers: {
        "Content-Type":
          data.type || (asset.format ? `image/${asset.format}` : "application/octet-stream"),
        "Content-Disposition": `attachment; filename="${buildFilename(
          asset.slug,
          asset.format
        )}"`,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  }

  const sourceUrl = asset.secure_url ?? asset.original_url;

  if (!sourceUrl) {
    return NextResponse.json(
      { error: "Asset này chưa có file tải xuống." },
      { status: 404 }
    );
  }

  const upstream = await fetch(sourceUrl);

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Không thể tải file gốc từ nguồn lưu trữ." },
      { status: 502 }
    );
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ||
        (asset.format ? `image/${asset.format}` : "application/octet-stream"),
      "Content-Disposition": `attachment; filename="${buildFilename(
        asset.slug,
        asset.format
      )}"`,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

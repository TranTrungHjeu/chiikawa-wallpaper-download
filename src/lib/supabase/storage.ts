import { readFile } from "node:fs/promises";

import { PUBLIC_ASSETS_BUCKET } from "@/lib/constants";
import { getPublicSupabaseEnv, isPublicSupabaseConfigured } from "@/lib/env";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { AssetKind } from "@/lib/types";
import { createAssetSlug } from "@/lib/utils";

function normalizeExtension(extension: string) {
  const cleaned = extension.trim().replace(/^\./, "").toLowerCase();
  return cleaned || "bin";
}

export function getMimeTypeFromExtension(extension: string) {
  switch (normalizeExtension(extension)) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export function buildImportedAssetStoragePath({
  kind,
  sourceId,
  title,
  extension,
}: {
  kind: AssetKind;
  sourceId: string;
  title: string;
  extension: string;
}) {
  return `chiikawa/${kind}/${createAssetSlug(title, sourceId)}.${normalizeExtension(
    extension
  )}`;
}

export function buildCommunityAssetStoragePath({
  kind,
  submissionId,
  title,
  extension,
}: {
  kind: AssetKind;
  submissionId: string;
  title: string;
  extension: string;
}) {
  return `community/${kind}/${createAssetSlug(title, submissionId)}.${normalizeExtension(
    extension
  )}`;
}

export function buildSupabaseStoragePublicUrl(bucket: string, storagePath: string) {
  if (!isPublicSupabaseConfigured()) return null;

  const { url } = getPublicSupabaseEnv();
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
}

export async function uploadBufferToSupabaseStorage({
  bucket = PUBLIC_ASSETS_BUCKET,
  buffer,
  storagePath,
  contentType,
  cacheControl = "31536000",
}: {
  bucket?: string;
  buffer: Buffer;
  storagePath: string;
  contentType?: string;
  cacheControl?: string;
}) {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    cacheControl,
    upsert: true,
  });

  if (error) {
    throw error;
  }

  return {
    bucket,
    storagePath,
    publicUrl:
      bucket === PUBLIC_ASSETS_BUCKET
        ? buildSupabaseStoragePublicUrl(bucket, storagePath)
        : null,
  };
}

export async function uploadFileToSupabaseStorage({
  bucket = PUBLIC_ASSETS_BUCKET,
  filePath,
  storagePath,
  contentType,
  cacheControl = "31536000",
}: {
  bucket?: string;
  filePath: string;
  storagePath: string;
  contentType?: string;
  cacheControl?: string;
}) {
  const buffer = await readFile(filePath);

  return uploadBufferToSupabaseStorage({
    bucket,
    buffer,
    storagePath,
    contentType,
    cacheControl,
  });
}

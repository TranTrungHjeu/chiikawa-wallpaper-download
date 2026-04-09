import { mkdir, stat, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

import { dedupeParsedAssets, parseAssetCards } from "@/lib/chiikawa/parser";
import { PUBLIC_ASSETS_BUCKET } from "@/lib/constants";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import {
  buildImportedAssetStoragePath,
  getMimeTypeFromExtension,
  uploadFileToSupabaseStorage,
} from "@/lib/supabase/storage";
import { createAssetSlug } from "@/lib/utils";
import type { AssetKind, ChiikawaParsedAsset } from "@/lib/types";
import { isServiceSupabaseConfigured } from "@/lib/env";

const CANONICAL_SOURCES: Array<{
  kind: AssetKind;
  pages: number;
  url: (page: number) => string;
}> = [
  {
    kind: "mobile",
    pages: 10,
    url: (page) => `https://chiikawa-wallpaper.com/mobile?sort=latest&page=${page}`,
  },
  {
    kind: "desktop",
    pages: 3,
    url: (page) => `https://chiikawa-wallpaper.com/desktop?sort=latest&page=${page}`,
  },
  {
    kind: "gif",
    pages: 11,
    url: (page) => `https://chiikawa-wallpaper.com/gif?page=${page}`,
  },
];

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ChiikawaImporter/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function crawlCatalog(limit?: number) {
  const allAssets: ChiikawaParsedAsset[] = [];

  for (const source of CANONICAL_SOURCES) {
    for (let page = 1; page <= source.pages; page += 1) {
      const html = await fetchHtml(source.url(page));
      allAssets.push(...parseAssetCards(html, source.kind));
    }
  }

  const deduped = dedupeParsedAssets(allAssets);
  return typeof limit === "number" ? deduped.slice(0, limit) : deduped;
}

async function ensureLocalCopy(asset: ChiikawaParsedAsset) {
  const cacheDir = join(process.cwd(), ".cache", "imports", "chiikawa", asset.kind);
  await mkdir(cacheDir, { recursive: true });

  const extension = extname(new URL(asset.originalUrl).pathname) || ".bin";
  const filePath = join(cacheDir, `${asset.sourceId}${extension}`);

  try {
    await stat(filePath);
    return filePath;
  } catch {
    const response = await fetch(asset.originalUrl);
    if (!response.ok) {
      throw new Error(`Failed to download original asset ${asset.originalUrl}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(filePath, buffer);
    return filePath;
  }
}

function getCliLimit() {
  const raw = process.argv.find((arg) => arg.startsWith("--limit="));
  if (!raw) return undefined;

  const value = Number.parseInt(raw.split("=")[1] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

async function main() {
  if (!isServiceSupabaseConfigured()) {
    throw new Error("Importer cần Supabase service role trong .env.");
  }

  const limit = getCliLimit();
  const assets = await crawlCatalog(limit);
  const supabase = getSupabaseServiceClient();
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Discovered ${assets.length} unique assets.`);

  for (const asset of assets) {
    try {
      const { data: existing, error: existingError } = await supabase
        .from("assets")
        .select("id, source_id, storage_bucket, storage_path")
        .eq("kind", asset.kind)
        .eq("source_id", asset.sourceId)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      const existingId = typeof existing?.id === "string" ? existing.id : null;
      const existingStorageBucket =
        typeof existing?.storage_bucket === "string" ? existing.storage_bucket : null;
      const existingStoragePath =
        typeof existing?.storage_path === "string" ? existing.storage_path : null;

      if (existingStorageBucket && existingStoragePath) {
        skipped += 1;
        console.log(`Skipping existing asset ${asset.kind}/${asset.sourceId}`);
        continue;
      }

      const localFile = await ensureLocalCopy(asset);
      const fileStats = await stat(localFile);
      const extension = extname(localFile).replace(".", "") || "bin";
      const storagePath = buildImportedAssetStoragePath({
        kind: asset.kind,
        sourceId: asset.sourceId,
        title: asset.title,
        extension,
      });
      const upload = await uploadFileToSupabaseStorage({
        bucket: PUBLIC_ASSETS_BUCKET,
        filePath: localFile,
        storagePath,
        contentType: getMimeTypeFromExtension(extension),
      });

      const upsertPayload = {
        source_id: asset.sourceId,
        title: asset.title,
        slug: createAssetSlug(asset.title, asset.sourceId),
        description: `Imported from chiikawa-wallpaper.com (${asset.kind}).`,
        kind: asset.kind,
        width: null,
        height: null,
        format: extension,
        bytes: fileStats.size,
        cloudinary_public_id: null,
        cloudinary_resource_type: null,
        storage_bucket: upload.bucket,
        storage_path: upload.storagePath,
        secure_url: upload.publicUrl,
        original_url: asset.originalUrl,
        status: "published",
        featured: asset.featured,
      };

      const error = existingId
        ? (
            await supabase
              .from("assets")
              .update(upsertPayload)
              .eq("id", existingId)
          ).error
        : (await supabase.from("assets").insert(upsertPayload)).error;

      if (error) {
        throw error;
      }

      imported += 1;
      console.log(
        `${existingId ? "Migrated" : "Imported"} ${asset.kind}/${asset.sourceId}`
      );
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed ${asset.kind}/${asset.sourceId}: ${message}`);
    }
  }

  console.log(`Done. Imported: ${imported}. Skipped: ${skipped}. Failed: ${failed}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

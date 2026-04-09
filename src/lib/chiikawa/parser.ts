import { load } from "cheerio";

import type { AssetKind, ChiikawaParsedAsset } from "@/lib/types";

function parseEmbeddedWallpaperPayload(rawValue: string | undefined) {
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as {
      title?: string;
      file_name?: string;
    };
  } catch {
    return null;
  }
}

export function parseAssetCards(html: string, kind: AssetKind): ChiikawaParsedAsset[] {
  const $ = load(html);
  const items: ChiikawaParsedAsset[] = [];

  $(".wallpaper-item").each((_, element) => {
    const root = $(element);
    const sourceId = root.attr("data-id")?.trim();
    const image = root.find("img").first();
    const downloadUrl =
      root.find(".download-btn").attr("data-file-name")?.trim() ||
      root.find(".download-gif-btn").attr("data-file-name")?.trim();
    const embeddedPayload = parseEmbeddedWallpaperPayload(
      root.find("[data-wallpaper]").first().attr("data-wallpaper")?.trim()
    );
    const previewUrl =
      image.attr("src")?.trim() ||
      image.attr("data-src")?.trim() ||
      image.attr("data-original")?.trim();
    const title =
      image.attr("alt")?.trim() ||
      root.find("h3").first().text().trim() ||
      embeddedPayload?.title?.trim() ||
      `Chiikawa ${kind.toUpperCase()} ${sourceId}`;

    const srcSet = (image.attr("srcset") || "")
      .split(",")
      .map((part) => part.trim().split(" ")[0])
      .filter(Boolean);
    const originalUrl =
      downloadUrl || embeddedPayload?.file_name?.trim() || srcSet.at(-1) || previewUrl;

    if (!sourceId || !originalUrl || !previewUrl || !title) {
      return;
    }

    const featured = /featured/i.test(root.text());
    const resolutionTag =
      root
        .find("span")
        .toArray()
        .map((node) => $(node).text().trim())
        .find((text) => /4k|hd/i.test(text)) ?? null;

    items.push({
      sourceId,
      title,
      originalUrl,
      previewUrl,
      srcSet,
      kind,
      featured,
      resolutionTag,
    });
  });

  return items;
}

export function extractLastPageNumber(html: string, kind: AssetKind) {
  const pattern =
    kind === "gif"
      ? /\/gif\?page=(\d+)/g
      : new RegExp(`\\/${kind}\\?sort=latest&amp;page=(\\d+)`, "g");

  const matches = Array.from(html.matchAll(pattern))
    .map((match) => Number.parseInt(match[1] || "1", 10))
    .filter(Number.isFinite);

  return matches.length ? Math.max(...matches) : 1;
}

export function dedupeParsedAssets(assets: ChiikawaParsedAsset[]) {
  const seen = new Map<string, ChiikawaParsedAsset>();

  for (const asset of assets) {
    const key = `${asset.kind}:${asset.sourceId}:${asset.originalUrl}`;
    if (!seen.has(key)) {
      seen.set(key, asset);
    }
  }

  return [...seen.values()];
}

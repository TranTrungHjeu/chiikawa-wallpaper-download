import slugify from "slugify";

import { ASSET_KIND_LABELS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { AssetKind, AssetRecord, PagedResult } from "@/lib/types";

export { cn };

export function createAssetSlug(title: string, sourceId?: string | null) {
  const base = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  return sourceId ? `${base}-${sourceId}` : base;
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "N/A";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDimensions(asset: Pick<AssetRecord, "width" | "height">) {
  if (!asset.width || !asset.height) return "Kích thước gốc";
  return `${asset.width} × ${asset.height}`;
}

export function clampPage(page: number, pageCount: number) {
  if (pageCount <= 0) return 1;
  return Math.min(Math.max(page, 1), pageCount);
}

export function paginateArray<T>(
  items: T[],
  page: number,
  pageSize: number
): PagedResult<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = clampPage(page, pageCount);
  const offset = (safePage - 1) * pageSize;

  return {
    items: items.slice(offset, offset + pageSize),
    total,
    page: safePage,
    pageSize,
    pageCount,
  };
}

export function getKindLabel(kind: AssetKind) {
  return ASSET_KIND_LABELS[kind];
}

export function getAssetDownloadRoute(id: string) {
  return `/api/assets/${id}/download`;
}

export function parsePositiveInt(
  value: string | string[] | undefined,
  fallback = 1
) {
  if (Array.isArray(value)) return parsePositiveInt(value[0], fallback);

  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function ensureArray<T>(value: T | T[] | undefined | null) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

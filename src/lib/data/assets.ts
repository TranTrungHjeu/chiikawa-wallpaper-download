import { unstable_cache } from "next/cache";

import {
  ADMIN_PAGE_SIZE,
  CACHE_REVALIDATE_SECONDS,
  GALLERY_PAGE_SIZE,
} from "@/lib/constants";
import { isServiceSupabaseConfigured } from "@/lib/env";
import { mockAssets, mockStats } from "@/lib/mock/assets";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { AssetKind, AssetRecord, GalleryStats, PagedResult } from "@/lib/types";
import { paginateArray } from "@/lib/utils";

const LIST_ASSET_COLUMNS = [
  "id",
  "source_id",
  "title",
  "slug",
  "description",
  "kind",
  "width",
  "height",
  "format",
  "bytes",
  "cloudinary_public_id",
  "cloudinary_resource_type",
  "storage_bucket",
  "storage_path",
  "secure_url",
  "original_url",
  "status",
  "featured",
  "created_at",
  "updated_at",
].join(",");

function normalizeAsset(asset: Partial<AssetRecord>): AssetRecord {
  return {
    id: String(asset.id ?? ""),
    source_id: asset.source_id ?? null,
    title: asset.title ?? "",
    slug: asset.slug ?? "",
    description: asset.description ?? null,
    kind: (asset.kind as AssetKind) ?? "mobile",
    width: asset.width ?? null,
    height: asset.height ?? null,
    format: asset.format ?? null,
    bytes: asset.bytes ?? null,
    cloudinary_public_id: asset.cloudinary_public_id ?? null,
    cloudinary_resource_type: asset.cloudinary_resource_type ?? null,
    storage_bucket: asset.storage_bucket ?? null,
    storage_path: asset.storage_path ?? null,
    secure_url: asset.secure_url ?? null,
    original_url: asset.original_url ?? null,
    status: asset.status ?? "published",
    featured: Boolean(asset.featured),
    created_at: asset.created_at ?? new Date().toISOString(),
    updated_at: asset.updated_at ?? new Date().toISOString(),
  };
}

async function queryAssets(
  kind?: AssetKind,
  page = 1,
  pageSize = GALLERY_PAGE_SIZE
) {
  if (!isServiceSupabaseConfigured()) {
    const filtered = mockAssets
      .filter((asset) => (kind ? asset.kind === kind : true))
      .filter((asset) => asset.status === "published")
      .sort((a, b) => Number(b.featured) - Number(a.featured));

    return paginateArray(filtered, page, pageSize);
  }

  const supabase = getSupabaseServiceClient();
  let query = supabase
    .from("assets")
    .select(LIST_ASSET_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (kind) {
    query = query.eq("kind", kind);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return {
    items: ((data ?? []) as Partial<AssetRecord>[]).map((item) => normalizeAsset(item)),
    total: count ?? 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  } satisfies PagedResult<AssetRecord>;
}

export async function getAssetsPage(
  kind?: AssetKind,
  page = 1,
  pageSize = GALLERY_PAGE_SIZE
) {
  return unstable_cache(
    async () => queryAssets(kind, page, pageSize),
    ["assets-page", kind ?? "all", String(page), String(pageSize)],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ["assets", kind ? `assets:${kind}` : "assets:all"],
    }
  )();
}

export async function getFeaturedAssets(limit = 6) {
  return unstable_cache(
    async () => {
      const page = await queryAssets(undefined, 1, 48);
      return page.items.slice(0, limit);
    },
    ["featured-assets", String(limit)],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ["assets", "assets:featured"],
    }
  )();
}

export async function getAssetsStats(): Promise<GalleryStats> {
  return unstable_cache(
    async () => {
      if (!isServiceSupabaseConfigured()) {
        return mockStats;
      }

      const supabase = getSupabaseServiceClient();
      const [mobileCount, desktopCount, gifCount] = await Promise.all(
        (["mobile", "desktop", "gif"] as const).map(async (kind) => {
          const { count, error } = await supabase
            .from("assets")
            .select("id", { count: "exact", head: true })
            .eq("status", "published")
            .eq("kind", kind);

          if (error) {
            throw error;
          }

          return count ?? 0;
        })
      );

      return {
        totalAssets: mobileCount + desktopCount + gifCount,
        totalMobile: mobileCount,
        totalDesktop: desktopCount,
        totalGif: gifCount,
      };
    },
    ["assets-stats"],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ["assets"],
    }
  )();
}

export async function getGalleryPageCount(
  kind: AssetKind,
  pageSize = GALLERY_PAGE_SIZE
) {
  return unstable_cache(
    async () => {
      if (!isServiceSupabaseConfigured()) {
        const total = mockAssets.filter(
          (asset) => asset.kind === kind && asset.status === "published"
        ).length;

        return Math.max(1, Math.ceil(total / pageSize));
      }

      const supabase = getSupabaseServiceClient();
      const { count, error } = await supabase
        .from("assets")
        .select("id", { count: "exact", head: true })
        .eq("status", "published")
        .eq("kind", kind);

      if (error) {
        throw error;
      }

      return Math.max(1, Math.ceil((count ?? 0) / pageSize));
    },
    ["gallery-page-count", kind, String(pageSize)],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ["assets", `assets:${kind}`],
    }
  )();
}

export async function getAssetBySlug(slug: string) {
  return unstable_cache(
    async () => {
      if (!isServiceSupabaseConfigured()) {
        return mockAssets.find((asset) => asset.slug === slug) ?? null;
      }

      const supabase = getSupabaseServiceClient();
      const { data, error } = await supabase
        .from("assets")
        .select(LIST_ASSET_COLUMNS)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? normalizeAsset(data as Partial<AssetRecord>) : null;
    },
    ["asset-by-slug", slug],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: ["assets", `asset:${slug}`],
    }
  )();
}

export async function getAssetById(id: string) {
  if (!isServiceSupabaseConfigured()) {
    return mockAssets.find((asset) => asset.id === id) ?? null;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("assets")
    .select(LIST_ASSET_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeAsset(data as Partial<AssetRecord>) : null;
}

export async function getRelatedAssets(asset: AssetRecord, limit = 3) {
  const page = await getAssetsPage(asset.kind, 1, 12);
  return page.items
    .filter((item) => item.slug !== asset.slug)
    .slice(0, limit);
}

export async function getAdminAssetsPage(
  page = 1,
  pageSize = ADMIN_PAGE_SIZE,
  kind?: AssetKind
) {
  if (!isServiceSupabaseConfigured()) {
    const filtered = kind
      ? mockAssets.filter((asset) => asset.kind === kind)
      : mockAssets;

    return paginateArray(filtered, page, pageSize);
  }

  const supabase = getSupabaseServiceClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("assets")
    .select(LIST_ASSET_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (kind) {
    query = query.eq("kind", kind);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return {
    items: ((data ?? []) as Partial<AssetRecord>[]).map((item) => normalizeAsset(item)),
    total: count ?? 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  } satisfies PagedResult<AssetRecord>;
}

export async function getAssetsForSitemap(limit = 1000) {
  if (!isServiceSupabaseConfigured()) {
    return mockAssets.slice(0, limit);
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("assets")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    slug: String(item.slug),
    updated_at: String(item.updated_at),
  }));
}

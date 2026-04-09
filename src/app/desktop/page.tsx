import type { Metadata } from "next";

import { CategoryPage } from "@/components/site/category-page";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";
import { getAssetsPage } from "@/lib/data/assets";
import { parsePositiveInt } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Desktop Wallpapers",
  description: "Bộ hình nền ngang Chiikawa cho desktop và laptop với preview tối ưu tốc độ.",
};

export default async function DesktopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = parsePositiveInt(query.page, 1);
  const pageResult = await getAssetsPage("desktop", page, GALLERY_PAGE_SIZE);
  const prefetchTargets = await Promise.all([
    pageResult.page > 1
      ? getAssetsPage("desktop", pageResult.page - 1, GALLERY_PAGE_SIZE).then(
          (result) => ({
            href: `/desktop?page=${result.page}`,
            assets: result.items,
          })
        )
      : null,
    pageResult.page < pageResult.pageCount
      ? getAssetsPage("desktop", pageResult.page + 1, GALLERY_PAGE_SIZE).then(
          (result) => ({
            href: `/desktop?page=${result.page}`,
            assets: result.items,
          })
        )
      : null,
  ]);

  return (
    <CategoryPage
      currentPath="/desktop"
      title="Desktop"
      description=""
      pageResult={pageResult}
      gridPreset="desktop-two-up"
      headerMode="pagination-only"
      prefetchTargets={prefetchTargets.filter((target) => target !== null)}
    />
  );
}

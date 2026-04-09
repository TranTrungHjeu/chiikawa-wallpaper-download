import type { Metadata } from "next";

import { CategoryPage } from "@/components/site/category-page";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";
import { getAssetsPage } from "@/lib/data/assets";
import { parsePositiveInt } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mobile Wallpapers",
  description: "Bộ hình nền dọc Chiikawa cho điện thoại, ưu tiên ảnh rõ nét và tải nhanh.",
};

export default async function MobilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = parsePositiveInt(query.page, 1);
  const pageResult = await getAssetsPage("mobile", page, GALLERY_PAGE_SIZE);
  const prefetchTargets = await Promise.all([
    pageResult.page > 1
      ? getAssetsPage("mobile", pageResult.page - 1, GALLERY_PAGE_SIZE).then(
          (result) => ({
            href: `/mobile?page=${result.page}`,
            assets: result.items,
          })
        )
      : null,
    pageResult.page < pageResult.pageCount
      ? getAssetsPage("mobile", pageResult.page + 1, GALLERY_PAGE_SIZE).then(
          (result) => ({
            href: `/mobile?page=${result.page}`,
            assets: result.items,
          })
        )
      : null,
  ]);

  return (
    <CategoryPage
      currentPath="/mobile"
      title="Mobile"
      description=""
      pageResult={pageResult}
      headerMode="pagination-only"
      prefetchTargets={prefetchTargets.filter((target) => target !== null)}
    />
  );
}

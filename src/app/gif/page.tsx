import type { Metadata } from "next";

import { CategoryPage } from "@/components/site/category-page";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";
import { getAssetsPage } from "@/lib/data/assets";
import { parsePositiveInt } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Chiikawa GIF",
  description: "Bộ GIF Chiikawa dễ thương để lưu, chia sẻ và dùng trong reaction pack cá nhân.",
};

export default async function GifPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = parsePositiveInt(query.page, 1);
  const pageResult = await getAssetsPage("gif", page, GALLERY_PAGE_SIZE);
  const prefetchTargets = await Promise.all([
    pageResult.page > 1
      ? getAssetsPage("gif", pageResult.page - 1, GALLERY_PAGE_SIZE).then(
          (result) => ({
            href: `/gif?page=${result.page}`,
            assets: result.items,
          })
        )
      : null,
    pageResult.page < pageResult.pageCount
      ? getAssetsPage("gif", pageResult.page + 1, GALLERY_PAGE_SIZE).then(
          (result) => ({
            href: `/gif?page=${result.page}`,
            assets: result.items,
          })
        )
      : null,
  ]);

  return (
    <CategoryPage
      currentPath="/gif"
      title="GIF"
      description=""
      pageResult={pageResult}
      headerMode="pagination-only"
      prefetchTargets={prefetchTargets.filter((target) => target !== null)}
    />
  );
}

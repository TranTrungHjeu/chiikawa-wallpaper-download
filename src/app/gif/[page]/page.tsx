import { notFound, redirect } from "next/navigation";

import { CategoryPage } from "@/components/site/category-page";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";
import { getGalleryPageCount } from "@/lib/data/assets";
import { getGalleryPageView, getGalleryStaticParams } from "@/lib/gallery";
import { buildGalleryPageHref, parsePositiveInt } from "@/lib/utils";

export async function generateStaticParams() {
  return getGalleryStaticParams("gif");
}

export default async function GifPagedRoute({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageParam } = await params;
  const page = parsePositiveInt(pageParam, 1);

  if (page <= 1) {
    redirect("/gif");
  }

  const pageCount = await getGalleryPageCount("gif", GALLERY_PAGE_SIZE);
  if (page > pageCount) {
    notFound();
  }

  const { basePath, pageResult, prefetchTargets } = await getGalleryPageView(
    "gif",
    page
  );

  if (pageResult.page !== page) {
    redirect(buildGalleryPageHref(basePath, pageResult.page));
  }

  return (
    <CategoryPage
      currentPath={basePath}
      title="GIF"
      description=""
      pageResult={pageResult}
      headerMode="pagination-only"
      prefetchTargets={prefetchTargets}
    />
  );
}

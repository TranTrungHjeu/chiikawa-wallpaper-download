import { notFound, redirect } from "next/navigation";

import { CategoryPage } from "@/components/site/category-page";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";
import { getGalleryPageCount } from "@/lib/data/assets";
import { getGalleryPageView, getGalleryStaticParams } from "@/lib/gallery";
import { buildGalleryPageHref, parsePositiveInt } from "@/lib/utils";

export async function generateStaticParams() {
  return getGalleryStaticParams("desktop");
}

export default async function DesktopPagedRoute({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageParam } = await params;
  const page = parsePositiveInt(pageParam, 1);

  if (page <= 1) {
    redirect("/desktop");
  }

  const pageCount = await getGalleryPageCount("desktop", GALLERY_PAGE_SIZE);
  if (page > pageCount) {
    notFound();
  }

  const { basePath, gridPreset, pageResult, prefetchTargets } =
    await getGalleryPageView("desktop", page);

  if (pageResult.page !== page) {
    redirect(buildGalleryPageHref(basePath, pageResult.page));
  }

  return (
    <CategoryPage
      currentPath={basePath}
      title="Desktop"
      description=""
      pageResult={pageResult}
      gridPreset={gridPreset}
      headerMode="pagination-only"
      prefetchTargets={prefetchTargets}
    />
  );
}

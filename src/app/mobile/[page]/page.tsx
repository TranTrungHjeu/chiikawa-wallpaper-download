import { notFound, redirect } from "next/navigation";

import { CategoryPage } from "@/components/site/category-page";
import { getGalleryPageCount } from "@/lib/data/assets";
import { buildGalleryPageHref, parsePositiveInt } from "@/lib/utils";
import { getGalleryPageView, getGalleryStaticParams } from "@/lib/gallery";
import { GALLERY_PAGE_SIZE } from "@/lib/constants";

export async function generateStaticParams() {
  return getGalleryStaticParams("mobile");
}

export default async function MobilePagedRoute({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page: pageParam } = await params;
  const page = parsePositiveInt(pageParam, 1);

  if (page <= 1) {
    redirect("/mobile");
  }

  const pageCount = await getGalleryPageCount("mobile", GALLERY_PAGE_SIZE);
  if (page > pageCount) {
    notFound();
  }

  const { basePath, pageResult, prefetchTargets } = await getGalleryPageView(
    "mobile",
    page
  );

  if (pageResult.page !== page) {
    redirect(buildGalleryPageHref(basePath, pageResult.page));
  }

  return (
    <CategoryPage
      currentPath={basePath}
      title="Mobile"
      description=""
      pageResult={pageResult}
      headerMode="pagination-only"
      prefetchTargets={prefetchTargets}
    />
  );
}

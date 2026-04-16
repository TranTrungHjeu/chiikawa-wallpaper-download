import type { Metadata } from "next";

import { CategoryPage } from "@/components/site/category-page";
import { GALLERY_METADATA, getGalleryPageView } from "@/lib/gallery";

export const metadata: Metadata = {
  title: GALLERY_METADATA.mobile.title,
  description: GALLERY_METADATA.mobile.description,
};

export default async function MobilePage() {
  const { basePath, pageResult, prefetchTargets } = await getGalleryPageView(
    "mobile",
    1
  );

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

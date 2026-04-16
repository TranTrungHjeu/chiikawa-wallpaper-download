import type { Metadata } from "next";

import { CategoryPage } from "@/components/site/category-page";
import { GALLERY_METADATA, getGalleryPageView } from "@/lib/gallery";

export const metadata: Metadata = {
  title: GALLERY_METADATA.desktop.title,
  description: GALLERY_METADATA.desktop.description,
};

export default async function DesktopPage() {
  const { basePath, gridPreset, pageResult, prefetchTargets } =
    await getGalleryPageView("desktop", 1);

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

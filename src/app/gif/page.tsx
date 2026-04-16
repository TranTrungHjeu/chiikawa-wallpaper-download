import type { Metadata } from "next";

import { CategoryPage } from "@/components/site/category-page";
import { GALLERY_METADATA, getGalleryPageView } from "@/lib/gallery";

export const metadata: Metadata = {
  title: GALLERY_METADATA.gif.title,
  description: GALLERY_METADATA.gif.description,
};

export default async function GifPage() {
  const { basePath, pageResult, prefetchTargets } = await getGalleryPageView(
    "gif",
    1
  );

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

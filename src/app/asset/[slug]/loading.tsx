import { AssetDetailLoadingSkeleton } from "@/components/site/asset-detail-loading-skeleton";

export default function Loading() {
  return (
    <section className="px-4 pb-10 pt-4 md:px-8">
      <AssetDetailLoadingSkeleton />
    </section>
  );
}

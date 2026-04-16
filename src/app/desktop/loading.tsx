import { GalleryLoadingSkeleton } from "@/components/site/gallery-loading-skeleton";

export default function Loading() {
  return (
    <section className="px-3 pb-4 pt-2 md:px-8 md:pb-5 md:pt-4">
      <GalleryLoadingSkeleton gridPreset="desktop-two-up" itemCount={6} />
    </section>
  );
}

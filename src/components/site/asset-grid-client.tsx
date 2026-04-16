"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { AssetCard } from "@/components/site/asset-card";
import type { AssetRecord } from "@/lib/types";

const AssetPreviewModal = dynamic(
  () =>
    import("@/components/site/asset-preview-modal").then(
      (module) => module.AssetPreviewModal
    ),
  { ssr: false }
);

type AssetGridClientProps = {
  assets: AssetRecord[];
  gridClassName: string;
  imageSizes: string;
};

export function AssetGridClient({
  assets,
  gridClassName,
  imageSizes,
}: AssetGridClientProps) {
  const [previewAsset, setPreviewAsset] = useState<AssetRecord | null>(null);

  return (
    <>
      <div className={gridClassName}>
        {assets.map((asset, index) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            index={index}
            imageSizes={imageSizes}
            onPreview={setPreviewAsset}
          />
        ))}
      </div>

      <AssetPreviewModal
        asset={previewAsset}
        onClose={() => setPreviewAsset(null)}
      />
    </>
  );
}

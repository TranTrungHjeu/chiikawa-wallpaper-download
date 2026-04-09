import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";

import { v2 as cloudinary } from "cloudinary";

import { getCloudinaryEnv, isCloudinaryConfigured } from "@/lib/env";
import type { AssetKind, CloudinaryResourceType } from "@/lib/types";

let configured = false;

function ensureCloudinary() {
  if (!configured) {
    const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export function buildDeterministicPublicId(
  kind: AssetKind,
  sourceId: string,
  title: string
) {
  const digest = createHash("sha1")
    .update(`${kind}:${sourceId}:${title}`)
    .digest("hex")
    .slice(0, 10);

  return `chiikawa/${kind}/${sourceId}-${digest}`;
}

export function buildCloudinaryDeliveryUrl({
  publicId,
  resourceType = "image",
  transformation,
  format,
}: {
  publicId: string;
  resourceType?: CloudinaryResourceType;
  transformation?: string;
  format?: string | null;
}) {
  if (!isCloudinaryConfigured()) return null;

  const { cloudName } = getCloudinaryEnv();
  const transformationSegment = transformation ? `${transformation}/` : "";
  const extension = format ? `.${format}` : "";

  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformationSegment}${publicId}${extension}`;
}

export async function uploadFileToCloudinary({
  filePath,
  publicId,
  resourceType = "auto",
  filenameOverride,
}: {
  filePath: string;
  publicId: string;
  resourceType?: "auto" | CloudinaryResourceType;
  filenameOverride?: string;
}) {
  const client = ensureCloudinary();

  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
        unique_filename: false,
        filename_override: filenameOverride,
        use_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result as Record<string, unknown>);
      }
    );

    createReadStream(filePath).pipe(uploadStream);
  });
}

export async function uploadBufferToCloudinary({
  buffer,
  publicId,
  resourceType = "auto",
  filenameOverride,
}: {
  buffer: Buffer;
  publicId: string;
  resourceType?: "auto" | CloudinaryResourceType;
  filenameOverride?: string;
}) {
  const client = ensureCloudinary();

  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: true,
        unique_filename: false,
        filename_override: filenameOverride,
        use_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result as Record<string, unknown>);
      }
    );

    uploadStream.end(buffer);
  });
}

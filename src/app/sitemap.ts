import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const staticRoutes = [
    "",
    "/mobile",
    "/desktop",
    "/gif",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  return staticRoutes;
}

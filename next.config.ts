import type { NextConfig } from "next";

const supabaseStorageHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "r2.chiikawa-wallpaper.com",
      },
      {
        protocol: "https",
        hostname: "dw.chiikawa-wallpaper.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      ...(supabaseStorageHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseStorageHost,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;

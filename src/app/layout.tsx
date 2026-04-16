import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";

import { PublicRouteFrame } from "@/components/site/public-route-frame";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { getSiteUrl, getSupabaseUrl } from "@/lib/env";
import { getPrimaryRoutePrefetchManifest } from "@/lib/gallery";
import "./globals.css";

const displayFont = Baloo_2({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
});

const bodyFont = Nunito({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

const supabaseOrigin = getSupabaseUrl() ? new URL(getSupabaseUrl()).origin : null;
const cloudinaryOrigin = "https://res.cloudinary.com";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const prefetchManifest = await getPrimaryRoutePrefetchManifest();

  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${displayFont.variable} ${bodyFont.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        {supabaseOrigin ? (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        ) : null}
        <link rel="preconnect" href={cloudinaryOrigin} crossOrigin="" />
        <link rel="dns-prefetch" href={cloudinaryOrigin} />
      </head>
      <body className="min-h-full bg-[var(--color-cream)] text-slate-900">
        <PublicRouteFrame prefetchManifest={prefetchManifest}>
          {children}
        </PublicRouteFrame>
      </body>
    </html>
  );
}

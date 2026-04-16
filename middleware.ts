import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const galleryBasePaths = new Set(["/mobile", "/desktop", "/gif"]);

function parsePositiveInt(value: string | null | undefined, fallback = 1) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (galleryBasePaths.has(pathname)) {
    const page = parsePositiveInt(request.nextUrl.searchParams.get("page") ?? undefined, 1);

    if (page > 1) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `${pathname}/${page}`;
      redirectUrl.searchParams.delete("page");
      return NextResponse.redirect(redirectUrl);
    }

    if (request.nextUrl.searchParams.has("page")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.searchParams.delete("page");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/mobile",
    "/mobile/:path*",
    "/desktop",
    "/desktop/:path*",
    "/gif",
    "/gif/:path*",
  ],
};

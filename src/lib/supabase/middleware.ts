import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getPublicSupabaseEnv, isPublicSupabaseConfigured } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  if (!isPublicSupabaseConfigured()) {
    return NextResponse.next({
      request,
    });
  }

  const { url, anonKey } = getPublicSupabaseEnv();
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

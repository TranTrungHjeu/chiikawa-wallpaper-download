"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseEnv } from "@/lib/env";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    const { url, anonKey } = getPublicSupabaseEnv();
    client = createBrowserClient(url, anonKey);
  }

  return client;
}

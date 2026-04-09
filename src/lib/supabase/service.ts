import { createClient } from "@supabase/supabase-js";

import { getServiceSupabaseEnv } from "@/lib/env";
import type { UntypedDatabase } from "@/lib/supabase/database";

let serviceClient: ReturnType<typeof createClient<UntypedDatabase>> | null = null;

export function getSupabaseServiceClient() {
  if (!serviceClient) {
    const { url, serviceRoleKey } = getServiceSupabaseEnv();
    serviceClient = createClient<UntypedDatabase>(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serviceClient as ReturnType<typeof createClient<UntypedDatabase>>;
}

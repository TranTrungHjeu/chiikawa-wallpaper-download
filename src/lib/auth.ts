import { redirect } from "next/navigation";

import { isPublicSupabaseConfigured, isServiceSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function getAdminSession() {
  if (!isPublicSupabaseConfigured() || !isServiceSupabaseConfigured()) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const service = getSupabaseServiceClient();
  const { data: adminUser } = await service
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    return null;
  }

  return {
    user,
    adminUser,
  };
}

export async function requireAdminSession() {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    redirect("/admin/login");
  }

  return adminSession;
}

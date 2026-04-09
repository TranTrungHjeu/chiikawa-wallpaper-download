import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { isServiceSupabaseConfigured } from "@/lib/env";

async function main() {
  if (!isServiceSupabaseConfigured()) {
    throw new Error("Thiếu Supabase service role env.");
  }

  const email = process.env.ADMIN_SEED_EMAIL?.trim();
  const password = process.env.ADMIN_SEED_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error("Cần ADMIN_SEED_EMAIL và ADMIN_SEED_PASSWORD trong .env.");
  }

  const supabase = getSupabaseServiceClient();
  const { data: listedUsers, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) {
    throw listError;
  }

  const existingUser = listedUsers.users.find((user) => user.email === email);

  const authUser =
    existingUser ||
    (
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
    ).data.user;

  if (!authUser) {
    throw new Error("Không thể tạo hoặc tìm thấy admin user.");
  }

  const { error } = await supabase.from("admin_users").upsert({
    user_id: authUser.id,
    email,
    role: "admin",
  });

  if (error) {
    throw error;
  }

  console.log(`Admin ready: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

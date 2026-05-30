import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, tenant_id, full_name, email, phone, role, is_active")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login?error=profile_not_found");
  }

  return profile;
}

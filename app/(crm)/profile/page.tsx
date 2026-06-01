import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <ProfileForm
      initialProfile={{
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone ?? "",
        role: profile.role,
        tenant_id: profile.tenant_id,
        metadata: profile.metadata ?? {},
        created_at: profile.created_at,
      }}
    />
  );
}
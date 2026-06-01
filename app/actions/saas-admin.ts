"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/types/crm";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function ensureAdminRole(role: AppRole) {
  if (role !== "platform_admin" && role !== "admin") {
    throw new Error("No tienes permisos para realizar esta acción.");
  }
}

async function findAuthUserByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string
) {
  const normalizedEmail = normalizeEmail(email);
  const perPage = 1000;

  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(error.message);
    }

    const found = data.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail
    );

    if (found) return found;

    if (data.users.length < perPage) return null;
  }

  return null;
}

export async function createCompanyAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const role = profile.role as AppRole;

  if (role !== "platform_admin") {
    throw new Error("Solo el administrador SaaS puede crear empresas.");
  }

  const admin = createAdminClient();

  const name = getString(formData, "name");
  const legalName = getString(formData, "legal_name");
  const nit = getString(formData, "nit");
  const country = getString(formData, "country") || "Colombia";
  const city = getString(formData, "city");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");

  if (!name) {
    throw new Error("El nombre de la empresa es obligatorio.");
  }

  const { error } = await admin.from("tenants").insert({
    name,
    legal_name: legalName || null,
    nit: nit || null,
    country,
    city: city || null,
    email: email || null,
    phone: phone || null,
    is_active: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/companies");
  redirect("/companies");
}

export async function createSaasUserAction(formData: FormData) {
  const profile = await getCurrentProfile();
  const currentRole = profile.role as AppRole;

  ensureAdminRole(currentRole);

  const admin = createAdminClient();

  const fullName = getString(formData, "full_name");
  const email = normalizeEmail(getString(formData, "email"));
  const phone = getString(formData, "phone");
  const password = getString(formData, "password");
  const requestedRole = getString(formData, "role") as AppRole;
  const requestedTenantId = getString(formData, "tenant_id");

  if (!fullName) {
    throw new Error("El nombre completo es obligatorio.");
  }

  if (!email) {
    throw new Error("El correo es obligatorio.");
  }

  if (password.length < 8) {
    throw new Error("La contraseña temporal debe tener mínimo 8 caracteres.");
  }

  const allowedRolesForPlatformAdmin: AppRole[] = [
    "admin",
    "commercial_lead",
    "seller",
  ];

  const allowedRolesForTenantAdmin: AppRole[] = [
    "commercial_lead",
    "seller",
  ];

  const allowedRoles =
    currentRole === "platform_admin"
      ? allowedRolesForPlatformAdmin
      : allowedRolesForTenantAdmin;

  if (!allowedRoles.includes(requestedRole)) {
    throw new Error("No puedes asignar ese rol.");
  }

  const tenantId =
    currentRole === "platform_admin" ? requestedTenantId : profile.tenant_id;

  if (!tenantId) {
    throw new Error("Debes seleccionar una empresa.");
  }

  if (currentRole === "admin" && tenantId !== profile.tenant_id) {
    throw new Error("No puedes crear usuarios en otra empresa.");
  }

  const existingUser = await findAuthUserByEmail(admin, email);

  let authUserId: string;

  if (existingUser) {
    authUserId = existingUser.id;

    const { error: updateAuthError } =
      await admin.auth.admin.updateUserById(authUserId, {
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

    if (updateAuthError) {
      throw new Error(updateAuthError.message);
    }
  } else {
    const { data, error: createAuthError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
        },
      });

    if (createAuthError) {
      throw new Error(createAuthError.message);
    }

    if (!data.user) {
      throw new Error("No se pudo crear el usuario en Supabase Auth.");
    }

    authUserId = data.user.id;
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: authUserId,
      tenant_id: tenantId,
      full_name: fullName,
      email,
      phone: phone || null,
      role: requestedRole,
      is_active: true,
      metadata: {},
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    }
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  revalidatePath("/users");
  revalidatePath("/settings");
  redirect("/users");
}
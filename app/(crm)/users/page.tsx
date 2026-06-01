import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_ROLES } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import type { AppRole } from "@/types/crm";

function getRoleLabel(role: string) {
  return APP_ROLES.find((item) => item.value === role)?.label ?? role;
}

function getTenantName(user: any) {
  if (Array.isArray(user.tenants)) {
    return user.tenants[0]?.name ?? "Sin empresa";
  }

  return user.tenants?.name ?? "Sin empresa";
}

export default async function UsersPage() {
  const profile = await getCurrentProfile();
  const role = profile.role as AppRole;

  if (role !== "platform_admin" && role !== "admin") {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select(
      "id, tenant_id, full_name, email, phone, role, is_active, created_at, tenants(name)"
    )
    .order("created_at", { ascending: false });

  if (role === "admin") {
    query = query.eq("tenant_id", profile.tenant_id);
  }

  const { data: users, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Usuarios</h2>
          <p className="mt-1 text-slate-500">
            Crea usuarios, asígnalos a empresas y define sus roles.
          </p>
        </div>

        <ButtonLink href="/users/new">Crear usuario</ButtonLink>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Empresa</th>
                <th className="px-5 py-4">Rol</th>
                <th className="px-5 py-4">Teléfono</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Creado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-950">
                      {user.full_name}
                    </div>
                    <div className="text-slate-500">{user.email}</div>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {getTenantName(user)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {getRoleLabel(user.role)}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {user.phone || "Sin teléfono"}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {user.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}

              {!users?.length && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>
                    No hay usuarios creados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
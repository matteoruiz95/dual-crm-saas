import { redirect } from "next/navigation";
import { createSaasUserAction } from "@/app/actions/saas-admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_ROLES } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/types/crm";

export default async function NewUserPage() {
  const profile = await getCurrentProfile();
  const role = profile.role as AppRole;

  if (role !== "platform_admin" && role !== "admin") {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  let companiesQuery = admin
    .from("tenants")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("name");

  if (role === "admin") {
    companiesQuery = companiesQuery.eq("id", profile.tenant_id);
  }

  const { data: companies, error } = await companiesQuery;

  if (error) {
    throw new Error(error.message);
  }

  const availableRoles =
    role === "platform_admin"
      ? APP_ROLES.filter((item) =>
          ["admin", "commercial_lead", "seller"].includes(item.value)
        )
      : APP_ROLES.filter((item) =>
          ["commercial_lead", "seller"].includes(item.value)
        );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Crear usuario</h2>
        <p className="mt-1 text-slate-500">
          Crea un usuario, asígnale empresa, rol y contraseña temporal.
        </p>
      </div>

      <Card>
        <form action={createSaasUserAction} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nombre completo
              </label>
              <input
                name="full_name"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                placeholder="Ej: Laura Ruiz"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Correo
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                placeholder="usuario@empresa.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Teléfono / WhatsApp
              </label>
              <input
                name="phone"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                placeholder="+57 300 000 0000"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Contraseña temporal
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Empresa
              </label>
              <select
                name="tenant_id"
                required
                defaultValue={companies?.[0]?.id ?? ""}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
              >
                <option value="" disabled>
                  Selecciona una empresa
                </option>

                {companies?.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Rol
              </label>
              <select
                name="role"
                required
                defaultValue="seller"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
              >
                {availableRoles.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            El usuario podrá cambiar esta contraseña desde el módulo{" "}
            <strong>Mi perfil</strong>.
          </div>

          <div className="flex justify-end">
            <Button type="submit">Crear usuario</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
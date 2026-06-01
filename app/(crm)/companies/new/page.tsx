import { redirect } from "next/navigation";
import { createCompanyAction } from "@/app/actions/saas-admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export default async function NewCompanyPage() {
  const profile = await getCurrentProfile();

  if (profile.role !== "platform_admin") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-950">Crear empresa</h2>
        <p className="mt-1 text-slate-500">
          Registra una nueva empresa dentro del SaaS.
        </p>
      </div>

      <Card>
        <form action={createCompanyAction} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nombre comercial
              </label>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                placeholder="Ej: Dual Developments"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Razón social
              </label>
              <input
                name="legal_name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                placeholder="Ej: Dual Developments SAS"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                NIT / Tax ID
              </label>
              <input
                name="nit"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                placeholder="Ej: 901606794-1"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                País
              </label>
              <input
                name="country"
                defaultValue="Colombia"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Ciudad
              </label>
              <input
                name="city"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                placeholder="Ej: Medellín"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Correo principal
              </label>
              <input
                name="email"
                type="email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                placeholder="correo@empresa.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Teléfono
              </label>
              <input
                name="phone"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-dual-purple"
                placeholder="+57 300 000 0000"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Crear empresa</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
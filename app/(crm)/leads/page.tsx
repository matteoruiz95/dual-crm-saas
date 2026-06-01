import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { currency, formatDate } from "@/lib/utils";
import { LEAD_STATUS } from "@/lib/constants";

type ResponsibleProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

function getResponsible(
  responsible: ResponsibleProfile | ResponsibleProfile[] | null
) {
  if (Array.isArray(responsible)) {
    return responsible[0] ?? null;
  }

  return responsible;
}

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select(`
      id,
      name,
      company,
      email,
      phone,
      stage,
      status,
      estimated_value_cop,
      estimated_value_usd,
      responsible_user_id,
      created_at,
      next_action_at,
      responsible:profiles!leads_responsible_user_id_fkey (
        id,
        full_name,
        email,
        role
      )
    `)
    .eq("stage", "lead")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Leads</h2>
          <p className="mt-1 text-slate-500">
            Contactos comerciales iniciales.
          </p>
        </div>

        <ButtonLink href="/leads/new">Crear lead</ButtonLink>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Lead</th>
                <th className="px-5 py-4">Contacto</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Responsable</th>
                <th className="px-5 py-4">Valor</th>
                <th className="px-5 py-4">Creado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {leads?.map((lead) => {
                const responsible = getResponsible(lead.responsible);

                return (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-semibold text-slate-950 hover:text-dual-purple"
                      >
                        {lead.name}
                      </Link>
                      <div className="text-slate-500">
                        {lead.company || "Sin empresa"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <div>{lead.email || "Sin correo"}</div>
                      <div>{lead.phone || "Sin teléfono"}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {LEAD_STATUS.find(
                          (status) => status.value === lead.status
                        )?.label ?? lead.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {responsible?.full_name || "Sin responsable"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {responsible?.email || "Sin correo"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        {currency(
                          Number(lead.estimated_value_cop ?? 0),
                          "COP"
                        )}
                      </div>
                      <div className="text-slate-500">
                        {currency(
                          Number(lead.estimated_value_usd ?? 0),
                          "USD"
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(lead.created_at)}
                    </td>
                  </tr>
                );
              })}

              {!leads?.length && (
                <tr>
                  <td
                    className="px-5 py-8 text-center text-slate-500"
                    colSpan={6}
                  >
                    No hay leads creados.
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
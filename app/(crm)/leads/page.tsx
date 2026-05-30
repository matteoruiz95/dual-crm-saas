import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { currency, formatDate } from "@/lib/utils";
import { LEAD_STATUS } from "@/lib/constants";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, name, company, email, phone, stage, status, estimated_value_cop, estimated_value_usd, created_at, next_action_at")
    .eq("stage", "lead")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Leads</h2>
          <p className="mt-1 text-slate-500">Contactos comerciales iniciales.</p>
        </div>
        <ButtonLink href="/leads/new">Crear lead</ButtonLink>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Lead</th>
              <th className="px-5 py-4">Contacto</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Valor</th>
              <th className="px-5 py-4">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads?.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link href={`/leads/${lead.id}`} className="font-semibold text-slate-950 hover:text-dual-purple">{lead.name}</Link>
                  <div className="text-slate-500">{lead.company || "Sin empresa"}</div>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  <div>{lead.email || "Sin correo"}</div>
                  <div>{lead.phone || "Sin teléfono"}</div>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {LEAD_STATUS.find((status) => status.value === lead.status)?.label ?? lead.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div>{currency(Number(lead.estimated_value_cop ?? 0), "COP")}</div>
                  <div className="text-slate-500">{currency(Number(lead.estimated_value_usd ?? 0), "USD")}</div>
                </td>
                <td className="px-5 py-4 text-slate-500">{formatDate(lead.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
